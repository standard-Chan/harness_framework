export type AppStatus = "empty" | "ready" | "running" | "success" | "error";

export type FileItemStatus = "ready" | "uploading" | "merged" | "error";

export type PdfFileItem = {
  id: string;
  displayName: string;
  originalName: string;
  size: number;
  order: number;
  status: FileItemStatus;
  sourceFile: File;
};

export type PdfInputMetadata = {
  name: string;
  size: number;
  type?: string;
};

export type PdfMergeInput = PdfInputMetadata & {
  data: Uint8Array;
};

export type ValidationIssue = {
  fileName?: string;
  reason: string;
  message: string;
};

export type ValidationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      issues: ValidationIssue[];
    };

export type MergeApiError = {
  error: string;
  issues?: ValidationIssue[];
};
