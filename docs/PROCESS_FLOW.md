# Harness 처리 흐름

이 문서는 현재 Harness 프레임워크가 Codex 기준으로 어떻게 동작하는지 정리한다. 전체 흐름은 `docs/` 문서를 입력으로 받아 `/harness` 명령에서 실행 계획을 만들고, `scripts/execute.py`가 각 step을 독립 Codex 세션으로 순차 실행하는 구조다.

## 구성 파일

| 경로 | 역할 |
|------|------|
| `README.md` | 사용자가 어떤 문서를 채워야 하는지와 기본 사용 흐름을 설명한다. |
| `AGENTS.md` | Codex가 지켜야 할 프로젝트 규칙, 기술 스택, CRITICAL 규칙, 검증 명령을 담는다. |
| `docs/PRD.md` | 만들 제품의 목표, 사용자, 핵심 기능, MVP 제외 범위를 정의한다. |
| `docs/ARCHITECTURE.md` | 디렉토리 구조, 패턴, 데이터 흐름, 상태 관리 방식을 정의한다. |
| `docs/ADR.md` | 주요 기술 결정과 이유, 트레이드오프를 기록한다. |
| `docs/UI_GUIDE.md` | UI 구현 시 지켜야 할 디자인 원칙과 금지 패턴을 정의한다. |
| `.codex/commands/harness.md` | `/harness` 명령이 따라야 하는 계획 수립 및 phase 파일 생성 절차를 정의한다. |
| `.codex/commands/review.md` | 변경 사항 리뷰 시 읽을 문서와 체크리스트를 정의한다. |
| `scripts/execute.py` | 생성된 phase의 step을 Codex로 순차 실행하고 상태, 커밋, 재시도를 관리한다. |

## 전체 흐름

```text
사용자 문서 작성
  -> /harness 실행
  -> Codex가 docs/와 AGENTS.md를 읽고 사용자와 구현 범위 논의
  -> phase/step 계획 작성
  -> phases/index.json 및 phases/{task}/ 파일 생성
  -> python3 scripts/execute.py {task-name}
  -> execute.py가 step별 Codex 세션 실행
  -> 각 step이 구현, 검증, index.json 상태 업데이트
  -> execute.py가 timestamp, output, commit, retry, 최종 완료 처리
```

## 1. 입력 문서 작성

사용자는 먼저 `docs/` 하위 문서와 `AGENTS.md`를 채운다.

`PRD.md`에는 무엇을 만들지와 MVP에서 제외할 범위를 적는다. 제외 범위가 없으면 Codex가 필요 이상의 기능을 구현할 수 있으므로, 만들지 않을 것을 명확히 적는 것이 중요하다.

`ARCHITECTURE.md`에는 디렉토리 구조, 설계 패턴, 데이터 흐름, 상태 관리 방식을 적는다. 이후 step 파일과 리뷰 체크리스트는 이 문서를 기준으로 아키텍처 위반 여부를 판단한다.

`ADR.md`에는 기술 선택의 이유와 트레이드오프를 적는다. 이는 Codex가 임의로 다른 스택이나 구조를 선택하지 않도록 하는 의사결정 근거다.

`UI_GUIDE.md`에는 UI 원칙과 금지 패턴을 적는다. 프론트엔드 구현 step에서는 이 문서가 시각적 품질과 일관성을 제한하는 가드레일 역할을 한다.

`AGENTS.md`에는 프로젝트 규칙과 CRITICAL 규칙, 빌드/테스트 명령을 적는다. `execute.py`는 이 파일을 매 step 프롬프트에 포함한다.

## 2. `/harness` 계획 수립

`.codex/commands/harness.md`는 `/harness` 명령의 작업 방식을 정의한다.

처리 순서는 다음과 같다.

1. `docs/` 하위 문서와 `AGENTS.md`를 읽어 기획, 아키텍처, 설계 의도를 파악한다.
2. 구현을 위해 결정해야 할 내용이 있으면 사용자와 논의한다.
3. 구현 계획을 여러 step으로 나눈다.
4. 사용자가 승인하면 `phases/` 아래 실행 파일을 생성한다.
5. 사용자는 `python3 scripts/execute.py {task-name}`으로 실행한다.

