// @vitest-environment node

import { PDFDocument } from "pdf-lib";
import { createPdf } from "@/test/pdf";
import { POST } from "./route";

function makeFile(data: Uint8Array, name: string, type = "application/pdf"): File {
  return new File([data], name, { type });
}

function makeRequest(formData: FormData): Request {
  return {
    formData: async () => formData,
    signal: new AbortController().signal,
  } as Request;
}

describe("POST /api/merge", () => {
  it("returns a merged PDF binary response", async () => {
    const form = new FormData();
    form.append("files", makeFile(await createPdf("a"), "a.pdf"));
    form.append("files", makeFile(await createPdf("b"), "b.pdf"));

    const response = await POST(makeRequest(form));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    const merged = await PDFDocument.load(new Uint8Array(await response.arrayBuffer()));
    expect(merged.getPageCount()).toBe(2);
  });

  it("rejects fewer than two files", async () => {
    const form = new FormData();
    form.append("files", makeFile(await createPdf("a"), "a.pdf"));

    const response = await POST(makeRequest(form));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("최소 2개");
  });

  it("rejects non-PDF files", async () => {
    const form = new FormData();
    form.append("files", makeFile(await createPdf("a"), "a.pdf"));
    form.append("files", makeFile(new Uint8Array([1, 2, 3]), "note.txt", "text/plain"));

    const response = await POST(makeRequest(form));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("note.txt");
  });

  it("reports the damaged file name on merge failure", async () => {
    const form = new FormData();
    form.append("files", makeFile(await createPdf("a"), "a.pdf"));
    form.append("files", makeFile(new Uint8Array([1, 2, 3]), "broken.pdf"));

    const response = await POST(makeRequest(form));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toContain("broken.pdf");
  });
});
