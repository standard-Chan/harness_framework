import { expectTypeOf } from "vitest";
import type { AppStatus, PdfInputMetadata, PdfMergeInput } from "./index";

describe("shared types", () => {
  it("exposes app and PDF input contracts", () => {
    expectTypeOf<AppStatus>().toEqualTypeOf<
      "empty" | "ready" | "running" | "success" | "error"
    >();
    expectTypeOf<PdfMergeInput>().toMatchTypeOf<PdfInputMetadata & { data: Uint8Array }>();
  });
});
