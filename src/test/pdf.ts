import { PDFDocument, StandardFonts } from "pdf-lib";

export async function createPdf(label: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([300, 200]);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  page.drawText(label, {
    x: 32,
    y: 120,
    size: 24,
    font,
  });

  return doc.save();
}
