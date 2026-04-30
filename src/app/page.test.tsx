import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Home from "./page";

function pdfFile(name: string, size = 120): File {
  return new File([new Uint8Array(size)], name, { type: "application/pdf" });
}

describe("Home", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(new Blob([new Uint8Array([1, 2, 3])], { type: "application/pdf" }), {
          status: 200,
          headers: { "Content-Type": "application/pdf" },
        }),
      ),
    );
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:merged"),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders the initial empty state with a disabled merge button", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "PDF 병합 도구" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "병합하기" })).toBeDisabled();
    expect(screen.getByText("파일 대기 중")).toBeInTheDocument();
  });

  it("moves to ready after selecting two PDF files", () => {
    render(<Home />);

    fireEvent.change(screen.getByLabelText("PDF 파일 선택"), {
      target: { files: [pdfFile("a.pdf"), pdfFile("b.pdf")] },
    });

    expect(screen.getByRole("heading", { name: "파일 준비 완료" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "병합하기" })).toBeEnabled();
  });

  it("supports moving and removing files", () => {
    render(<Home />);

    fireEvent.change(screen.getByLabelText("PDF 파일 선택"), {
      target: { files: [pdfFile("a.pdf"), pdfFile("b.pdf")] },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "위" })[1]);

    expect(screen.getAllByText(/\.pdf$/)[0]).toHaveTextContent("b.pdf");

    fireEvent.click(screen.getAllByRole("button", { name: "제거" })[0]);
    expect(screen.getByText("최소 2개 PDF가 필요합니다.")).toBeInTheDocument();
  });

  it("locks controls while running and allows cancel", async () => {
    let rejectRequest: (reason?: unknown) => void = () => undefined;
    vi.mocked(fetch).mockImplementationOnce(
      () =>
        new Promise<Response>((_, reject) => {
          rejectRequest = reject;
        }),
    );
    render(<Home />);

    fireEvent.change(screen.getByLabelText("PDF 파일 선택"), {
      target: { files: [pdfFile("a.pdf"), pdfFile("b.pdf")] },
    });
    fireEvent.click(screen.getByRole("button", { name: "병합하기" }));

    expect(await screen.findByRole("heading", { name: "병합 중" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeEnabled();
    expect(screen.getByLabelText("PDF 파일 선택")).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    rejectRequest(new DOMException("aborted", "AbortError"));
    await screen.findByText("병합이 취소되었습니다. 순서를 확인한 뒤 다시 실행할 수 있습니다.");
  });

  it("downloads on successful API response and shows retry download", async () => {
    render(<Home />);

    fireEvent.change(screen.getByLabelText("PDF 파일 선택"), {
      target: { files: [pdfFile("a.pdf"), pdfFile("b.pdf")] },
    });
    fireEvent.click(screen.getByRole("button", { name: "병합하기" }));

    expect(await screen.findByRole("heading", { name: "다운로드 준비 완료" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 다운로드" })).toBeInTheDocument();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  it("shows the problem file name on API errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ error: "broken.pdf: PDF를 읽을 수 없습니다." }, { status: 500 }),
    );
    render(<Home />);

    fireEvent.change(screen.getByLabelText("PDF 파일 선택"), {
      target: { files: [pdfFile("a.pdf"), pdfFile("broken.pdf")] },
    });
    fireEvent.click(screen.getByRole("button", { name: "병합하기" }));

    await waitFor(() => {
      expect(screen.getByText(/broken\.pdf/)).toBeInTheDocument();
    });
  });
});
