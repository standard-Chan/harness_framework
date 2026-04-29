# 문서 설명

간단한 harness framework 를 사용하여 서비스를 구현할 수 있습니다.

- `/original` 브랜치에 codex 용도로 사용할 수 있는 harness framework 를 저장하였습니다. (필요 시 참고)

## PDF merge tool
harness framework를 사용하여 PDF merge tool을 구현하였습니다.
다음 환경에서의 merge 기능을 제공합니다.
- WEB UI
- terminal


## PRD.md
뭘 만드는지를 작성.

**★ MVP 제외사항 ★** -> 이 문항이 없으면, AI가 모든것을 만들려고함. 따라서 만들지 않을 것을 명확하게 작성

## ARCHITECTURE.md
어떻게 만드는지
ex. 아키텍처, 디렉토리 구조, 패턴, 데이터 흐름

## ADR.md
왜 이렇게 만드는지
```text
### ADR-001: {결정}
걸정: {선택}
이유: {근거}
트레이드오프: {포기}

### ADR-002: ...
```

**★ 트레이드 오프 ★**

# 실행 흐름
## /harness 명령 실행 흐름
1. docs/ 문서를 전부 읽는다.
2. 사용자와 논의한다.
3. 구현 계획을 Phase로 쪼갠다.
4. Phase 파일을 생성한다.
5. execute.py(파이프라인) 를 실행한다.

## 사용 방법
`docs/` 문서를 채우고, `/harness` 명령을 실행한다.


