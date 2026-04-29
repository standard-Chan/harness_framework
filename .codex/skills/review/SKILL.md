---
name: review
description: Review changes in this repository against project guardrails. Use when the user asks for a code review, architecture compliance check, ADR compliance check, test coverage check, or build-readiness review for local changes.
---

# Review

Review repository changes against project rules and documents.

## Required Reading

Read these files first:

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`

Then inspect the changed files and evaluate them against the checklist below.

## Checklist

1. Architecture compliance: does the change follow the directory structure in `ARCHITECTURE.md`?
2. Tech stack compliance: does the change stay within the choices defined in `ADR.md`?
3. Test coverage: are tests added or updated for the new behavior?
4. Critical rules: does the change violate any `CRITICAL` rule in `AGENTS.md`?
5. Build readiness: do the relevant build or test commands pass?

## Review Output

Prefer a code-review response with findings first.

- List concrete issues by severity.
- Reference files and lines when possible.
- Explain why each issue matters.
- Suggest a concrete fix or follow-up.

If the user explicitly wants a checklist table, use this format:

| 항목 | 결과 | 비고 |
|------|------|------|
| 아키텍처 준수 | ✅/❌ | {상세} |
| 기술 스택 준수 | ✅/❌ | {상세} |
| 테스트 존재 | ✅/❌ | {상세} |
| CRITICAL 규칙 | ✅/❌ | {상세} |
| 빌드 가능 | ✅/❌ | {상세} |

If there are violations, provide specific remediation steps.
