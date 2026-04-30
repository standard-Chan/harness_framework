# Step 4: web-ui

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/AGENTS.md`
- `/docs/PRD.md`
- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- `/docs/UI_GUIDE.md`
- `/package.json`
- `/src/types/index.ts`
- `/src/lib/limits.ts`
- `/src/lib/validation.ts`
- `/src/app/api/merge/route.ts`
- `/src/cli/index.ts`

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

PRD와 UI_GUIDE 기준의 웹 UI를 TDD로 구현하라. 클라이언트는 파일 선택, 순서 조정, 상태 표시, API 호출만 담당하고 실제 PDF 병합 로직을 포함하면 안 된다.

필수 파일과 기대사항:

- `/src/app/page.tsx`
  - PDF 업로드 드롭존을 첫 화면 주요 조작으로 제공한다.
  - 파일 리스트, 순서 변경, 삭제, 병합 실행, 취소, 성공/오류, 재다운로드 흐름을 연결한다.
- `/src/components/`
  - 필요하면 업로드, 파일 리스트, 상태 카드, 스텝 바, 액션 패널로 컴포넌트를 나눈다.
  - 파일 리스트 행은 드래그 핸들 표시와 위/아래 이동 버튼을 모두 제공한다.
  - 동일 파일명은 표시명으로 구분하고 내부 식별자는 별도 id를 사용한다.
- `/src/app/globals.css`
  - UI_GUIDE의 색상, 카드, 버튼, 입력, 레이아웃 규칙을 반영한다.
  - 라이트 모드 고정, 웜 화이트 배경, 순백 카드, 블루 포인트 컬러, 스텝 바 + 상태 카드 구조를 유지한다.
- 클라이언트 상태
  - `empty`, `ready`, `running`, `success`, `error` 다섯 상태를 사용한다.
  - 진행 단계는 `파일 준비 완료`, `업로드/검증 중`, `병합 중`, `다운로드 준비 완료` 네 단계로 고정한다.
  - 병합 중에는 업로드, 삭제, 재정렬, 재실행을 잠그고 취소만 허용한다.
- 다운로드
  - 성공 응답 PDF Blob을 자동 다운로드 시도한다.
  - 자동 다운로드 실패 또는 놓친 경우를 위해 성공 상태에서 `다시 다운로드` 버튼을 제공한다.
- 오류 표시
  - 문제 파일명과 원인을 포함한다.
  - 사용자가 무엇을 고쳐야 하는지 알 수 있게 표시한다.

테스트는 최소 다음을 검증해야 한다:

- 초기 빈 상태와 비활성 병합 버튼
- PDF 파일 2개 선택 후 ready 상태
- 순서 위/아래 이동과 삭제
- 병합 중 컨트롤 잠금과 취소 버튼 활성화
- API 성공 시 다운로드 흐름과 재다운로드 버튼
- API 오류 시 문제 파일명/원인 표시

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
   - 성공 -> `"status": "completed"`, `"summary": "PDF 병합 웹 UI와 상태/다운로드/오류 테스트 구현"`
   - 수정 3회 시도 후에도 실패 -> `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 -> `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- 클라이언트 컴포넌트에서 `pdf-lib`나 서버 전용 병합 모듈을 import하지 마라. 이유: PDF 처리 모듈은 클라이언트 번들에 포함하면 안 된다.
- UI_GUIDE의 금지 패턴인 blur, gradient text, glow animation, purple/indigo 중심 색상, gradient orb를 사용하지 마라. 이유: 프로젝트의 명시적 디자인 제약이다.
- PDF 미리보기, 분할, 회전, 압축, 페이지 편집을 추가하지 마라. 이유: MVP 제외 범위다.
- 기존 테스트를 깨뜨리지 마라
