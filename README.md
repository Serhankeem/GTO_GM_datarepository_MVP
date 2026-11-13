# GGTO Global Data Hub

경기관광공사 글로벌마케팅팀 구축 검토용 **비공식 공개 DEMO**입니다. 모든 수치는 합성 시연값이며 실제 한국관광공사 통계·기관 업무 시스템이 아닙니다.

## 로컬 실행

Python 3.11 이상으로 저장소 루트에서 실행합니다. 패키지 설치·빌드·DB·API 키가 필요 없습니다.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

브라우저에서 서버의 `index.html`을 확인합니다. JSON을 fetch하므로 HTML을 `file://`로 직접 열지 않습니다.

## 파일 구조

```text
index.html                 GitHub Pages 진입점
.nojekyll                  정적 파일 게시
assets/                    CSS / JS / 순수 계산 모듈
config/                    확정 15개 지표 / 5개 원천 그룹 / 31개 시군
data/                     기존 합성 JSON·CSV (실제 데이터 아님)
docs/                      명세 / 진단 / 데이터 계보 / 테스트 보고
docs/archive/             초기 CSV 초안 보존 (현재 정의로 사용하지 않음)
prompts/                   기존 작업 지시문
scripts/                   합성 CSV 검증 / 메타데이터 사전 생성
tests/                    Node·Python·브라우저 회귀 테스트
```

`config/indicators.json`이 15개 지표의 단일 기준이며 `config/sources.json`이 출처 기준입니다. CSV 사전은 `python3 scripts/export_metadata.py`로 생성합니다.

## 화면과 필터

- 종합 대시보드 / 방한관광 통계: 연도·월은 전국 시계열에, 국가는 별도의 기간 미지정 모의 비중에만 적용합니다. 국가별 인원·성장률은 연결 대기입니다.
- 경기도 방문분석: 31개 시군 필터. 기존 7개 시군의 모의지수만 제공하고 나머지는 결측입니다. 공식 이동통신 추정 방문량은 모두 연결 대기입니다.
- 관광소비 / 항공: 관측값과 단위 미확보로 연결 대기 화면을 제공합니다. 지원하지 않는 필터는 이유와 함께 비활성화합니다.
- 관광지·OTA: 시군·검색으로 기존 7개 자원 목록을 조회합니다. 실제 OTA 링크는 미연결입니다.
- 해외시장 리서치: 기존 자료 안내 링크를 제목·기관·분류로 검색합니다. 국가·발간일이 검증된 보고서 목록은 아직 없습니다.
- 데이터 출처·갱신 관리: 15개 지표의 단위·출처·갱신 주기·기준기간·검증·승인 상태를 조회합니다.

선택 자료 CSV는 UTF-8 BOM, DEMO 상태, 결측 공란을 보존합니다. 연도·국가·시군 차원이 없는 자료를 임의로 연결하거나 합성 확장하지 않습니다. 세부 기준은 [데이터 계보와 해석](docs/DATA_LINEAGE_KR.md)을 참고하세요.

## 테스트

```sh
node --test tests/model.test.mjs
python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 scripts/validate_demo.py
python3 scripts/export_metadata.py --check
python3 tests/browser_smoke.py
```

브라우저 테스트에는 Python Playwright와 Chromium이 필요합니다. 현재 클라우드에는 둘 다 설치되어 있습니다. 새 머신에서는 필요 시 `python3 -m venv .venv`, `.venv/bin/pip install -r requirements-dev.txt`로 설치합니다. Chromium 경로가 다르면 `CHROMIUM_PATH`를 지정합니다. 브라우저 설치는 공식 Playwright 설치 절차를 사용합니다. 브라우저 테스트는 자체 임시 HTTP 서버를 실행하며 루트 및 저장소 하위 경로를 모두 검증합니다. 스크린샷은 `/tmp/ggto-screenshots/`에 생성됩니다.

## 배포 및 공개 범위

기존 GitHub Pages 정적 배포 방식을 유지합니다. 이번 PR은 Pages 설정을 변경하지 않습니다. `.nojekyll`, 상대 리소스 경로, 모듈 기준 JSON 경로로 프로젝트 하위 URL을 지원합니다. 실제 저장소의 Pages 설정과 운영 배포 결과는 별도 확인이 필요합니다.

작업 저장소는 사용자가 확인한 `Serhankeem/GTO_GM_datarepository_MVP`입니다. 최초 명세에 적힌 `ggto-global-datahub`와의 차이는 [PR #1 진단](docs/PR01_DIAGNOSIS_KR.md)에 기록했습니다. 기존 `tourismnews`는 수정하지 않았습니다.

실데이터 수집·인증·DB·자동 갱신·검수 워크플로·배포 자동화는 구현하지 않았습니다. 기관 내부파일·개인정보·키·권리 미확인 원자료를 공개 저장소에 업로드하지 마세요. `.gitignore`는 보조 수단이며 접근 통제를 대체하지 않습니다.
