import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApproveRequest {
  budget_id: string;
  approved_by: string;
}

interface PaymentPlan {
  entrada?: number;
  parcelas: number;
  vencimentos: string[];
  metodo?: string;
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

    const { budget_id, approved_by }: ApproveRequest = await req.json();

    if (!budget_id || !approved_by) {
      return new Response(
        JSON.stringify({ error: "budget_id and approved_by are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch budget with items
    const { data: budget, error: budgetError } = await supabase
      .from("budgets")
      .select(`
        *,
        budget_items(*),
        patients(id, full_name, clinic_id)
      `)
      .eq("id", budget_id)
      .single();

    if (budgetError || !budget) {
      return new Response(
        JSON.stringify({ error: "Budget not found", details: budgetError }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Validate budget can be approved
    if (budget.status === "approved" || budget.status === "converted") {
      return new Response(
        JSON.stringify({ error: "Budget already approved or converted" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!budget.budget_items || budget.budget_items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Budget has no items" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Parse payment plan
    const paymentPlan: PaymentPlan = budget.payment_plan || { parcelas: 1, vencimentos: [] };
    const totalValue = budget.final_value || budget.total_value || 0;
    const clinicId = budget.clinic_id;
    const patientId = budget.patient_id;

    // Generate installment dates if not provided
    if (!paymentPlan.vencimentos || paymentPlan.vencimentos.length === 0) {
      const today = new Date();
      paymentPlan.vencimentos = [];
      for (let i = 0; i < (paymentPlan.parcelas || 1); i++) {
        const dueDate = new Date(today);
        dueDate.setMonth(dueDate.getMonth() + i);
        paymentPlan.vencimentos.push(dueDate.toISOString().split("T")[0]);
      }
    }

    // 4. Create treatment
    const { data: treatment, error: treatmentError } = await supabase
      .from("treatments")
      .insert({
        patient_id: patientId,
        clinic_id: clinicId,
        budget_id: budget_id,
        name: budget.title || "Tratamento",
        value: totalValue,
        status: "planned",
        observations: budget.notes,
      })
      .select()
      .single();

    if (treatmentError) {
      console.error("Error creating treatment:", treatmentError);
      return new Response(
        JSON.stringify({ error: "Failed to create treatment", details: treatmentError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Create treatment_items from budget_items
    const treatmentItems = budget.budget_items.map((item: any) => ({
      treatment_id: treatment.id,
      budget_item_id: item.id,
      procedure_id: item.procedure_id || null,
      professional_id: item.professional_id,
      tooth_number: item.tooth_number ? parseInt(item.tooth_number) : null,
      tooth_region: item.tooth_region,
      tooth_faces: item.tooth_faces,
      status: "planned",
      price: item.total_price,
      notes: item.notes,
    }));

    const { error: itemsError } = await supabase
      .from("treatment_items")
      .insert(treatmentItems);

    if (itemsError) {
      console.error("Error creating treatment items:", itemsError);
      // Continue anyway, treatment was created
    }

    // 6. Create receivable_titles (parcelas)
    const numParcelas = paymentPlan.parcelas || 1;
    const entrada = paymentPlan.entrada || 0;
    const valorRestante = totalValue - entrada;
    const valorParcela = numParcelas > 0 ? valorRestante / numParcelas : 0;

    const titlesToCreate = [];

    // Create entry payment title if entrada > 0
    if (entrada > 0) {
      titlesToCreate.push({
        clinic_id: clinicId,
        patient_id: patientId,
        budget_id: budget_id,
        installment_number: 0,
        total_installments: numParcelas + 1,
        due_date: new Date().toISOString().split("T")[0],
        amount: entrada,
        balance: entrada,
        status: "open",
        origin: "budget",
        payment_method: paymentPlan.metodo || null,
        notes: "Entrada",
      });
    }

    // Create installment titles
    for (let i = 0; i < numParcelas; i++) {
      const dueDate = paymentPlan.vencimentos[i] || new Date().toISOString().split("T")[0];
      titlesToCreate.push({
        clinic_id: clinicId,
        patient_id: patientId,
        budget_id: budget_id,
        installment_number: i + 1,
        total_installments: numParcelas + (entrada > 0 ? 1 : 0),
        due_date: dueDate,
        amount: valorParcela,
        balance: valorParcela,
        status: "open",
        origin: "budget",
        payment_method: paymentPlan.metodo || null,
        notes: `Parcela ${i + 1}/${numParcelas}`,
      });
    }

    const { data: titles, error: titlesError } = await supabase
      .from("receivable_titles")
      .insert(titlesToCreate)
      .select();

    if (titlesError) {
      console.error("Error creating titles:", titlesError);
      return new Response(
        JSON.stringify({ error: "Failed to create payment titles", details: titlesError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Create commission entries (provisões) for each professional using commission rules
    const commissionEntries = [];
    for (const item of budget.budget_items) {
      if (item.professional_id) {
        // Buscar regra de comissão específica para este profissional/procedimento
        // Prioridade: regra específica (prof + proc) > regra do profissional > regra do procedimento > regra geral
        let commissionRule = null;
        
        // 1. Tentar encontrar regra específica (profissional + procedimento)
        const { data: specificRule } = await supabase
          .from("commission_rules")
          .select("*")
          .eq("clinic_id", clinicId)
          .eq("profissional_id", item.professional_id)
          .eq("procedure_id", item.procedure_id)
          .eq("ativo", true)
          .eq("gatilho", "aprovacao")
          .single();
        
        if (specificRule) {
          commissionRule = specificRule;
        } else {
          // 2. Tentar regra só do profissional
          const { data: profRule } = await supabase
            .from("commission_rules")
            .select("*")
            .eq("clinic_id", clinicId)
            .eq("profissional_id", item.professional_id)
            .is("procedure_id", null)
            .eq("ativo", true)
            .eq("gatilho", "aprovacao")
            .single();
          
          if (profRule) {
            commissionRule = profRule;
          } else {
            // 3. Tentar regra geral (sem profissional específico)
            const { data: generalRule } = await supabase
              .from("commission_rules")
              .select("*")
              .eq("clinic_id", clinicId)
              .is("profissional_id", null)
              .is("procedure_id", null)
              .eq("ativo", true)
              .eq("gatilho", "aprovacao")
              .single();
            
            if (generalRule) {
              commissionRule = generalRule;
            }
          }
        }

        // Calcular comissão baseado na regra encontrada ou usar padrão 30%
        let commissionAmount = 0;
        const baseValue = item.total_price || 0;
        
        if (commissionRule) {
          if (commissionRule.tipo_calculo === "percentual") {
            commissionAmount = baseValue * ((commissionRule.percentual || 30) / 100);
          } else {
            commissionAmount = commissionRule.valor_fixo || 0;
          }
          
          // Aplicar mínimo garantido e teto
          if (commissionRule.minimo_garantido && commissionAmount < commissionRule.minimo_garantido) {
            commissionAmount = commissionRule.minimo_garantido;
          }
          if (commissionRule.teto && commissionAmount > commissionRule.teto) {
            commissionAmount = commissionRule.teto;
          }
        } else {
          // Sem regra: usar padrão de 30%
          commissionAmount = baseValue * 0.30;
        }

        if (commissionAmount > 0) {
          commissionEntries.push({
            clinic_id: clinicId,
            profissional_id: item.professional_id,
            competencia: new Date().toISOString().slice(0, 7), // YYYY-MM
            valor_provisionado: commissionAmount,
            valor_devido: commissionAmount,
            status: "provisao",
            observacoes: `Orçamento ${budget.title || budget_id} - ${item.procedure_name}`,
          });
        }
      }
    }

    if (commissionEntries.length > 0) {
      const { error: commError } = await supabase
        .from("comissoes_provisoes")
        .insert(commissionEntries);

      if (commError) {
        console.error("Error creating commission entries:", commError);
        // Continue anyway
      }
    }

    // 8. Update budget status to approved
    const { error: updateError } = await supabase
      .from("budgets")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: approved_by,
      })
      .eq("id", budget_id);

    if (updateError) {
      console.error("Error updating budget status:", updateError);
    }

    // 9. Log audit
    await supabase.from("audit_logs").insert({
      user_id: approved_by,
      acao: "approve_budget",
      modulo: "budgets",
      detalhes: {
        budget_id,
        treatment_id: treatment.id,
        titles_created: titles?.length || 0,
        total_value: totalValue,
      },
      resultado: "success",
    });

    return new Response(
      JSON.stringify({
        success: true,
        treatment_id: treatment.id,
        titles: titles || [],
        message: `Budget approved. Treatment created with ${titles?.length || 0} payment titles.`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in approve-budget:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
