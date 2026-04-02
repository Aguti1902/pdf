/**
 * Converts an Excel (.xlsx / .xls) file to PDF using SheetJS (reads data) + jsPDF (renders table).
 */
export async function excelToPdf(file: File): Promise<Blob> {
  const XLSX = await import("xlsx");
  const { jsPDF } = await import("jspdf");
  await import("jspdf-autotable");

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  let firstSheet = true;

  for (const sheetName of workbook.SheetNames) {
    if (!firstSheet) pdf.addPage();
    firstSheet = false;

    const sheet = workbook.Sheets[sheetName];
    const data: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as string[][];

    if (data.length === 0) continue;

    // Title
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text(sheetName, 14, 14);

    const headers = (data[0] as string[]).map(String);
    const rows = data.slice(1).map(row => (row as string[]).map(String));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pdf as any).autoTable({
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      margin: { left: 14, right: 14 },
    });
  }

  return new Blob([pdf.output("arraybuffer")], { type: "application/pdf" });
}
