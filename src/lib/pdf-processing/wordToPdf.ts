/**
 * Converts a DOCX file to PDF using mammoth (extracts HTML) + jsPDF (renders to PDF).
 * Formatting is approximated — complex layouts may differ from the original.
 */
export async function wordToPdf(file: File): Promise<Blob> {
  const mammoth = await import("mammoth");
  const { jsPDF } = await import("jspdf");

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;

  // Strip tags to get clean text content with basic structure
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth  = 210;
  const margin     = 20;
  const maxWidth   = pageWidth - margin * 2;
  const lineHeight = 6;
  let y = margin;

  const addText = (text: string, fontSize: number, bold = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    const lines = pdf.splitTextToSize(text.trim(), maxWidth);
    for (const line of lines) {
      if (y + lineHeight > 297 - margin) { pdf.addPage(); y = margin; }
      pdf.text(line, margin, y);
      y += lineHeight * (fontSize / 11);
    }
    y += 2;
  };

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) addText(text, 11);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (tag === "h1") { addText(el.textContent ?? "", 20, true); y += 4; }
    else if (tag === "h2") { addText(el.textContent ?? "", 16, true); y += 3; }
    else if (tag === "h3") { addText(el.textContent ?? "", 13, true); y += 2; }
    else if (tag === "p") { addText(el.textContent ?? "", 11); y += 2; }
    else if (tag === "li") { addText("• " + (el.textContent ?? ""), 11); }
    else if (tag === "br") { y += lineHeight; }
    else { el.childNodes.forEach(walk); }
  };

  doc.body.childNodes.forEach(walk);

  return new Blob([pdf.output("arraybuffer")], { type: "application/pdf" });
}
