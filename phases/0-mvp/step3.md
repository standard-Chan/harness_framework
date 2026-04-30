# Step 3: cli-flow

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/AGENTS.md`
- `/docs/PRD.md`
- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- `/package.json`
- `/src/types/index.ts`
- `/src/lib/limits.ts`
- `/src/lib/validation.ts`
- `/src/lib/output-name.ts`
- `/src/lib/merge.ts`
- `/src/app/api/merge/route.ts`

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

Node.js 기반 로컬 CLI를 TDD로 구현하라. CLI는 웹 API와 같은 공용 병합 코어와 같은 검증 규칙을 사용해야 한다.

필수 파일과 기대사항:

- `/src/cli/index.ts`
  - `pdf-merge <input...> [-o output.pdf]` 형태를 지원한다.
  - `-o`가 없으면 `merged-YYYYMMDD-HHMMSS.pdf` 규칙으로 출력명을 만든다.
  - 입력 인자 순서를 병합 순서로 사용한다.
  - 동일 출력 경로가 있으면 suffix 기반 새 이름을 사용한다.
  - 성공 시 생성 경로를 stdout에 출력하고 exit code 0을 반환한다.
  - 검증/입력 오류 시 stderr에 문제 파일명과 원인을 출력하고 non-zero exit code를 반환한다.
- `/package.json`
  - `npm run cli -- <args>`가 CLI를 실행해야 한다.
  - 필요하면 `bin` 항목을 추가하되 전역 npm 배포는 구현하지 않는다.
- CLI 테스트
  - 성공 병합과 출력 파일 생성을 검증한다.
  - `-o` 미지정 기본 파일명 흐름을 검증한다.
  - 출력 파일 충돌 suffix를 검증한다.
  - PDF가 아닌 파일, 존재하지 않는 파일, 2개 미만 입력 오류를 검증한다.

CLI는 파일 시스템을 다루므로 테스트에서 임시 디렉토리를 사용하고 테스트 산출물을 정리하라.

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
   - 성공 -> `"status": "completed"`, `"summary": "공용 코어를 재사용하는 로컬 CLI와 테스트 구현"`
   - 수정 3회 시도 후에도 실패 -> `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 -> `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- CLI에 웹 API와 다른 검증 기준을 만들지 마라. 이유: 웹 경로와 CLI 경로가 같은 규칙으로 동작해야 한다.
- CLI 안에 PDF 병합 알고리즘을 중복 구현하지 마라. 이유: 반드시 `src/lib/merge.ts`를 사용해야 한다.
- 전역 npm 배포나 설치 절차를 추가하지 마라. 이유: MVP 제외 범위다.
- 기존 테스트를 깨뜨리지 마라
