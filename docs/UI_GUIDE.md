# UI 디자인 가이드

## 디자인 원칙
1. 초보 사용자도 첫 화면에서 "PDF를 올리고, 순서를 바꾸고, 병합한다"를 바로 이해해야 한다.
2. 파일 순서와 현재 진행 상태가 장식 요소보다 먼저 보여야 한다.
3. 성공, 오류, 진행 상태는 색, 텍스트, 아이콘, 버튼 상태로 동시에 드러나야 한다.

## AI 슬롭 안티패턴 — 하지 마라
| 금지 사항 | 이유 |
|-----------|------|
| backdrop-filter: blur() | glass morphism은 AI 템플릿의 가장 흔한 징후 |
| gradient-text (배경 그라데이션 텍스트) | AI가 만든 SaaS 랜딩의 1번 특징 |
| "Powered by AI" 배지 | 기능이 아니라 장식. 사용자에게 가치 없음 |
| box-shadow 글로우 애니메이션 | 네온 글로우 = AI 슬롭 |
| 보라/인디고 브랜드 색상 | "AI = 보라색" 클리셰 |
| 모든 카드에 동일한 rounded-2xl | 균일한 둥근 모서리는 템플릿 느낌 |
| 배경 gradient orb (blur-3xl 원형) | 모든 AI 랜딩 페이지에 있는 장식 |

## 색상
### 배경
| 용도 | 값 |
|------|------|
| 페이지 | #F7F4EE |
| 보조 섹션 | #F1ECE3 |
| 카드 | #FFFFFF |

### 텍스트
| 용도 | 값 |
|------|------|
| 주 텍스트 | #1F2937 |
| 본문 | #4B5563 |
| 보조 | #6B7280 |
| 비활성 | #9CA3AF |

### 데이터/시맨틱 색상
| 용도 | 값 |
|------|------|
| Primary | #3B82F6 |
| Primary Soft Background | #DBEAFE |
| Primary Hover | #2563EB |
| Success | #16A34A |
| Success Background | #DCFCE7 |
| Error | #DC2626 |
| Error Background | #FEE2E2 |
| Warning | #D97706 |
| Warning Background | #FEF3C7 |
| Neutral Border | #E5E7EB |

## 컴포넌트
### 카드
```
rounded-xl bg-white border border-[#E5E7EB] p-5 md:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]
```

### 버튼
```
Primary: rounded-xl bg-[#DBEAFE] text-[#1D4ED8] hover:bg-[#BFDBFE] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF]
Danger:  rounded-xl bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FECACA]
Text:    text-[#6B7280] hover:text-[#1F2937]
```

### 입력 필드
```
rounded-xl bg-white border border-[#D1D5DB] px-4 py-3 text-[#1F2937] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#DBEAFE]
```

## 레이아웃
- 전체 너비: 데스크톱 `max-w-6xl`, 모바일 `max-w-full`
- 정렬: 좌측 정렬 기본. 중앙 정렬 hero 레이아웃 금지
- 데스크톱: 좌측 60~65% 업로드/리스트, 우측 35~40% 상태/액션 패널
- 모바일: 업로드 → 파일 리스트 → 상태 → 액션 → 결과의 1열 흐름
- 간격: 카드 내부 `gap-3~4`, 섹션 간 `space-y-6~8`

## 타이포그래피
| 용도 | 스타일 |
|------|--------|
| 페이지 제목 | text-3xl md:text-4xl font-semibold text-[#1F2937] |
| 카드 제목 | text-base font-semibold text-[#1F2937] |
| 본문 | text-sm text-[#4B5563] leading-6 |
| 보조 문구 | text-sm text-[#6B7280] |
| 파일명 | text-sm md:text-base font-medium text-[#111827] |

## 애니메이션
- 드래그 재정렬 시 짧은 위치 이동 애니메이션 허용
- 상태 카드 전환 시 fade-in 0.2s~0.25s 허용
- 버튼과 카드 hover는 미세한 배경색 변화만 허용
- bounce, glow, blur orb, 과한 scale 애니메이션 금지

## 아이콘
- SVG 인라인, strokeWidth 1.75 기준
- 업로드, 파일, 정렬, 성공, 오류, 다운로드 정도만 사용
- 원형 배경 배지형 아이콘 남용 금지
- 아이콘만으로 상태를 전달하지 말고 텍스트를 반드시 함께 제공

## 상태별 UI 규칙
- 빈 상태:
  - 드롭존이 화면에서 가장 먼저 보이도록 한다
  - 병합 버튼은 비활성화한다
  - 파일 제한 규칙을 드롭존 하단에 함께 노출한다
- 준비 상태:
  - 파일 리스트를 메인 시각 요소로 사용한다
  - 드래그 핸들과 위/아래 이동 버튼을 모두 노출한다
  - 병합 버튼을 가장 명확한 CTA로 배치한다
- 진행 상태:
  - 스텝 바 + 상태 카드 조합으로 현재 단계를 보여준다
  - 업로드, 삭제, 재정렬, 병합 재실행은 잠근다
  - 취소 버튼만 활성화한다
- 성공 상태:
  - 연한 초록색 성공 카드와 완료 메시지를 노출한다
  - 자동 다운로드가 실패했을 경우를 대비해 재다운로드 버튼을 보여준다
  - 결과 파일명을 상태 카드 안에 함께 표시한다
- 오류 상태:
  - 연한 빨간색 오류 카드와 문제 파일명을 함께 표시한다
  - "무엇이 실패했는지"와 "사용자가 무엇을 고쳐야 하는지"를 모두 써야 한다

## 주요 화면 요소
- 업로드 드롭존:
  - 점선 보더와 연한 블루 hover 상태를 사용한다
  - PDF 아이콘, 안내 문구, 제한 규칙 요약을 포함한다
- 파일 리스트 행:
  - 높이 56px~64px
  - 좌측: 드래그 핸들 + 순번
  - 중앙: 표시 파일명 + 파일 크기
  - 우측: 위/아래 이동 + 제거 버튼
- 상태 카드:
  - 현재 단계 제목
  - 한 줄 설명
  - 보조 설명 또는 오류 원인
- 다운로드 버튼:
  - 성공 상태에서만 노출한다
  - 자동 다운로드 실패 시 "다시 다운로드" 문구를 사용한다
