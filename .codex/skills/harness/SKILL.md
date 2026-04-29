---
name: harness
description: Guide Codex work in this repository's Harness framework workflow. Use when the user asks to plan implementation steps, generate or update `phases/*.json` and `phases/*/step*.md`, follow the Harness execution flow, or work within the project's documented step-based delivery process.
---

# Harness

Follow this repository's Harness workflow.

## Workflow

### A. Explore

Read documents under `/docs/` such as `PRD`, `ARCHITECTURE`, and `ADR` first. Understand the product intent, architecture, and design constraints before proposing or changing code.

Use subagents only when the user explicitly asks for delegation or parallel agent work.

### B. Discuss

If implementation requires unresolved technical decisions or scope clarification, raise them to the user before writing the phase plan.

### C. Design Steps

When the user asks for an implementation plan, draft it as multiple steps and ask for feedback before creating files.

Apply these rules:

1. Keep scope minimal. Each step should cover one layer or module. Split steps when multiple modules would otherwise change together.
2. Keep each step self-contained. Each `stepN.md` runs in an independent Codex session, so do not rely on prior chat context.
3. Force preparation. List the required docs and previously changed files so the session rebuilds context from source files first.
4. Specify interfaces, not full implementations. Define file paths and signature-level expectations, and state non-negotiable rules such as idempotency, security, or data integrity.
5. Make acceptance criteria executable. Use real commands such as `npm run build` or `npm test`.
6. Make cautions concrete. State what must not be done and why.
7. Use kebab-case step names. Keep them short and focused, such as `project-setup`, `api-layer`, or `auth-flow`.

### D. Create Files

When the user approves, create these files.

#### D-1. `phases/index.json`

This is the top-level index for multiple tasks. If it already exists, append a new item to `phases`.

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

Rules:

- `dir`: task directory name
- `status`: one of `pending`, `completed`, `error`, `blocked`
- Do not add timestamps during creation. `execute.py` writes them when status changes.

#### D-2. `phases/{task-name}/index.json`

```json
{
  "project": "<프로젝트명>",
  "phase": "<task-name>",
  "steps": [
    { "step": 0, "name": "project-setup", "status": "pending" },
    { "step": 1, "name": "core-types", "status": "pending" },
    { "step": 2, "name": "api-layer", "status": "pending" }
  ]
}
```

Rules:

- `project`: use the project name from `AGENTS.md`
- `phase`: match the directory name
- `steps[].step`: zero-based order
- `steps[].name`: kebab-case slug
- `steps[].status`: initialize all to `pending`

Status transitions:

- `completed`: add `summary`; `execute.py` adds `completed_at`
- `error`: add `error_message`; `execute.py` adds `failed_at`
- `blocked`: add `blocked_reason`; `execute.py` adds `blocked_at`

Write `summary` as a one-line handoff for the next step, including created files and key decisions.

Do not create `created_at` or `started_at`. `execute.py` manages them.

#### D-3. `phases/{task-name}/step{N}.md`

Use this template:

```markdown
# Step {N}: {이름}

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- {이전 step에서 생성/수정된 파일 경로}

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

{구체적인 구현 지시. 파일 경로, 클래스/함수 시그니처, 로직 설명을 포함.
코드 스니펫은 인터페이스/시그니처 수준만 제시하고, 구현체는 에이전트에게 맡겨라.
단, 설계 의도에서 벗어나면 안 되는 핵심 규칙은 명확히 박아넣어라.}

## Acceptance Criteria

```bash
npm run build
npm test
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 디렉토리 구조를 따르는가?
   - ADR 기술 스택을 벗어나지 않았는가?
   - AGENTS.md CRITICAL 규칙을 위반하지 않았는가?
3. 결과에 따라 `phases/{task-name}/index.json`의 해당 step을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "산출물 한 줄 요약"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- {이 step에서 하지 말아야 할 것. "X를 하지 마라. 이유: Y" 형식}
- 기존 테스트를 깨뜨리지 마라
```

### E. Execute

```bash
python3 scripts/execute.py {task-name}
python3 scripts/execute.py {task-name} --push
```

`execute.py` handles:

- branch creation and checkout for `feat-{task-name}`
- guardrail injection from `AGENTS.md` and `docs/*.md`
- summary handoff between steps
- up to 3 retry attempts on failure
- separate commits for code and metadata
- automatic timestamps

Error recovery:

- For `error`, set the step status back to `pending`, remove `error_message`, then rerun.
- For `blocked`, resolve the issue, set the status back to `pending`, remove `blocked_reason`, then rerun.
