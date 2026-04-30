import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { createPdf } from "@/test/pdf";
import { mergePdfBuffers } from "./merge";
import { createDefaultOutputName, resolveOutputPath } from "./output-name";

describe("mergePdfBuffers", () => {
  it("merges pages in input order", async () => {
    const first = await createPdf("first");
    const second = await createPdf("second");

    const merged = await mergePdfBuffers([
      { name: "first.pdf", size: first.byteLength, data: first },
      { name: "second.pdf", size: second.byteLength, data: second },
    ]);
    const loaded = await PDFDocument.load(merged);

    expect(loaded.getPageCount()).toBe(2);
  });

  it("includes the problem file name for damaged PDFs", async () => {
    await expect(
      mergePdfBuffers([
        { name: "ok.pdf", size: 10, data: await createPdf("ok") },
        { name: "broken.pdf", size: 3, data: new Uint8Array([1, 2, 3]) },
      ]),
    ).rejects.toThrow("broken.pdf");
  });
});

describe("output names", () => {
  it("creates the default timestamped output name", () => {
    expect(createDefaultOutputName(new Date(2026, 3, 30, 9, 8, 7))).toBe(
      "merged-20260430-090807.pdf",
    );
  });

  it("adds a suffix when the output path already exists", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "pdf-merge-"));
    const requested = path.join(dir, "merged.pdf");
    await writeFile(requested, "exists");

    await expect(resolveOutputPath(requested)).resolves.toBe(path.join(dir, "merged-1.pdf"));
  });
});
