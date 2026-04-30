import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { createPdf } from "@/test/pdf";
import { runCli } from "./index";

function createIo(cwd: string) {
  let stdout = "";
  let stderr = "";
  return {
    io: {
      cwd,
      now: new Date(2026, 3, 30, 9, 8, 7),
      stdout: { write: (chunk: string) => ((stdout += chunk), true) },
      stderr: { write: (chunk: string) => ((stderr += chunk), true) },
    },
    get stdout() {
      return stdout;
    },
    get stderr() {
      return stderr;
    },
  };
}

describe("runCli", () => {
  it("merges files and prints the output path", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "pdf-merge-cli-"));
    const a = path.join(dir, "a.pdf");
    const b = path.join(dir, "b.pdf");
    const out = path.join(dir, "out.pdf");
    await writeFile(a, await createPdf("a"));
    await writeFile(b, await createPdf("b"));
    const harness = createIo(dir);

    await expect(runCli([a, b, "-o", out], harness.io)).resolves.toBe(0);
    const merged = await PDFDocument.load(new Uint8Array(await readFile(out)));

    expect(harness.stdout).toContain(out);
    expect(merged.getPageCount()).toBe(2);
  });

  it("uses the default output name when -o is omitted", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "pdf-merge-cli-"));
    const a = path.join(dir, "a.pdf");
    const b = path.join(dir, "b.pdf");
    await writeFile(a, await createPdf("a"));
    await writeFile(b, await createPdf("b"));
    const harness = createIo(dir);

    await expect(runCli([a, b], harness.io)).resolves.toBe(0);

    expect(harness.stdout).toContain(path.join(dir, "merged-20260430-090807.pdf"));
  });

  it("adds a suffix when output exists", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "pdf-merge-cli-"));
    const a = path.join(dir, "a.pdf");
    const b = path.join(dir, "b.pdf");
    const out = path.join(dir, "out.pdf");
    await writeFile(a, await createPdf("a"));
    await writeFile(b, await createPdf("b"));
    await writeFile(out, "exists");
    const harness = createIo(dir);

    await expect(runCli([a, b, "-o", out], harness.io)).resolves.toBe(0);

    expect(harness.stdout).toContain(path.join(dir, "out-1.pdf"));
  });

  it("returns non-zero for invalid inputs", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "pdf-merge-cli-"));
    const note = path.join(dir, "note.txt");
    await writeFile(note, "not pdf");
    const harness = createIo(dir);

    await expect(runCli([note], harness.io)).resolves.toBe(1);

    expect(harness.stderr).toContain("note.txt");
  });
});
