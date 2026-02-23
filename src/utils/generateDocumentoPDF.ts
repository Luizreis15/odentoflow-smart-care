import jsPDF from "jspdf";

export interface DocumentoPDFData {
  tipo: "atestado" | "receituario";
  title: string;
  content: string;
  // Clinic
  clinicName: string;
  clinicCnpj?: string;
  clinicPhone?: string;
  clinicAddress?: string;
  clinicEmail?: string;
  clinicWhatsapp?: string;
  clinicLogoUrl?: string;
  clinicCity?: string;
  // Professional
  professionalName?: string;
  professionalCro?: string;
  professionalEspecialidade?: string;
  // Document ID
  documentId?: string;
  createdAt?: string;
}

// A4 dimensions in mm
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_TOP = 30;
const MARGIN_BOTTOM = 25;
const MARGIN_X = 25;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

// Colors
const COLOR_BLACK: [number, number, number] = [30, 30, 30];
const COLOR_GRAY: [number, number, number] = [120, 120, 120];
const COLOR_LIGHT: [number, number, number] = [180, 180, 180];
const COLOR_PRIMARY: [number, number, number] = [34, 87, 122]; // Elegant teal

function drawThinLine(doc: jsPDF, y: number, color: [number, number, number] = COLOR_LIGHT) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
}

function drawElegantLine(doc: jsPDF, y: number) {
  doc.setDrawColor(...COLOR_PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
  doc.setLineWidth(0.15);
  doc.line(MARGIN_X, y + 1.5, PAGE_W - MARGIN_X, y + 1.5);
}

async function loadImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawWatermark(doc: jsPDF, logoBase64: string | null) {
  if (!logoBase64) return;
  doc.saveGraphicsState();
  // @ts-ignore - jsPDF supports GState
  doc.setGState(new doc.GState({ opacity: 0.04 }));
  const wmSize = 80;
  const x = (PAGE_W - wmSize) / 2;
  const y = (PAGE_H - wmSize) / 2;
  try {
    doc.addImage(logoBase64, "PNG", x, y, wmSize, wmSize);
  } catch {
    // Ignore watermark errors
  }
  doc.restoreGraphicsState();
}

function drawHeader(doc: jsPDF, data: DocumentoPDFData, logoBase64: string | null): number {
  let y = MARGIN_TOP;

  const logoSize = 18;

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", MARGIN_X, y - 6, logoSize, logoSize);
    } catch {
      // ignore
    }
  }

  // Right-aligned institutional text block
  const rightX = PAGE_W - MARGIN_X;

  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLOR_BLACK);
  doc.text(data.clinicName.toUpperCase(), rightX, y, { align: "right" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_GRAY);

  if (data.clinicCnpj) {
    doc.text(`CNPJ: ${data.clinicCnpj}`, rightX, y, { align: "right" });
    y += 3.5;
  }
  if (data.clinicAddress) {
    doc.text(data.clinicAddress, rightX, y, { align: "right", maxWidth: CONTENT_W - logoSize - 10 });
    y += 3.5;
  }
  if (data.clinicPhone) {
    const contactLine = [data.clinicPhone, data.clinicWhatsapp ? `WhatsApp: ${data.clinicWhatsapp}` : null]
      .filter(Boolean)
      .join("  •  ");
    doc.text(contactLine, rightX, y, { align: "right" });
    y += 3.5;
  }
  if (data.clinicEmail) {
    doc.text(data.clinicEmail, rightX, y, { align: "right" });
    y += 3.5;
  }

  y = Math.max(y, MARGIN_TOP + logoSize - 2);
  y += 4;

  drawElegantLine(doc, y);
  y += 8;

  return y;
}

function drawDocumentTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLOR_BLACK);
  doc.text(title, PAGE_W / 2, y, { align: "center" });
  y += 4;

  doc.setDrawColor(...COLOR_PRIMARY);
  doc.setLineWidth(0.8);
  const titleWidth = doc.getTextWidth(title);
  const lineHalf = Math.min(titleWidth / 2, 30);
  doc.line(PAGE_W / 2 - lineHalf, y, PAGE_W / 2 + lineHalf, y);
  y += 12;

  return y;
}

