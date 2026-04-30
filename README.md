# PDF Merge Service

Harness Framework를 통해 구현한 간단한 PDF 병합 서비스입니다. 웹 UI와 CLI 환경에서 PDF 파일을 병합할 수 있습니다.

만든 목적 : 일반적인 웹사이트에서는 merge 제한이 있기에, 제한 없이 사용하기 위해서 제작하였습니다.

(npm install이 있어서 간단하지는 않을 수 있겠네요)

## 🎯 프로젝트 개요

- **웹 UI**: 인터페이스를 통한 직관적인 PDF 병합
- **CLI 도구**: 로컬 환경에서 cli를 통한 PDF 병합

## 시작하기

### 설치
```bash
npm install
```

### 빌드
```bash
npm run build
npm start
```

## 📖 사용 방법

### 방법 1 - 웹 UI 사용

1. [http://localhost:3000](http://localhost:3000) 접속
2. PDF 파일 업로드 (최소 2개, 최대 20개)
3. 파일 순서 확인 후 병합 실행
4. 결과 PDF 다운로드

**주의사항**:
- 파일당 최대 50MB
- 총 용량 제한 200MB
- 병합 중에는 재정렬, 삭제, 재실행 불가 (취소만 가능)

### 방법 2 - CLI 사용

```bash
npm run cli -- <pdf-file-1> <pdf-file-2> [...] --output <output-file>
```

**예시**:
```bash
npm run cli -- file1.pdf file2.pdf file3.pdf --output merged.pdf
```

**옵션**:
- `--output`: 결과 파일 경로 (필수)


## 📂 프로젝트 구조

```
src/ # 구현 내용
docs/
├── PRD.md           # 요구사항
├── ARCHITECTURE.md  # 아키텍처 설계
├── ADR.md          # 기술 결정 사항
└── UI_GUIDE.md     # UI/UX 가이드
```

## 📚 상세 문서

구현 및 설계에 대한 자세한 내용은 다음 문서를 참고하세요:
다음 'original' branch에서 codex 용 루프 구현을 진행할 수 있습니다.
[링크](https://github.com/standard-Chan/harness_framework/tree/original)

- [AGENTS.md](./AGENTS.md) - 개발 규칙 및 아키텍처 규칙
- [PROCESS_FLOW.md](./PROCESS_FLOW.md) - Harness 프레임워크 처리 흐름
- [docs/PRD.md](./docs/PRD.md) - 제품 요구사항 정의서
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - 상세 아키텍처 설계
- [docs/UI_GUIDE.md](./docs/UI_GUIDE.md) - UI 디자인 가이드
