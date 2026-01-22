import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============= FORMATAÇÃO DE MOEDA =============
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Versão sem símbolo R$ (útil para inputs)
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0,00";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ============= FORMATAÇÃO DE CPF =============
// Input: "12345678900" → Output: "123.456.789-00"
export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return "";
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// ============= FORMATAÇÃO DE CNPJ =============
// Input: "12345678000199" → Output: "12.345.678/0001-99"
export function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return "";
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

// ============= FORMATAÇÃO DE TELEFONE =============
// Detecta automaticamente se é fixo ou celular
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length === 11) {
    // Celular: (XX) XXXXX-XXXX
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (cleaned.length === 10) {
    // Fixo: (XX) XXXX-XXXX
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  
  return phone;
}

// ============= PARSE DE VALORES =============
export function parseCurrency(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d,-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}
