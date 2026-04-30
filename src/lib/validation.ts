import {
  MAX_FILE_SIZE_BYTES,
  MAX_PDF_FILES,
  MAX_TOTAL_SIZE_BYTES,
  MIN_PDF_FILES,
  formatBytes,
} from "./limits";
import type { PdfInputMetadata, ValidationIssue, ValidationResult } from "@/types";

function isPdf(input: PdfInputMetadata): boolean {
  const hasPdfName = input.name.toLowerCase().endsWith(".pdf");
  const hasPdfMime =
    !input.type ||
    input.type === "application/pdf" ||
    input.type === "application/x-pdf";

  return hasPdfName && hasPdfMime;
}

export function validatePdfInputs(inputs: PdfInputMetadata[]): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (inputs.length < MIN_PDF_FILES) {
    issues.push({
      reason: "too_few_files",
      message: `최소 ${MIN_PDF_FILES}개 PDF가 필요합니다. 현재 ${inputs.length}개가 선택되었습니다.`,
    });
  }

  if (inputs.length > MAX_PDF_FILES) {
    issues.push({
      reason: "too_many_files",
      message: `최대 ${MAX_PDF_FILES}개 PDF만 병합할 수 있습니다. 현재 ${inputs.length}개입니다.`,
    });
  }

  for (const input of inputs) {
    if (!isPdf(input)) {
      issues.push({
        fileName: input.name,
        reason: "not_pdf",
        message: `${input.name}: PDF 파일만 병합할 수 있습니다.`,
      });
    }

    if (input.size > MAX_FILE_SIZE_BYTES) {
      issues.push({
        fileName: input.name,
        reason: "file_too_large",
        message: `${input.name}: 파일 크기 ${formatBytes(input.size)}가 파일당 제한 ${formatBytes(
          MAX_FILE_SIZE_BYTES,
        )}를 초과했습니다.`,
      });
    }
  }

  const totalSize = inputs.reduce((sum, input) => sum + input.size, 0);
  if (totalSize > MAX_TOTAL_SIZE_BYTES) {
    issues.push({
      reason: "total_too_large",
      message: `전체 파일 크기 ${formatBytes(totalSize)}가 총합 제한 ${formatBytes(
        MAX_TOTAL_SIZE_BYTES,
      )}를 초과했습니다.`,
    });
  }

  return issues.length > 0 ? { ok: false, issues } : { ok: true };
}

export function validationMessage(result: ValidationResult): string {
  return result.ok ? "" : result.issues.map((issue) => issue.message).join(" ");
}
