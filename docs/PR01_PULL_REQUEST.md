## 문제와 변경

초기 업로드 파일이 루트에 평탄화되고 HTML에 CSS·JS·JSON 복사본이 중복되어 문서 경로와 검증 도구 기본 경로가 깨져 있었습니다. 정적 GitHub Pages 구조를 유지하면서 assets/data/config/docs/prompts/scripts/tests로 정리하고 확정 15개 지표를 단일 JSON 정의에서 조회하도록 변경했습니다.

흰색·회색·딥블루 기반 8개 업무 화면, 연도·월·국가·31개 시군 필터, 시계열 차트·비교표, 검색, BOM CSV 다운로드, 출처·단위·갱신·연결 상태를 구현했습니다. 필터는 지원하는 자료에만 적용합니다. 예: 일본 선택은 기간 없는 국가별 모의 비중만 바꾸며 전국 월별 방한객 합계는 바꾸지 않습니다. 기존 7개 시군 DEMO 지수 외 24개 시군은 결측입니다. 소비·항공의 출처/기간 없는 하드코딩 숫자는 연결 대기로 대체했습니다.

## 범위와 결정

- 사용자가 실제 연결된 `Serhankeem/GTO_GM_datarepository_MVP`를 PR 대상으로 확인했습니다.
- 확정 15개 지표 정의와 기존 data JSON/CSV는 원문 보존 이동했습니다. 구버전 CSV 사전은 archive에 보존하고 현재 사전은 canonical JSON에서 생성합니다.
- `download`의 ignore 규칙은 `.gitignore`로 복원하고 빈 `download (1)`을 제거했습니다.
- 실제 데이터 수집, 백엔드/인증/DB, main 병합, 운영 배포 설정 변경은 없습니다. `tourismnews`는 수정하지 않았습니다.
- 원본 명세와 차이·해결 방식은 docs/PR01_DIAGNOSIS_KR.md, 다음 공식 통계 연동 권고는 docs/DATA_LINEAGE_KR.md에 기록했습니다.

## 검증

- Node 계산·스키마·CSV 테스트 6개 PASS.
- Python 검증 테스트 2개 PASS; 합성 CSV 33행 PASS.
- 15개 지표·5개 출처 사전 정합성 PASS; 기존 JSON/CSV 원문 및 33행 수치 일치.
- 실제 Chromium smoke PASS: 루트/프로젝트 하위 경로, 8개 메뉴, 15개 지표, 연도·월·국가·31시군, 결측, 검색, CSV 실제 파일, JSON 로딩 오류·재시도, 키보드, 콘솔 오류 없음.
- 1440/768/375px × 8화면 레이아웃 PASS. 스크린샷은 docs/screenshots/에 포함했습니다.
- 실행 명령과 상세 결과: README.md, docs/TEST_REPORT_KR.md.

실제 Pages 배포 및 관리 설정, Safari/Firefox, 실제 모바일·스크린리더 전문 감사, 외부 링크·권리는 미검증입니다. 공식 관측값은 모두 연결·검증·공개 승인 대기입니다. 사용자 승인 전 병합하지 마세요.
