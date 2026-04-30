# Step 1: merge-core

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/AGENTS.md`
- `/docs/PRD.md`
- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- `/docs/UI_GUIDE.md`
- `/package.json`
- `/tsconfig.json`
- `/src/types/index.ts`
- `/src/lib/`

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

웹 API와 CLI가 함께 사용할 서버/Node 전용 PDF 검증 및 병합 코어를 TDD로 구현하라.

필수 파일과 기대사항:

- `/src/types/index.ts`
  - 파일 입력, 검증 오류, 병합 결과, CLI/API가 공유할 결과 타입을 정의한다.
  - 파일 리스트 항목은 최소 `id`, `displayName`, `originalName`, `size`, `order`, `status`, `sourceFile` 개념을 표현할 수 있어야 한다.
- `/src/lib/limits.ts`
  - 최소 2개 파일, 최대 20개 파일, 파일당 50MB, 총합 200MB 제한을 상수화한다.
- `/src/lib/validation.ts`
  - 입력 개수, 확장자 또는 MIME, 파일 크기, 총합 크기를 검증한다.
  - 오류 메시지는 문제 파일명과 원인을 포함한다.
- `/src/lib/output-name.ts`
  - 기본 출력명 `merged-YYYYMMDD-HHMMSS.pdf` 생성과 충돌 시 suffix 기반 새 이름 계산을 제공한다.
- `/src/lib/merge.ts`
  - `pdf-lib`를 사용해 입력 순서대로 페이지를 병합한다.
  - 북마크, 폼, 첨부파일, 원본 메타데이터 보존 기능을 추가하지 않는다.
  - 웹과 CLI가 모두 호출할 공용 함수로 설계한다.

권장 시그니처:

```ts
export async function mergePdfBuffers(inputs: PdfMergeInput[]): Promise<Uint8Array>;
export function validatePdfInputs(inputs: PdfInputMetadata[]): ValidationResult;
export function createDefaultOutputName(now?: Date): string;
export async function resolveOutputPath(requestedPath: string): Promise<string>;
```

테스트를 먼저 작성하고, 테스트가 통과하도록 구현하라. 테스트는 최소 다음을 검증해야 한다:

- 2개 미만 입력 실패
- 20개 초과 입력 실패
- PDF가 아닌 파일명 또는 MIME 실패
- 파일당 50MB 초과 실패
- 총합 200MB 초과 실패
- 오류 메시지에 문제 파일명과 원인이 포함됨
- 입력 순서대로 PDF 페이지가 병합됨
- 출력 파일명 충돌 시 suffix가 붙음

## Acceptance Criteria

```bash
npm run build
npm run lint
npm run test
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 디렉토리 구조를 따르는가?
   - ADR 기술 스택을 벗어나지 않았는가?
   - AGENTS.md CRITICAL 규칙을 위반하지 않았는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 해당 step을 업데이트한다:
   - 성공 -> `"status": "completed"`, `"summary": "검증/출력명/PDF 병합 공용 코어와 테스트 구현"`
   - 수정 3회 시도 후에도 실패 -> `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 -> `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- 클라이언트 컴포넌트에서 `pdf-lib`를 import하지 마라. 이유: PDF 처리 모듈은 클라이언트 번들에 포함하면 안 된다.
- 웹 API나 CLI에 별도 병합 로직을 만들지 마라. 이유: 반드시 이 공용 코어를 재사용해야 한다.
- 북마크, 폼, 첨부파일, 메타데이터 보존을 구현하지 마라. 이유: MVP 제외 범위다.
- 기존 테스트를 깨뜨리지 마라
