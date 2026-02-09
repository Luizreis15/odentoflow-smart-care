import jsPDF from "jspdf";
import { formatCurrency, formatCNPJ, formatCPF, formatPhone } from "@/lib/utils";

export interface ReciboData {
  titleNumber: number;
  installmentNumber: number;
  totalInstallments: number;
  patientName: string;
  patientCpf?: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  clinicName: string;
  clinicCnpj?: string;
  clinicPhone?: string;
  clinicAddress?: string;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao_debito: "Cartão de Débito",
  cartao_credito: "Cartão de Crédito",
  transferencia: "Transferência Bancária",
  boleto: "Boleto",
  cheque: "Cheque",
};

function valorPorExtenso(valor: number): string {
  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const especiais = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  if (valor === 0) return "zero reais";

  const parteInteira = Math.floor(valor);
  const centavos = Math.round((valor - parteInteira) * 100);

  function converterGrupo(n: number): string {
    if (n === 0) return "";
    if (n === 100) return "cem";
    
    const parts: string[] = [];
    const c = Math.floor(n / 100);
    const resto = n % 100;
    const d = Math.floor(resto / 10);
    const u = resto % 10;

    if (c > 0) parts.push(centenas[c]);
    if (resto >= 10 && resto < 20) {
      parts.push(especiais[resto - 10]);
    } else {
      if (d > 0) parts.push(dezenas[d]);
      if (u > 0) parts.push(unidades[u]);
    }
    return parts.join(" e ");
  }

  const partes: string[] = [];

  if (parteInteira > 0) {
    const milhares = Math.floor(parteInteira / 1000);
    const resto = parteInteira % 1000;

    if (milhares > 0) {
      partes.push(milhares === 1 ? "mil" : `${converterGrupo(milhares)} mil`);
    }
    if (resto > 0) {
      partes.push(converterGrupo(resto));
    }

    const reaisStr = partes.join(milhares > 0 && resto > 0 && resto < 100 ? " e " : " ");
    const resultado = parteInteira === 1 ? `${reaisStr} real` : `${reaisStr} reais`;

    if (centavos > 0) {
      const centavosStr = converterGrupo(centavos);
      return `${resultado} e ${centavosStr} ${centavos === 1 ? "centavo" : "centavos"}`;
    }
    return resultado;
  }

  const centavosStr = converterGrupo(centavos);
  return `${centavosStr} ${centavos === 1 ? "centavo" : "centavos"}`;
}

export function generateRecibo(data: ReciboData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 25;

  // ====== HEADER ======
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(data.clinicName.toUpperCase(), pageWidth / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const headerLines: string[] = [];
  if (data.clinicCnpj) headerLines.push(`CNPJ: ${formatCNPJ(data.clinicCnpj)}`);
  if (data.clinicPhone) headerLines.push(`Tel: ${formatPhone(data.clinicPhone)}`);
  if (data.clinicAddress) headerLines.push(data.clinicAddress);
  
  if (headerLines.length > 0) {
    doc.text(headerLines.join("  |  "), pageWidth / 2, y, { align: "center" });
    y += 5;
  }

  // Separator line
  y += 3;
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  // ====== TITLE ======
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("RECIBO DE PAGAMENTO", pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Nº ${String(data.titleNumber).padStart(4, "0")}`, pageWidth / 2, y, { align: "center" });
  y += 15;

  // ====== BODY ======
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  // Recebi de
  doc.setFont("helvetica", "bold");
  doc.text("Recebi de:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.patientName, margin + 28, y);
  y += 7;

  // CPF
  if (data.patientCpf) {
    doc.setFont("helvetica", "bold");
    doc.text("CPF:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(formatCPF(data.patientCpf), margin + 13, y);
    y += 7;
  }

  y += 5;

  // Valor
  doc.setFont("helvetica", "bold");
  doc.text("A quantia de:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(formatCurrency(data.amount), margin + 35, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text(`(${valorPorExtenso(data.amount)})`, margin, y);
  y += 10;

  // Referente a
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Referente a:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Tratamento odontológico — Parcela ${data.installmentNumber}/${data.totalInstallments} — Título #${data.titleNumber}`,
    margin + 30,
    y,
    { maxWidth: contentWidth - 30 }
  );
  y += 10;

  // Forma de pagamento
  doc.setFont("helvetica", "bold");
  doc.text("Forma de pagamento:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(PAYMENT_METHOD_LABELS[data.paymentMethod] || data.paymentMethod, margin + 50, y);
  y += 7;

  // Data
  doc.setFont("helvetica", "bold");
  doc.text("Data do pagamento:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(data.paymentDate + "T12:00:00").toLocaleDateString("pt-BR"), margin + 47, y);
  y += 25;

  // ====== SIGNATURE ======
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  const sigLineStart = pageWidth / 2 - 50;
  const sigLineEnd = pageWidth / 2 + 50;
  doc.line(sigLineStart, y, sigLineEnd, y);
  y += 5;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Assinatura", pageWidth / 2, y, { align: "center" });
  y += 20;

  // ====== FOOTER ======
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const now = new Date();
  doc.text(
    `Gerado em ${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    margin,
    y
  );
  doc.text("Documento sem valor fiscal", pageWidth - margin, y, { align: "right" });

  // Open PDF in new tab
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, "_blank");
}
