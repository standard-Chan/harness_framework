import { validatePdfInputs } from "./validation";
import { MAX_FILE_SIZE_BYTES, MAX_TOTAL_SIZE_BYTES } from "./limits";

describe("validatePdfInputs", () => {
  it("rejects fewer than two files", () => {
    const result = validatePdfInputs([{ name: "one.pdf", size: 100, type: "application/pdf" }]);

    expect(result.ok).toBe(false);
    expect(result.ok ? "" : result.issues[0].message).toContain("최소 2개");
  });

  it("rejects more than twenty files", () => {
    const files = Array.from({ length: 21 }, (_, index) => ({
      name: `file-${index}.pdf`,
      size: 100,
      type: "application/pdf",
    }));

    const result = validatePdfInputs(files);

    expect(result.ok).toBe(false);
    expect(result.ok ? "" : result.issues[0].message).toContain("최대 20개");
  });

  it("rejects non-PDF files with the problem file name", () => {
    const result = validatePdfInputs([
      { name: "ok.pdf", size: 100, type: "application/pdf" },
      { name: "note.txt", size: 100, type: "text/plain" },
    ]);

    expect(result.ok).toBe(false);
    expect(result.ok ? "" : result.issues[0].message).toContain("note.txt");
    expect(result.ok ? "" : result.issues[0].reason).toBe("not_pdf");
  });

  it("rejects files over the per-file limit", () => {
    const result = validatePdfInputs([
      { name: "big.pdf", size: MAX_FILE_SIZE_BYTES + 1, type: "application/pdf" },
      { name: "ok.pdf", size: 100, type: "application/pdf" },
    ]);

    expect(result.ok).toBe(false);
    expect(result.ok ? "" : result.issues[0].message).toContain("big.pdf");
    expect(result.ok ? "" : result.issues[0].message).toContain("초과");
  });

  it("rejects total size over the aggregate limit", () => {
    const result = validatePdfInputs([
      { name: "a.pdf", size: MAX_TOTAL_SIZE_BYTES / 2 + 1, type: "application/pdf" },
      { name: "b.pdf", size: MAX_TOTAL_SIZE_BYTES / 2 + 1, type: "application/pdf" },
    ]);

    expect(result.ok).toBe(false);
    expect(result.ok ? "" : result.issues.some((issue) => issue.reason === "total_too_large")).toBe(
      true,
    );
  });
});
