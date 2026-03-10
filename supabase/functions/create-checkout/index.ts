import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Yampi plan SKU IDs - configure these in Yampi dashboard
const PLAN_SKUS: Record<string, { sku_id: number; name: string }> = {
  solo: { sku_id: 0, name: "Plano Solo" },
  crescimento: { sku_id: 0, name: "Plano Crescimento" },
  premium: { sku_id: 0, name: "Plano Premium" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { plan } = await req.json();
    if (!plan || !PLAN_SKUS[plan]) {
      throw new Error("Invalid plan specified");
    }

    logStep("Plan selected", { plan });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Yampi API credentials
    const yampiAlias = Deno.env.get("YAMPI_ALIAS");
    const yampiToken = Deno.env.get("YAMPI_TOKEN");
    const yampiSecretKey = Deno.env.get("YAMPI_SECRET_KEY");

    if (!yampiAlias || !yampiToken || !yampiSecretKey) {
      throw new Error("Yampi credentials not configured");
    }

    const planConfig = PLAN_SKUS[plan];
    if (planConfig.sku_id === 0) {
      throw new Error(`SKU ID not configured for plan: ${plan}. Configure PLAN_SKUS in create-checkout function.`);
    }

    // Create Yampi payment link
    const origin = req.headers.get("origin") || "https://odentoflow-smart-care.lovable.app";

    const yampiResponse = await fetch(
      `https://api.dooki.com.br/v2/${yampiAlias}/checkout/payment-link`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Token": yampiToken,
          "User-Secret-Key": yampiSecretKey,
        },
        body: JSON.stringify({
          name: `${planConfig.name} - ${user.email}`,
          active: true,
          skus: [
            {
              id: planConfig.sku_id,
              quantity: 1,
            },
          ],
          metadata: {
            user_id: user.id,
            user_email: user.email,
            plan: plan,
          },
        }),
      }
    );

    if (!yampiResponse.ok) {
      const errorBody = await yampiResponse.text();
      throw new Error(`Yampi API error [${yampiResponse.status}]: ${errorBody}`);
    }

    const yampiData = await yampiResponse.json();
    const checkoutUrl = yampiData?.data?.url || yampiData?.data?.checkout_url;

    if (!checkoutUrl) {
      logStep("Yampi response", yampiData);
      throw new Error("No checkout URL returned from Yampi");
    }

    logStep("Checkout link created", { url: checkoutUrl });

    return new Response(JSON.stringify({ url: checkoutUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
