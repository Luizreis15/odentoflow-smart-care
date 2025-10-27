import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Mapping of product IDs to plan names
const PRODUCT_MAP: Record<string, string> = {
  "prod_TJWbnb78Lpmlcp": "starter",
  "prod_TJWdot89sJXFYW": "pro",
  "prod_TJWfEYa5roNk9Z": "enterprise",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, unsubscribed state");
      return new Response(
        JSON.stringify({ 
          subscribed: false,
          status: "no_subscription",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
      expand: ["data.items.data.price.product"],
    });

    if (subscriptions.data.length === 0) {
      logStep("No subscription found");
      return new Response(
        JSON.stringify({
          subscribed: false,
          status: "no_subscription",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const subscription = subscriptions.data[0];
    const productId = subscription.items.data[0].price.product as string;
    const planName = PRODUCT_MAP[productId] || "unknown";
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const isActive = ["active", "trialing"].includes(subscription.status);

    logStep("Subscription found", {
      subscriptionId: subscription.id,
      status: subscription.status,
      plan: planName,
      endDate: subscriptionEnd,
    });

    // Update clinica if exists
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    if (profile?.clinic_id) {
      await supabaseClient
        .from("clinicas")
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          plano: planName,
          status_assinatura: subscription.status,
          current_period_end: subscriptionEnd,
        })
        .eq("id", profile.clinic_id);
      
      logStep("Clinica updated with subscription data");
    }

    return new Response(
      JSON.stringify({
        subscribed: isActive,
        status: subscription.status,
        plan: planName,
        product_id: productId,
        subscription_end: subscriptionEnd,
        trial_end: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString() 
          : null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
