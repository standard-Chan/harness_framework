# Harness Framework

Harness Framework는 문서 기반으로 구현 계획을 만들고, step 단위로 Codex 실행을 자동화하는 작업 방식입니다.

- `/original` 브랜치에 참고용 harness framework가 있습니다.

## 문서 작성 가이드

### docs/PRD.md
- 무엇을 만들지 정의합니다.
- 반드시 MVP 제외 사항을 적습니다. (적지 않으면, AI가 필요 이상으로 구현합니다)

### docs/ARCHITECTURE.md
- 어떻게 만들지 정의합니다.
- 디렉토리 구조, 패턴, 데이터 흐름, 상태 관리 기준을 적습니다.

### docs/ADR.md
- 왜 이렇게 만들지 정의합니다.
- 결정, 이유, 트레이드오프를 기록합니다.

### docs/UI_GUIDE.md
- UI 원칙과 금지 패턴을 정의합니다.

### AGENTS.md
- 프로젝트 규칙, CRITICAL 규칙, 검증 명령을 정의합니다.

## HARNESS 사용 방법 (간단 흐름)

1. `docs/*.md`와 `AGENTS.md`를 프로젝트에 맞게 채웁니다. 필요시, plan 모드를 사용하면 좋습니다.
2. `/harness` 명령을 실행합니다.
-- 이후 AI 자동 처리 루프 -- 
1. `phases/index.json`, `phases/{task-name}/index.json`, `phases/{task-name}/step*.md`를 생성합니다.
2. 아래 명령으로 실행합니다.

```bash
python3 scripts/execute.py {task-name}
python3 scripts/execute.py {task-name} --push
```

3. 실행 중 `error` 또는 `blocked`가 나오면 `phases/{task-name}/index.json`에서 해당 step을 `pending`으로 되돌리고 사유 필드를 정리한 뒤 재실행합니다.

## 예시 프로젝트 

- main 브랜치 참고

Harness Framework를 사용해 PDF merge tool을 구현할 수 있습니다.
- WEB UI
- terminal


