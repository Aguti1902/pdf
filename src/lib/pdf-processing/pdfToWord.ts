/**
 * Extracts text from a PDF using pdfjs-dist and creates a .docx file using the docx library.
 * Note: this is a text extraction — complex layouts (tables, images) are not preserved.
 */
export async function pdfToWord(file: File): Promise<Blob> {
  // Lazy-load both heavy libraries
  const [pdfModule, docxModule] = await Promise.all([
    import("pdfjs-dist"),
    import("docx"),
  ]);

  const pdfjsLib = pdfModule;
  const { Document, Paragraph, TextRun, HeadingLevel, Packer } = docxModule;

  // Set worker
  if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docChildren: any[] = [];

  // Title
  docChildren.push(
    new Paragraph({
      text: file.name.replace(/\.pdf$/i, ""),
      heading: HeadingLevel.HEADING_1,
    })
  );

  for (let p = 1; p <= pdfDoc.numPages; p++) {
    const page = await pdfDoc.getPage(p);
    const textContent = await page.getTextContent();

    // Add page separator
    docChildren.push(
      new Paragraph({
        children: [new TextRun({ text: `— Page ${p} —`, color: "888888", size: 18 })],
      })
    );

    let currentLine = "";
    let lastY = -1;

    for (const item of textContent.items) {
      const textItem = item as { str: string; transform: number[] };
      const y = Math.round(textItem.transform[5]);

      if (lastY !== -1 && Math.abs(y - lastY) > 5) {
        // New line
        if (currentLine.trim()) {
          docChildren.push(new Paragraph({ children: [new TextRun(currentLine.trim())] }));
        }
        currentLine = textItem.str;
      } else {
        currentLine += (currentLine ? " " : "") + textItem.str;
      }
      lastY = y;
    }

    if (currentLine.trim()) {
      docChildren.push(new Paragraph({ children: [new TextRun(currentLine.trim())] }));
    }
  }

  const doc = new Document({ sections: [{ children: docChildren }] });
  const buffer = await Packer.toBuffer(doc);

  return new Blob([buffer.buffer as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
