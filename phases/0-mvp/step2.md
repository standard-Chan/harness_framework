# Step 2: merge-api

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
- `/src/lib/merge.ts`

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

`POST /api/merge` 라우트 핸들러를 TDD로 구현하라. 웹 UI의 실제 PDF 병합은 반드시 이 서버 API에서 수행한다.

필수 파일과 기대사항:

- `/src/app/api/merge/route.ts`
  - `multipart/form-data`의 `files` 필드를 입력 순서대로 읽는다.
  - 서버에서 2차 검증을 수행한다.
  - 공용 `src/lib/merge.ts` 코어만 사용해 병합한다.
  - 성공 시 `200`, `application/pdf`, `Content-Disposition` 헤더와 PDF 바이너리를 반환한다.
  - 검증 실패 시 `400` JSON 오류를 반환한다.
  - 병합 실패 시 `500` JSON 오류를 반환한다.
  - 오류 메시지는 문제 파일명과 원인을 포함한다.
  - 요청 간 상태를 저장하지 않는다.
- API 테스트
  - 성공 응답의 content-type과 바이너리 반환을 검증한다.
  - 2개 미만 파일 검증 실패를 검증한다.
  - PDF가 아닌 파일 검증 실패를 검증한다.
  - 손상 PDF 병합 실패가 문제 파일명과 원인을 포함하는지 검증한다.

취소 흐름은 클라이언트 요청 취소 기준이다. 서버에서는 `Request.signal` 또는 런타임에서 가능한 연결 종료 감지를 사용해 가능한 범위에서 중단/정리를 시도하되, 완전한 즉시 중단 보장을 만들려고 과도한 상태 저장을 추가하지 마라.

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
   - 성공 -> `"status": "completed"`, `"summary": "POST /api/merge 서버 병합 라우트와 API 테스트 구현"`
   - 수정 3회 시도 후에도 실패 -> `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 -> `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- 클라이언트에서 병합하는 우회 경로를 만들지 마라. 이유: 실제 병합은 서버에서만 수행해야 한다.
- API 라우트 안에 PDF 병합 알고리즘을 중복 구현하지 마라. 이유: CLI와 같은 공용 코어를 써야 한다.
- 작업 이력, 영구 저장, 비동기 작업 큐를 추가하지 마라. 이유: MVP 제외 범위다.
- 기존 테스트를 깨뜨리지 마라
