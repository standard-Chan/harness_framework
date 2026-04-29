# 프로젝트: PDF Merge Service

## 기술 스택
- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- pdf-lib
- Node.js 기반 로컬 CLI

## 아키텍처 규칙
- CRITICAL: 웹 UI의 실제 PDF 병합은 반드시 서버에서 수행할 것. 클라이언트에서 PDF 병합 로직을 실행하지 말 것.
- CRITICAL: 웹 API와 CLI는 반드시 동일한 공용 병합 코어를 사용할 것. 웹과 CLI에 중복 병합 로직을 따로 구현하지 말 것.
- CRITICAL: PDF 처리 모듈은 클라이언트 번들에 포함하지 말 것. 서버 전용 코드와 UI 코드를 명확히 분리할 것.
- CRITICAL: 병합 결과는 입력 순서에 따른 페이지 병합 정확성만 보장할 것. 북마크, 폼, 첨부파일, 원본 메타데이터 보존 기능을 암묵적으로 추가하지 말 것.
- CRITICAL: 업로드 파일과 결과 파일은 성공, 실패, 취소 후 즉시 정리할 것. 영구 저장이나 작업 이력을 추가하지 말 것.
- CRITICAL: 입력 제한은 문서 기준을 유지할 것. 최소 2개 파일, 최대 20개 파일, 파일당 50MB, 총합 200MB를 넘기지 말 것.
- CRITICAL: 병합 중 UI는 읽기 전용 상태여야 하며, 업로드/삭제/재정렬/재실행을 잠그고 취소만 허용할 것.
- CRITICAL: 오류 메시지는 문제 파일명과 원인을 포함할 것. `merge failed` 같은 추상적 메시지만 남기지 말 것.
- 모든 API 로직은 `src/app/api/` 라우트 핸들러를 통해 진입시키고, 비즈니스 로직은 `src/lib/`에 둘 것.
- UI 컴포넌트는 `src/components/`, 타입은 `src/types/`, CLI 엔트리포인트는 `src/cli/`에 둘 것.
- 동일 파일명이 업로드되면 UI 표시명으로 구분하되, 내부 식별자는 별도 `id`를 사용할 것.
- 취소는 클라이언트 요청 취소 기준으로 구현하고, 서버는 연결 종료 감지 후 가능한 범위에서 중단 및 정리를 수행할 것.
- 결과 다운로드는 `POST /api/merge`의 성공 응답에서 `application/pdf` 바이너리를 직접 반환하는 흐름을 유지할 것.
- UI는 라이트 모드 고정, 웜 화이트 배경, 순백 카드, 블루 포인트 컬러, 스텝 바 + 상태 카드 구조를 유지할 것.

## 개발 프로세스
- CRITICAL: 새 기능 구현 시 반드시 테스트를 먼저 작성하고, 테스트가 통과하는 구현을 작성할 것 (TDD).
- CRITICAL: 기능 추가 시 웹 경로와 CLI 경로가 같은 규칙으로 동작하는지 함께 검증할 것.
- CRITICAL: 입력 검증, 파일 정리, 오류 처리, 취소 흐름은 happy path보다 우선해서 테스트할 것.
- PRD.md, ARCHITECTURE.md, ADR.md, UI_GUIDE.md를 먼저 읽고 그 범위를 벗어나는 기능은 구현하지 말 것.
- 커밋 메시지는 conventional commits 형식을 따를 것 (`feat:`, `fix:`, `docs:`, `refactor:` 등).
- UI 구현 시 `UI_GUIDE.md`의 색상값, 상태 표현, 레이아웃 규칙을 임의로 바꾸지 말 것.

## 명령어
- `npm run dev`      # Next.js 개발 서버
- `npm run build`    # 프로덕션 빌드
- `npm run lint`     # ESLint
- `npm run test`     # 테스트
- `npm run cli -- <args>` # 로컬 CLI 실행
