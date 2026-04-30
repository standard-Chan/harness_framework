# Step 0: project-setup

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/AGENTS.md`
- `/docs/PRD.md`
- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- `/docs/UI_GUIDE.md`

이 step은 아직 애플리케이션 코드가 없다는 전제에서 Next.js + TypeScript 프로젝트 골격과 테스트 실행 환경만 만든다.

## 작업

Next.js App Router, TypeScript strict mode, Tailwind CSS, pdf-lib 기반 MVP를 구현할 수 있는 프로젝트 기반을 구성하라.

필수 파일과 기대사항:

- `/package.json`
  - `scripts`는 최소 `dev`, `build`, `lint`, `test`, `cli`를 제공한다.
  - 런타임 의존성은 Next.js, React, pdf-lib 중심으로 유지한다.
  - 테스트는 Node/TypeScript 코드와 React 컴포넌트 테스트를 실행할 수 있어야 한다.
- `/tsconfig.json`
  - strict mode를 켠다.
  - `@/*` path alias를 `src/*`로 연결한다.
- `/next.config.*`, `/postcss.config.*`, `/tailwind.config.*`
  - Next.js App Router와 Tailwind CSS가 동작하도록 최소 설정한다.
- `/eslint.config.*` 또는 프로젝트에 맞는 ESLint 설정
  - `npm run lint`가 실행 가능해야 한다.
- `/src/app/layout.tsx`, `/src/app/page.tsx`, `/src/app/globals.css`
  - 앱이 빌드 가능한 최소 화면을 제공한다.
  - UI 색상 기본값은 `docs/UI_GUIDE.md`의 라이트 모드 색상을 따른다.
- `/src/types/index.ts`
  - 이후 step에서 공유할 기본 타입 위치만 만든다.
- `/src/lib/`
  - 이후 step이 사용할 디렉토리만 준비한다.
- `/src/components/`
  - 이후 step이 사용할 디렉토리만 준비한다.
- `/src/cli/`
  - 이후 step이 사용할 디렉토리만 준비한다.
- `/src/test/`
  - 테스트 유틸 또는 설정 파일이 필요하면 이 하위에 둔다.

TypeScript, Next.js, Tailwind 설정만 다루고 PDF 병합 로직, API 라우트, CLI 기능, 완성 UI는 구현하지 마라.

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
   - 성공 -> `"status": "completed"`, `"summary": "Next.js/TypeScript/Tailwind/test 프로젝트 골격 생성"`
   - 수정 3회 시도 후에도 실패 -> `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 -> `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- PDF 병합 로직을 구현하지 마라. 이유: step 1에서 공용 코어로 TDD 구현해야 한다.
- API 라우트를 구현하지 마라. 이유: step 2에서 서버 진입점을 별도로 검증해야 한다.
- CLI 동작을 구현하지 마라. 이유: step 3에서 공용 코어 재사용 여부를 검증해야 한다.
- 완성형 웹 UI를 구현하지 마라. 이유: step 4에서 UI_GUIDE 기준으로 구현해야 한다.
- 기존 테스트를 깨뜨리지 마라