// Lines that are part of header/footer already rendered by the PDF template
const REDUNDANT_PATTERNS = [
  /^RECEITUÁRIO\s*(IMPRESSO|DIGITAL)?$/i,
  /^ATESTADO\s*ODONTOLÓGICO$/i,
  /^━+$/,
  /^═+$/,
  /^={3,}$/,
  /^-{3,}$/,
  /^PROFISSIONAL RESPONSÁVEL$/i,
];

function isRedundantLine(line: string, clinicName?: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  for (const pattern of REDUNDANT_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }

  // Skip clinic info already in header
  if (clinicName && trimmed.toUpperCase() === clinicName.toUpperCase()) return true;
  if (/^CNPJ:\s/i.test(trimmed)) return true;
  if (/^Telefone:\s/i.test(trimmed)) return true;
  if (/^Endereço:\s/i.test(trimmed) && !trimmed.includes("Paciente")) return true;

  return false;
}

function drawBody(doc: jsPDF, content: string, y: number, tipo: string, clinicName?: string): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_BLACK);

  const lines = content.split("\n");
  const bodyLines: string[] = [];
  let inProfessionalSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip redundant lines (already in PDF header/footer/signature)
    if (isRedundantLine(trimmed, clinicName)) continue;

    // Stop rendering at professional signature section (handled by drawSignature)
    if (/^PROFISSIONAL RESPONSÁVEL/i.test(trimmed)) {
      inProfessionalSection = true;
      continue;
    }
    if (inProfessionalSection) continue;

    // Skip separator-only lines
    if (/^[━═\-=]{3,}$/.test(trimmed)) continue;

    bodyLines.push(line);
  }

  const lineHeight = 6.5;

  for (const rawLine of bodyLines) {
    if (y + lineHeight > PAGE_H - MARGIN_BOTTOM - 60) break;

    const trimmed = rawLine.trim();

    // Empty line = small vertical space
    if (!trimmed) {
      y += lineHeight * 0.5;
      continue;
    }

    // Section headers (ALL CAPS, > 3 chars)
    if (
      trimmed === trimmed.toUpperCase() &&
      trimmed.length > 3 &&
      !/^(CID|CPF|CRO|CNPJ)/.test(trimmed) &&
      !/^\d/.test(trimmed)
    ) {
      y += 4;
      doc.setFont("times", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text(trimmed, MARGIN_X, y);
      doc.setTextColor(...COLOR_BLACK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      y += lineHeight + 2;

      // Draw a subtle line under section header
      drawThinLine(doc, y - lineHeight + 1, COLOR_LIGHT);
      continue;
    }

    // Label:Value pairs (bold label, normal value)
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx > 0 && colonIdx < 35 && !trimmed.startsWith("http")) {
      const label = trimmed.substring(0, colonIdx + 1);
      const value = trimmed.substring(colonIdx + 1).trim();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(label, MARGIN_X, y);

      if (value) {
        doc.setFont("helvetica", "normal");
        const labelWidth = doc.getTextWidth(label + " ");
        const wrappedValue = doc.splitTextToSize(value, CONTENT_W - labelWidth);
        doc.text(wrappedValue[0], MARGIN_X + labelWidth, y);
        // Additional wrapped lines
        for (let i = 1; i < wrappedValue.length; i++) {
          y += lineHeight;
          doc.text(wrappedValue[i], MARGIN_X + labelWidth, y);
        }
      }

      doc.setFont("helvetica", "normal");
      y += lineHeight;
      continue;
    }

    // Numbered items (medications) - bold number, normal text
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${numberedMatch[1]}.`, MARGIN_X, y);
      doc.setFont("helvetica", "normal");
      const medText = doc.splitTextToSize(numberedMatch[2], CONTENT_W - 10);
      doc.text(medText[0], MARGIN_X + 8, y);
      for (let i = 1; i < medText.length; i++) {
        y += lineHeight;
        doc.text(medText[i], MARGIN_X + 8, y);
      }
      y += lineHeight;
      continue;
    }

    // Indented lines (posologia, observations)
    if (rawLine.startsWith("   ")) {
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      const indentedText = doc.splitTextToSize(trimmed, CONTENT_W - 10);
      for (const il of indentedText) {
        doc.text(il, MARGIN_X + 8, y);
        y += lineHeight - 0.5;
      }
      doc.setFontSize(11);
      doc.setTextColor(...COLOR_BLACK);
      continue;
    }

    // Regular line with wrapping
    const wrappedLines = doc.splitTextToSize(trimmed, CONTENT_W);
    for (const wl of wrappedLines) {
      doc.text(wl, MARGIN_X, y);
      y += lineHeight;
    }
  }

  return y;
}

function drawSignature(doc: jsPDF, data: DocumentoPDFData, y: number): number {
  y = Math.max(y + 15, PAGE_H - MARGIN_BOTTOM - 55);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_BLACK);

  const dateObj = data.createdAt ? new Date(data.createdAt) : new Date();
  const longDate = dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const cityPrefix = data.clinicCity ? `${data.clinicCity}, ` : "";
  const dateStr = `${cityPrefix}${longDate}`;

  doc.text(dateStr, PAGE_W / 2, y, { align: "center" });
  y += 20;

  // Signature line
  doc.setDrawColor(...COLOR_BLACK);
  doc.setLineWidth(0.4);
  const sigW = 80;
  doc.line(PAGE_W / 2 - sigW / 2, y, PAGE_W / 2 + sigW / 2, y);
  y += 5;

  // Professional info
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  if (data.professionalName) {
    doc.text(data.professionalName, PAGE_W / 2, y, { align: "center" });
    y += 4.5;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLOR_GRAY);
  if (data.professionalCro) {
    doc.text(`CRO: ${data.professionalCro}`, PAGE_W / 2, y, { align: "center" });
    y += 4;
  }
  if (data.professionalEspecialidade) {
    doc.text(data.professionalEspecialidade, PAGE_W / 2, y, { align: "center" });
    y += 4;
  }

  return y;
}

function drawFooter(doc: jsPDF, data: DocumentoPDFData) {
  const footerY = PAGE_H - MARGIN_BOTTOM + 5;

  drawThinLine(doc, footerY, COLOR_LIGHT);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_GRAY);

  let y = footerY + 4;

  const footerParts: string[] = [];
  if (data.clinicAddress) footerParts.push(data.clinicAddress);
  if (data.clinicPhone) footerParts.push(`Tel: ${data.clinicPhone}`);
  if (data.clinicEmail) footerParts.push(data.clinicEmail);

  if (footerParts.length > 0) {
    const footerText = footerParts.join("  •  ");
    doc.text(footerText, PAGE_W / 2, y, { align: "center", maxWidth: CONTENT_W });
    y += 3.5;
  }

  // Document ID
  if (data.documentId) {
    const docIdStr = `ID: FLD-${data.tipo === "atestado" ? "AT" : "RC"}-${new Date().getFullYear()}-${data.documentId.substring(0, 8).toUpperCase()}`;
    doc.setFontSize(6.5);
    doc.text(docIdStr, MARGIN_X, y);
  }

}

export async function generateDocumentoPDF(data: DocumentoPDFData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let logoBase64: string | null = null;
  if (data.clinicLogoUrl) {
    logoBase64 = await loadImage(data.clinicLogoUrl);
  }

  drawWatermark(doc, logoBase64);

  let y = drawHeader(doc, data, logoBase64);

  const titleText = data.tipo === "atestado" ? "ATESTADO ODONTOLÓGICO" : "RECEITUÁRIO";
  y = drawDocumentTitle(doc, titleText, y);

  y = drawBody(doc, data.content, y, data.tipo, data.clinicName);

  drawSignature(doc, data, y);

  drawFooter(doc, data);

  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, "_blank");
}