step 설계의 핵심 원칙은 자기완결성이다. 각 step은 독립된 Codex 세션에서 실행되므로, step 파일 안에는 읽어야 할 파일, 작업 범위, Acceptance Criteria, 검증 절차, 금지사항이 모두 들어 있어야 한다.

## 3. Phase 파일 구조

`/harness`가 생성하는 실행 단위는 `phases/` 아래에 저장된다.

```text
phases/
├── index.json
└── {task-name}/
    ├── index.json
    ├── step0.md
    ├── step1.md
    └── stepN.md
```

`phases/index.json`은 전체 task 목록과 상태를 담는다.

```json
{
  "phases": [
    {
      "dir": "0-mvp",
      "status": "pending"
    }
  ]
}
```

`phases/{task-name}/index.json`은 해당 task의 step 목록과 상태를 담는다.

```json
{
  "project": "<프로젝트명>",
  "phase": "<task-name>",
  "steps": [
    { "step": 0, "name": "project-setup", "status": "pending" },
    { "step": 1, "name": "core-types", "status": "pending" }
  ]
}
```

각 `stepN.md`는 Codex가 실제로 수행할 독립 작업 지시서다. 반드시 읽어야 할 파일, 작업 내용, 검증 명령, 성공/실패/차단 시 index 업데이트 규칙을 포함한다.

## 4. 실행 시작

실행 명령은 다음과 같다.

```bash
python3 scripts/execute.py {task-name}
python3 scripts/execute.py {task-name} --push
```

`StepExecutor.run()`은 다음 순서로 동작한다.

1. 헤더를 출력한다.
2. 기존 `error` 또는 `blocked` step이 있는지 검사한다.
3. `feat-{phase}` 브랜치로 checkout하거나 새로 만든다.
4. `AGENTS.md`와 `docs/*.md`를 읽어 guardrails 문자열을 만든다.
5. task 레벨 `created_at`이 없으면 기록한다.
6. pending step을 순차 실행한다.
7. 모든 step이 끝나면 phase 완료 상태를 기록하고 필요 시 push한다.

## 5. Guardrails 생성

`execute.py`의 `_load_guardrails()`는 다음 파일을 매 step 프롬프트에 포함한다.

1. `AGENTS.md`
2. `docs/*.md`

문서는 `---` 구분자로 이어 붙는다. 이렇게 만들어진 guardrails는 모든 Codex step 실행에 공통 컨텍스트로 들어간다.

## 6. Step 프롬프트 구성

각 step 실행 전에 `_build_preamble()`이 공통 프롬프트를 만든다.

프롬프트에는 다음 내용이 포함된다.

- 프로젝트명
- `AGENTS.md`와 `docs/*.md`에서 읽은 guardrails
- 완료된 이전 step의 `summary`
- 재시도 중이면 이전 실패 에러
- 작업 규칙
- index 상태 업데이트 규칙
- 커밋 메시지 예시
- 현재 `stepN.md` 본문

완료된 이전 step의 summary는 `_build_step_context()`가 다음 형식으로 누적한다.

```text
## 이전 Step 산출물

- Step 0 (project-setup): ...
- Step 1 (core-types): ...
```

## 7. Codex 호출

`_invoke_codex()`는 각 step을 다음 명령으로 실행한다.

```bash
codex exec --dangerously-bypass-approvals-and-sandbox --json -C <project-root> "<prompt>"
```

실행 결과는 `phases/{task-name}/step{N}-output.json`에 저장된다.

```json
{
  "step": 0,
  "name": "project-setup",
  "exitCode": 0,
  "stdout": "...",
  "stderr": "..."
}
```

`--json` 출력은 Codex 이벤트 JSONL을 stdout에 남긴다. `execute.py`는 stdout/stderr를 저장하지만, 성공 여부는 Codex 프로세스 종료 코드가 아니라 step이 `index.json`에 기록한 상태를 기준으로 판단한다.

## 8. Step 상태 전이

step 실행 후 `execute.py`는 `phases/{task-name}/index.json`의 해당 step 상태를 다시 읽는다.

| 상태 | 의미 | 후속 처리 |
|------|------|----------|
| `pending` | 아직 실행 전이거나 재시도 대상 | 다음 실행 대상이 된다. |
| `completed` | AC 검증과 작업이 완료됨 | `completed_at` 기록 후 커밋한다. |
| `error` | 자동 수정으로 해결하지 못함 | `failed_at`, `error_message` 기록 후 중단한다. |
| `blocked` | 사용자 개입이 필요함 | `blocked_at`, `blocked_reason` 기록 후 중단한다. |

