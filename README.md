# GGTO Global Marketing Data Hub — GitHub Pages DEMO v0.2

> **PUBLIC DEMO / 가상 데이터 전용**  
> 경기관광공사 글로벌마케팅팀 자료실 구축 검토를 위한 비공식 시연 프로토타입입니다.  
> **실제 한국관광공사 통계, 기관 내부자료, 공식 업무용 시스템이 아닙니다.**

## GitHub Pages에 올리기 (설치/빌드 불필요)

1. GitHub에서 `Serhankeem/ggto-global-datahub` 저장소를 **Public**으로 생성합니다. (이미 있으면 생략)
2. 본 ZIP의 **압축을 해제한 뒤 내용물 전체**를 저장소 루트에 업로드합니다. ZIP 파일 자체만 올리면 웹사이트가 열리지 않습니다.
3. GitHub 저장소 **Settings → Pages → Build and deployment → Source: Deploy from a branch** 선택.
4. **Branch: `main`**, **Folder: `/(root)`** 선택 후 **Save**.
5. 배포가 완료되면 **`https://serhankeem.github.io/ggto-global-datahub/`** 에서 시연 사이트를 확인합니다. (저장소명과 사용자명이 동일할 때의 예정 주소)
6. 설정이 정확한데 열리지 않으면 **Actions**에서 `pages build and deployment` 결과를 확인합니다.

프로토타입 사이트는 `index.html` 한 파일만으로 작동합니다. 외부 npm, DB, 인증키, Python 서버가 필요하지 않습니다.

## 파일 구조

```
index.html                       # GitHub Pages 사이트 진입점
.nojekyll                        # 정적 파일 그대로 게시
config/indicators.json           # 확정된 15개 지표 (실데이터 미연결)
config/sources.json              # 원천 데이터 그룹 5개 및 권리·승인 상태
docs/PROJECT_SPEC_KR.md          # 개발 명세
 docs/PR_SEQUENCE_KR.md         # 다음 개발 순서
 docs/indicator_dictionary.csv   # 지표 설명 초안
 docs/source_registry.csv        # 출처·라이선스 확인 대장
 docs/demo_monthly.csv           # 합성 시연 CSV
prompts/CODEX_PAGES_PR01_PROMPT_KR.md # 추후 Codex 개선 프롬프트
demo_data.json                   # 사이트 내부 수치와 같은 합성 자료
workflow/validate_demo.py       # 로컬 합성 CSV 검증 예제
```

## 시연 기능

- 종합 현황 카드 / 연도 선택 / 월별 방한객 모의 추이·전년비
- 경기도 지역별 비교 모의지수 / 국가별 수요 모의 비중
- **외국인 관광소비**·**항공 운항** 시연 패널 (연결 대기 상태 및 가상 비교)
- 관광자원 검색용 예시 목록 / 시군 필터
- 보고서 공식 원문 링크 / 데이터 검증 과정 설명
- `데이터 관리` 화면에서 확정 15개 지표 전체 확인
- 합성 방한객 CSV 다운로드

> UI에 수치가 있어도 모두 **합성·모의 값**이며 실제 방한관광, 경기도 방문량, 소비액, 항공 실적에 대한 어떠한 주장을 뜻하지 않습니다. `연결 대기`는 오류가 아니라 공식 데이터 수집·연결 전 상태입니다.

## 공개 저장소 보안

Public 저장소와 GitHub Pages는 누구나 열람할 수 있습니다. **공사의 내부 엑셀, 실제 업무자료, API 키, 계정정보, 개인·민감정보, 권리 미확인 원자료**를 올리지 마세요. `.gitignore`는 보조 수단일 뿐 GitHub 웹 업로드를 완전히 차단하지는 않습니다.

공식 통계 연결 및 내부자료 활용 단계부터는 별도 권한·라이선스·기관 보안 검토 후 비공개 데이터 저장소와 접근 통제 가능한 배포 환경으로 전환해야 합니다.

## 참고
- GitHub Pages 공식 설명: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- GitHub Pages 브랜치 배포 설정: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
