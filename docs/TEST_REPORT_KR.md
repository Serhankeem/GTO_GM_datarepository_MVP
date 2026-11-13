# PR #1 검증 결과

검증일: 2026-11-13 (KST). Python 3.12.14 / Node 24.22.1 / Python Playwright 1.62.0 / 시스템 Chromium. 실제 로컬 HTTP 서버와 Chromium을 사용했다. 런타임 외부 라이브러리는 추가하지 않았다.

| 검증 | 결과 |
|---|---|
| `node --test tests/model.test.mjs` | 6개 통과, 실패/스킵 0 |
| `python3 -m unittest discover -s tests -p 'test_*.py' -v` | 2개 통과; 중복·과거월 공백·음수·비DEMO 입력 거부 포함 |
| `python3 scripts/validate_demo.py` | 합성 33행 PASS, errors=[] |
| `python3 scripts/export_metadata.py --check` | 15개 지표·5개 출처 CSV 일치 |
| `python3 tests/browser_smoke.py` | 전체 smoke PASS, 아래 항목 실제 실행 |
| `git diff --check` | 통과 |
| 이동 데이터 무변경 확인 | 기존 HEAD와 demo JSON/CSV 및 indicators/sources JSON 바이트 일치 |
| 합성 JSON / CSV 정합성 | period·inbound 33행 일치 |

브라우저 검사:

- 루트 `/`와 프로젝트 하위 `/GTO_GM_datarepository_MVP/`에서 JS/CSS/JSON 로딩, 메뉴 8개 및 지표 15개.
- 2024/2025/2026 선택 시 차트 12/12/9개 점. 월 선택 1개 점, 2026년 12월은 빈 상태 및 CSV 버튼 비활성화.
- 국가 선택은 모의 비중 표에만 적용되며 전국 시계열 KPI를 변경하지 않음.
- 2024년 1월의 과거 연도 자료 결측을 0%로 표시하지 않음. 순수 계산 테스트에서 0분모·NaN·무한값·이전 월 결측 검증.
- 31개 시군 옵션(전체 포함 32), 연천군 결측, 수원시 기존 모의지수 132, 미지원 기간/국가 비활성화.
- 자원 시군 필터·존재하지 않는 검색·초기화, 자료 안내 유형 검색.
- 관광소비/항공 데이터 연결 대기 및 필터 비활성화.
- 선택 시계열 CSV의 다운로드 이벤트·UTF-8 BOM·기간·행수·DEMO 상태를 실제 파일에서 확인.
- 1440·768·375px × 8개 화면 = 24개 레이아웃 검사. 문서 전체 가로 넘침 없음. 표/차트는 필요 시 내부 스크롤.
- 키보드 검색·Tab 이동, hash 직접 진입, 브라우저 pageerror 및 정상 흐름 리소스 HTTP 오류 0.
- 필수 JSON 404를 주입하면 수치를 숨기고 오류/재시도 표시. 라우트 복원 후 재시도 성공.

스크린샷: [PC](screenshots/overview-1440.png), [태블릿](screenshots/overview-768.png), [모바일](screenshots/overview-375.png). PC와 모바일은 직접 시각 검토하고 모바일 표·차트를 내부 스크롤로 보완했다.

미검증: 실제 GitHub Pages 배포 후 원격 응답, GitHub Pages 관리 설정(API 접근 차단), Safari/Firefox 및 실제 모바일 기기, 스크린리더 전문 감사, 외부 원문 링크 유효성·개별 권리. 이번 PR은 공식 데이터 수집·자동 갱신·운영 배포·접근 통제를 구현하거나 검증하지 않는다.