Codex 세션은 성공 시 다음 필드를 직접 기록해야 한다.

```json
{
  "status": "completed",
  "summary": "산출물 한 줄 요약"
}
```

실패 시에는 다음 필드를 기록해야 한다.

```json
{
  "status": "error",
  "error_message": "구체적 에러 내용"
}
```

사용자 개입이 필요하면 다음 필드를 기록해야 한다.

```json
{
  "status": "blocked",
  "blocked_reason": "구체적 사유"
}
```

## 9. 재시도 흐름

`MAX_RETRIES`는 3이다.

step 실행 후 상태가 `completed`나 `blocked`가 아니면 실패로 간주한다. `error_message`가 있으면 그 내용을, 없으면 `Step did not update status`를 실패 사유로 사용한다.

최대 시도 횟수에 도달하기 전에는 다음 처리를 한다.

1. 해당 step의 상태를 다시 `pending`으로 되돌린다.
2. `error_message`를 삭제한다.
3. 이전 에러를 다음 Codex 프롬프트에 포함한다.
4. 같은 step을 다시 실행한다.

3회 모두 실패하면 상태를 `error`로 확정하고 `failed_at`과 최종 `error_message`를 기록한 뒤 종료한다.

## 10. 커밋 흐름

각 step 완료 후 `_commit_step()`은 2단계 커밋을 수행한다.

첫 번째 커밋은 코드 변경만 대상으로 한다.

```text
feat({phase}): step {num} — {name}
```

이를 위해 먼저 전체 변경을 stage한 뒤, 해당 step의 output 파일과 phase index 파일은 reset해서 제외한다.

두 번째 커밋은 output과 index 같은 실행 메타데이터를 포함한다.

```text
chore({phase}): step {num} output
```

모든 step 완료 후 `_finalize()`는 phase 전체 완료 시각을 기록하고 남은 변경이 있으면 다음 커밋을 만든다.

```text
chore({phase}): mark phase completed
```

`--push` 옵션이 있으면 마지막에 `origin/feat-{phase}`로 push한다.

## 11. 에러 복구

실행 시작 시 `_check_blockers()`는 뒤에서부터 step 상태를 검사한다.

기존 `error` step이 있으면 실행을 중단한다. 사용자는 `phases/{task-name}/index.json`에서 해당 step의 `status`를 `pending`으로 바꾸고 `error_message`를 삭제한 뒤 재실행해야 한다.

기존 `blocked` step이 있으면 실행을 중단한다. 사용자는 `blocked_reason`에 적힌 문제를 해결한 뒤 `status`를 `pending`으로 바꾸고 `blocked_reason`을 삭제한 뒤 재실행해야 한다.

## 12. 리뷰 흐름

`.codex/commands/review.md`는 변경 사항 검토 기준을 정의한다.

리뷰 시 먼저 다음 파일을 읽는다.

1. `AGENTS.md`
2. `docs/ARCHITECTURE.md`
3. `docs/ADR.md`

그 다음 변경 파일을 확인하고 다음 항목을 검증한다.

- 아키텍처 준수
- 기술 스택 준수
- 테스트 존재
- CRITICAL 규칙 위반 여부
- 빌드 가능 여부

## 13. 현재 구조의 중요한 전제

`execute.py`는 Codex가 실제 구현뿐 아니라 `phases/{task-name}/index.json` 상태 업데이트까지 수행한다고 가정한다. Codex가 index 상태를 바꾸지 않으면 step은 실패로 간주되어 재시도된다.

각 step은 독립 세션으로 실행되므로 대화 컨텍스트를 기대하면 안 된다. 필요한 맥락은 `AGENTS.md`, `docs/*.md`, 이전 step summary, 그리고 `stepN.md` 안에 모두 있어야 한다.

`step{N}-output.json`은 `.gitignore`에 의해 ignore된다. 다만 `_commit_step()`은 output과 index를 housekeeping 커밋 대상으로 삼도록 설계되어 있으므로, 실제 커밋 정책을 엄격히 적용하려면 ignore 규칙과 커밋 의도를 함께 재검토해야 한다.
