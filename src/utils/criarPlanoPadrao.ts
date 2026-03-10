import { supabase } from "@/integrations/supabase/client";

export const criarPlanoPadrao = async (clinicaId: string): Promise<boolean> => {
  try {
    // Check if clinic already has a default plan
    const { data: existing } = await supabase
      .from("planos_procedimentos")
      .select("id")
      .eq("clinica_id", clinicaId)
      .eq("is_padrao", true)
      .maybeSingle();

    if (existing) return true;

    // Create the default plan
    const { data: plano, error: planoError } = await supabase
      .from("planos_procedimentos")
      .insert({
        clinica_id: clinicaId,
        nome: "Tabela Padrão",
        is_padrao: true,
        ativo: true,
        percentual_ajuste: 0,
      })
      .select("id")
      .single();

    if (planoError || !plano) {
      console.error("Erro ao criar plano padrão:", planoError);
      return false;
    }

    // Fetch all base procedures
    const { data: procedimentos, error: procError } = await supabase
      .from("procedimentos")
      .select("id, valor");

    if (procError || !procedimentos) {
      console.error("Erro ao buscar procedimentos:", procError);
      return false;
    }

    // Insert in batches of 500 to avoid payload limits
    const batchSize = 500;
    for (let i = 0; i < procedimentos.length; i += batchSize) {
      const batch = procedimentos.slice(i, i + batchSize).map((p) => ({
        plano_id: plano.id,
        procedimento_id: p.id,
        valor_customizado: p.valor,
      }));

      const { error: itensError } = await supabase
        .from("planos_procedimentos_itens")
        .insert(batch);

      if (itensError) {
        console.error("Erro ao inserir itens do plano padrão:", itensError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Erro ao criar plano padrão:", error);
    return false;
  }
};
