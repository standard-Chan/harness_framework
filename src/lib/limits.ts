export const MIN_PDF_FILES = 2;
export const MAX_PDF_FILES = 20;
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_TOTAL_SIZE_BYTES = 200 * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  }

  return `${bytes}B`;
}
