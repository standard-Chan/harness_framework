"use client";

import { useRef, useState } from "react";
import { formatBytes } from "@/lib/limits";
import { validatePdfInputs, validationMessage } from "@/lib/validation";
import type { AppStatus, MergeApiError, PdfFileItem } from "@/types";

const STEPS = ["파일 준비 완료", "업로드/검증 중", "병합 중", "다운로드 준비 완료"];

function createDisplayItems(files: File[]): PdfFileItem[] {
  const counts = new Map<string, number>();

  return files.map((file, index) => {
    const seen = counts.get(file.name) ?? 0;
    counts.set(file.name, seen + 1);

    const dot = file.name.lastIndexOf(".");
    const base = dot === -1 ? file.name : file.name.slice(0, dot);
    const ext = dot === -1 ? "" : file.name.slice(dot);
    const displayName = seen === 0 ? file.name : `${base} (${seen + 1})${ext}`;

    return {
      id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
      displayName,
      originalName: file.name,
      size: file.size,
      order: index,
      status: "ready",
      sourceFile: file,
    };
  });
}

function reorder(items: PdfFileItem[], from: number, to: number): PdfFileItem[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next.map((item, index) => ({ ...item, order: index }));
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [items, setItems] = useState<PdfFileItem[]>([]);
  const [status, setStatus] = useState<AppStatus>("empty");
  const [message, setMessage] = useState("");
  const [resultName, setResultName] = useState("");
  const [resultUrl, setResultUrl] = useState("");

  const isRunning = status === "running";
  const canMerge = items.length >= 2 && !isRunning;
  const currentStep = status === "running" ? 2 : status === "success" ? 3 : items.length ? 0 : -1;

  function applyFiles(fileList: FileList | null) {
    if (!fileList || isRunning) {
      return;
    }

    const next = createDisplayItems(Array.from(fileList));
    const validation = validatePdfInputs(
      next.map((item) => ({
        name: item.originalName,
        size: item.size,
        type: item.sourceFile.type,
      })),
    );

    setItems(next);
    setResultUrl("");
    setResultName("");

    if (!validation.ok) {
      setStatus("error");
      setMessage(`${validationMessage(validation)} 파일을 다시 선택해 주세요.`);
      return;
    }

    setStatus("ready");
    setMessage("파일 순서를 확인한 뒤 병합을 시작하세요.");
  }

  function removeItem(index: number) {
    if (isRunning) {
      return;
    }
    const next = items
      .filter((_, itemIndex) => itemIndex !== index)
      .map((item, itemIndex) => ({ ...item, order: itemIndex }));
    setItems(next);
    setStatus(next.length === 0 ? "empty" : next.length >= 2 ? "ready" : "error");
    setMessage(next.length >= 2 ? "파일 순서를 확인한 뒤 병합을 시작하세요." : "최소 2개 PDF가 필요합니다.");
  }

  function moveItem(index: number, direction: -1 | 1) {
    if (isRunning) {
      return;
    }
    const target = index + direction;
    if (target < 0 || target >= items.length) {
      return;
    }
    setItems(reorder(items, index, target));
  }

  function download(url = resultUrl, name = resultName) {
    if (!url) {
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name || "merged.pdf";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  async function merge() {
    if (!canMerge) {
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("running");
    setMessage("서버로 파일을 보내 PDF를 병합하고 있습니다.");

    const form = new FormData();
    for (const item of items) {
      form.append("files", item.sourceFile, item.originalName);
    }

    try {
      const response = await fetch("/api/merge", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as MergeApiError | null;
        throw new Error(body?.error ?? "PDF 병합에 실패했습니다. 파일을 확인해 주세요.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const nextName = "merged.pdf";
      setResultUrl(url);
      setResultName(nextName);
      setStatus("success");
      setMessage("병합이 완료되었습니다.");
      download(url, nextName);
    } catch (error) {
      if (controller.signal.aborted) {
        setStatus("ready");
        setMessage("병합이 취소되었습니다. 순서를 확인한 뒤 다시 실행할 수 있습니다.");
        return;
      }

      const reason = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      setStatus("error");
      setMessage(`${reason} 문제 파일을 제거하거나 PDF 파일을 다시 선택해 주세요.`);
    } finally {
      abortRef.current = null;
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  return (
    <main className="min-h-screen bg-[#F7F4EE] px-5 py-8 text-[#1F2937] md:px-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#3B82F6]">PDF Merge Service</p>
          <h1 className="text-3xl font-semibold text-[#1F2937] md:text-4xl">
            PDF 병합 도구
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
          <section className="space-y-4">
            <label
              className={`block rounded-xl border border-dashed p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors ${
                isRunning
                  ? "cursor-not-allowed border-[#E5E7EB] bg-[#F1ECE3] text-[#9CA3AF]"
                  : "cursor-pointer border-[#93C5FD] bg-white hover:bg-[#EFF6FF]"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                aria-label="PDF 파일 선택"
                accept="application/pdf,.pdf"
                multiple
                disabled={isRunning}
                className="sr-only"
                onChange={(event) => applyFiles(event.target.files)}
              />
              <span className="block text-base font-semibold text-[#1F2937]">
                PDF 파일 선택
              </span>
              <span className="mt-2 block text-sm leading-6 text-[#4B5563]">
                2~20개 PDF, 파일당 50MB, 총합 200MB까지 병합할 수 있습니다.
              </span>
            </label>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-[#1F2937]">파일 순서</h2>
                <span className="text-sm text-[#6B7280]">{items.length}개</span>
              </div>

              {items.length === 0 ? (
                <p className="text-sm leading-6 text-[#6B7280]">
                  병합할 PDF를 선택하면 이곳에 순서대로 표시됩니다.
                </p>
              ) : (
                <ol className="space-y-3">
                  {items.map((item, index) => (
                    <li
                      key={item.id}
                      className="grid min-h-16 grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2"
                    >
                      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <span aria-hidden="true">::</span>
                        <span>{index + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#111827] md:text-base">
                          {item.displayName}
                        </p>
                        <p className="text-sm text-[#6B7280]">{formatBytes(item.size)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isRunning || index === 0}
                          className="rounded-xl px-2 py-1 text-sm text-[#6B7280] hover:text-[#1F2937] disabled:text-[#9CA3AF]"
                          onClick={() => moveItem(index, -1)}
                        >
                          위
                        </button>
                        <button
                          type="button"
                          disabled={isRunning || index === items.length - 1}
                          className="rounded-xl px-2 py-1 text-sm text-[#6B7280] hover:text-[#1F2937] disabled:text-[#9CA3AF]"
                          onClick={() => moveItem(index, 1)}
                        >
                          아래
                        </button>
                        <button
                          type="button"
                          disabled={isRunning}
                          className="rounded-xl bg-[#FEE2E2] px-3 py-1 text-sm text-[#B91C1C] hover:bg-[#FECACA] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF]"
                          onClick={() => removeItem(index)}
                        >
                          제거
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:p-6">
              <h2 className="text-base font-semibold text-[#1F2937]">진행 상태</h2>
              <ol className="mt-4 space-y-3">
                {STEPS.map((step, index) => (
                  <li key={step} className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        index <= currentStep ? "bg-[#3B82F6]" : "bg-[#E5E7EB]"
                      }`}
                    />
                    <span className="text-sm text-[#4B5563]">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div
              className={`rounded-xl border p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:p-6 ${
                status === "success"
                  ? "border-[#86EFAC] bg-[#DCFCE7]"
                  : status === "error"
                    ? "border-[#FCA5A5] bg-[#FEE2E2]"
                    : "border-[#E5E7EB] bg-white"
              }`}
            >
              <h2 className="text-base font-semibold text-[#1F2937]">
                {status === "empty"
                  ? "파일 대기 중"
                  : status === "running"
                    ? "병합 중"
                    : status === "success"
                      ? "다운로드 준비 완료"
                      : status === "error"
                        ? "확인이 필요합니다"
                        : "파일 준비 완료"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#4B5563]">
                {message || "PDF를 선택하면 병합을 시작할 수 있습니다."}
              </p>
              {resultName ? (
                <p className="mt-2 text-sm font-medium text-[#1F2937]">{resultName}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={!canMerge}
                className="rounded-xl bg-[#DBEAFE] px-4 py-3 text-sm font-semibold text-[#1D4ED8] hover:bg-[#BFDBFE] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF]"
                onClick={merge}
              >
                병합하기
              </button>
              {isRunning ? (
                <button
                  type="button"
                  className="rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm font-semibold text-[#B91C1C] hover:bg-[#FECACA]"
                  onClick={cancel}
                >
                  취소
                </button>
              ) : null}
              {status === "success" ? (
                <button
                  type="button"
                  className="rounded-xl bg-[#DBEAFE] px-4 py-3 text-sm font-semibold text-[#1D4ED8] hover:bg-[#BFDBFE]"
                  onClick={() => download()}
                >
                  다시 다운로드
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
