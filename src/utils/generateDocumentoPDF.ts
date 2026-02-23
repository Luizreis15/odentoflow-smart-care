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
  // Double thin line for premium feel
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
  // Very subtle watermark in the center
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

  // Logo on the left
  const logoSize = 18;
  let logoEndX = MARGIN_X;

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", MARGIN_X, y - 6, logoSize, logoSize);
      logoEndX = MARGIN_X + logoSize + 5;
    } catch {
      logoEndX = MARGIN_X;
    }
  }

  // Clinic name - elegant serif style (using times as closest to Playfair)
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLOR_BLACK);
  
  // Right-aligned institutional text block
  const rightX = PAGE_W - MARGIN_X;
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

  // Elegant double line separator
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

  // Small decorative line under title
  doc.setDrawColor(...COLOR_PRIMARY);
  doc.setLineWidth(0.8);
  const titleWidth = doc.getTextWidth(title);
  const lineHalf = Math.min(titleWidth / 2, 30);
  doc.line(PAGE_W / 2 - lineHalf, y, PAGE_W / 2 + lineHalf, y);
  y += 12;

  return y;
}

function drawBody(doc: jsPDF, content: string, y: number, tipo: string): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_BLACK);

  // Parse content and skip header/footer sections (already in PDF header/footer)
  const lines = content.split("\n");
  let skipHeader = true;
  let skipFooter = false;
  const bodyLines: string[] = [];

  for (const line of lines) {
    // Skip title lines and separator lines
    if (skipHeader) {
      if (line.includes("━") || line.includes("===") || line.includes("═")) {
        skipHeader = false;
        continue;
      }
      continue;
    }

    // Stop at professional signature section
    if (line.includes("PROFISSIONAL RESPONSÁVEL") || line.includes("_".repeat(10))) {
      skipFooter = true;
      continue;
    }
    if (skipFooter) continue;

    // Skip subsequent separators
    if (line.includes("━") || line.includes("===") || line.includes("═")) continue;

    bodyLines.push(line);
  }

  // For atestado - render the full content if no separators found
  const textToRender = bodyLines.length > 0 ? bodyLines.join("\n").trim() : content;

  // Render text with proper wrapping
  const splitLines = doc.splitTextToSize(textToRender, CONTENT_W);
  const lineHeight = 6.5; // Generous spacing

  for (const line of splitLines) {
    if (y + lineHeight > PAGE_H - MARGIN_BOTTOM - 60) {
      // Leave space for signature and footer
      break;
    }

    // Bold for section labels
    const trimmed = line.trim();
    if (trimmed.startsWith("DADOS DO PACIENTE") || trimmed.startsWith("MEDICAMENTOS PRESCRITOS") ||
        trimmed.startsWith("Paciente:") || trimmed.startsWith("Nome:") || trimmed.startsWith("CPF:") ||
        trimmed.startsWith("CID:") || trimmed.startsWith("Data")) {
      
      // Check if it's a label:value pair
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx > 0 && colonIdx < 30) {
        const label = trimmed.substring(0, colonIdx + 1);
        const value = trimmed.substring(colonIdx + 1).trim();
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(label, MARGIN_X, y);
        
        doc.setFont("helvetica", "normal");
        const labelWidth = doc.getTextWidth(label + " ");
        doc.text(value, MARGIN_X + labelWidth, y);
        y += lineHeight;
        continue;
      }
    }

    // Section headers
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.startsWith("CID") && !trimmed.startsWith("CPF")) {
      y += 3;
      doc.setFont("times", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text(trimmed, MARGIN_X, y);
      doc.setTextColor(...COLOR_BLACK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      y += lineHeight + 1;
      continue;
    }

    // Numbered items (medications) - slight indent and bold number
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.text(`${numberedMatch[1]}.`, MARGIN_X, y);
      doc.setFont("helvetica", "normal");
      doc.text(numberedMatch[2], MARGIN_X + 8, y);
      y += lineHeight;
      continue;
    }

    // Indented lines (posologia, obs)
    if (line.startsWith("   ")) {
      doc.setFontSize(10);
      doc.setTextColor(...COLOR_GRAY);
      doc.text(trimmed, MARGIN_X + 8, y);
      doc.setFontSize(11);
      doc.setTextColor(...COLOR_BLACK);
      y += lineHeight - 0.5;
      continue;
    }

    // Regular line
    if (trimmed.length > 0) {
      doc.text(trimmed, MARGIN_X, y);
    }
    y += trimmed.length === 0 ? lineHeight * 0.6 : lineHeight;
  }

  return y;
}

function drawSignature(doc: jsPDF, data: DocumentoPDFData, y: number): number {
  // Ensure minimum space before signature
  y = Math.max(y + 15, PAGE_H - MARGIN_BOTTOM - 55);

  // Date and location line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_BLACK);

  const dateStr = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  doc.text(`${dateStr}`, PAGE_W / 2, y, { align: "center" });
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

  // Clinic contact info in footer
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

  // Generation timestamp
  const now = new Date();
  doc.setFontSize(6.5);
  doc.text(
    `Gerado em ${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    PAGE_W - MARGIN_X,
    y,
    { align: "right" }
  );
}

export async function generateDocumentoPDF(data: DocumentoPDFData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Load logo if available
  let logoBase64: string | null = null;
  if (data.clinicLogoUrl) {
    logoBase64 = await loadImage(data.clinicLogoUrl);
  }

  // Watermark
  drawWatermark(doc, logoBase64);

  // Header
  let y = drawHeader(doc, data, logoBase64);

  // Document title
  const titleText = data.tipo === "atestado" ? "ATESTADO ODONTOLÓGICO" : "RECEITUÁRIO";
  y = drawDocumentTitle(doc, titleText, y);

  // Body content
  y = drawBody(doc, data.content, y, data.tipo);

  // Signature
  drawSignature(doc, data, y);

  // Footer
  drawFooter(doc, data);

  // Open PDF
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, "_blank");
}
