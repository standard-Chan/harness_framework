import { mergePdfBuffers } from "@/lib/merge";
import { validatePdfInputs, validationMessage } from "@/lib/validation";
import type { MergeApiError, PdfMergeInput } from "@/types";

export const runtime = "nodejs";

function jsonError(status: number, body: MergeApiError): Response {
  return Response.json(body, { status });
}

export async function POST(request: Request): Promise<Response> {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonError(400, { error: "multipart/form-data 요청만 처리할 수 있습니다." });
  }

  const files = formData.getAll("files").filter((value): value is File => value instanceof File);
  const metadata = files.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
  }));

  const validation = validatePdfInputs(metadata);
  if (!validation.ok) {
    return jsonError(400, {
      error: validationMessage(validation),
      issues: validation.issues,
    });
  }

  try {
    if (request.signal.aborted) {
      return jsonError(499, { error: "요청이 취소되었습니다." });
    }

    const inputs: PdfMergeInput[] = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        data: new Uint8Array(await file.arrayBuffer()),
      })),
    );
    const merged = await mergePdfBuffers(inputs);
    const body = merged.buffer.slice(
      merged.byteOffset,
      merged.byteOffset + merged.byteLength,
    ) as ArrayBuffer;

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "알 수 없는 병합 오류";
    return jsonError(500, {
      error: `PDF 병합에 실패했습니다. ${reason}`,
    });
  }
}
