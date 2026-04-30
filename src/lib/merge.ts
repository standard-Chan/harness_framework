import { PDFDocument } from "pdf-lib";
import type { PdfMergeInput } from "@/types";

export async function mergePdfBuffers(inputs: PdfMergeInput[]): Promise<Uint8Array> {
  const output = await PDFDocument.create();

  for (const input of inputs) {
    let source: PDFDocument;

    try {
      source = await PDFDocument.load(input.data);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "알 수 없는 PDF 읽기 오류";
      throw new Error(`${input.name}: PDF를 읽을 수 없습니다. ${reason}`);
    }

    const pages = await output.copyPages(source, source.getPageIndices());
    for (const page of pages) {
      output.addPage(page);
    }
  }

  return output.save();
}
