import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  title_id: string;
  amount: number;
  paid_at?: string;
  method: string;
  cash_account_id?: string;
  notes?: string;
  created_by: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: PaymentRequest = await req.json();
    const { title_id, amount, paid_at, method, cash_account_id, notes, created_by } = body;

    if (!title_id || !amount || !method || !created_by) {
      return new Response(
        JSON.stringify({ error: "title_id, amount, method, and created_by are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch the receivable title
    const { data: title, error: titleError } = await supabase
      .from("receivable_titles")
      .select("*")
      .eq("id", title_id)
      .single();

    if (titleError || !title) {
      return new Response(
        JSON.stringify({ error: "Title not found", details: titleError }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Validate payment amount
    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Payment amount must be positive" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (amount > title.balance) {
      return new Response(
        JSON.stringify({ error: `Payment amount (${amount}) exceeds balance (${title.balance})` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (title.status === "paid" || title.status === "cancelled") {
      return new Response(
        JSON.stringify({ error: `Title is already ${title.status}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paymentDate = paid_at || new Date().toISOString();

    // 3. Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        patient_id: title.patient_id,
        title_id: title_id,
        payment_date: paymentDate,
        payment_method: method,
        value: amount,
        cash_account_id: cash_account_id || null,
        notes: notes || null,
        created_by: created_by,
        status: "completed",
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment:", paymentError);
      return new Response(
        JSON.stringify({ error: "Failed to create payment", details: paymentError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Update title balance and status
    const newBalance = title.balance - amount;
    const newStatus = newBalance <= 0 ? "paid" : "partial";

    const { error: updateTitleError } = await supabase
      .from("receivable_titles")
      .update({
        balance: newBalance,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", title_id);

    if (updateTitleError) {
      console.error("Error updating title:", updateTitleError);
    }

    // 5. Create financial transaction for cash flow
    const { error: transactionError } = await supabase
      .from("financial_transactions")
      .insert({
        clinic_id: title.clinic_id,
        date: paymentDate.split("T")[0],
        type: "receita",
        value: amount,
        category: "Recebimento de Tratamento",
        reference: `Pagamento título #${title.title_number} - Parcela ${title.installment_number}/${title.total_installments}`,
      });

    if (transactionError) {
      console.error("Error creating financial transaction:", transactionError);
    }

    // 6. Update commissions if title is fully paid
    if (newStatus === "paid" && title.budget_id) {
      // Get budget items to find professionals
      const { data: budgetItems } = await supabase
        .from("budget_items")
        .select("professional_id, total_price")
        .eq("budget_id", title.budget_id);

      if (budgetItems && budgetItems.length > 0) {
        // Calculate proportional payment for each professional's commission
        const titlePercentage = title.amount / (await getTotalBudgetValue(supabase, title.budget_id));
        
        for (const item of budgetItems) {
          if (item.professional_id) {
            // Update commission status from provisao to payable
            const { error: commError } = await supabase
              .from("comissoes_provisoes")
              .update({
                status: "a_pagar",
                updated_at: new Date().toISOString(),
              })
              .eq("profissional_id", item.professional_id)
              .eq("status", "provisao")
              .ilike("observacoes", `%${title.budget_id}%`);

            if (commError) {
              console.error("Error updating commission:", commError);
            }
          }
        }
      }
    }

    // 7. Log audit
    await supabase.from("audit_logs").insert({
      user_id: created_by,
      acao: "record_payment",
      modulo: "financeiro",
      detalhes: {
        title_id,
        payment_id: payment.id,
        amount,
        method,
        new_balance: newBalance,
        new_status: newStatus,
      },
      resultado: "success",
    });

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment.id,
        title_status: newStatus,
        title_balance: newBalance,
        message: `Payment of ${amount} recorded. Title balance: ${newBalance}`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in record-payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getTotalBudgetValue(supabase: any, budgetId: string): Promise<number> {
  const { data } = await supabase
    .from("budgets")
    .select("final_value, total_value")
    .eq("id", budgetId)
    .single();
  
  return data?.final_value || data?.total_value || 0;
}
