# Codex — GGTO GitHub Pages 개선 PR #1

`Serhankeem/ggto-global-datahub`의 현재 Public 저장소에서 작업해 줘. 기존 `tourismnews`는 읽기 전용 참조이며 수정하지 말 것.

이 저장소는 **GitHub Pages 기반 정적 프로토타입**이다. `index.html`, `config/indicators.json`, `config/sources.json`, `docs/PROJECT_SPEC_KR.md`, `docs/PR_SEQUENCE_KR.md`를 읽고 먼저 현황을 보고해 줘.

## 이번 PR 범위
- 이미 업로드된 정적 사이트를 개선하고 15개 확정 지표를 코드·화면상에서 1:1 확인 가능하도록 해줘.
- 경기 31개 시군 선택, 국적별·연도별 필터, 가상 그래프, 출처·자료 상태 표시를 다듬어줘.
- 모바일/데스크톱 탐색, HTML/JS 오류, 키보드 조작, CSV 파일 내려받기를 테스트해줘.
- 화면에서는 가상 통계와 실제 원문 링크를 확실히 구별해줘.
- 공식 데이터를 임의 추정하거나 숫자를 검증된 값처럼 게시하지 마.

## 제한
- Next.js/Vercel/Supabase 도입 금지 (사용자가 별도 승인하기 전).
- 공식 데이터 자동 다운로드·숨겨진 API·로그인/내부자료 통합 금지.
- 실제 관광통계·기관 업무파일·API 키·개인정보를 Public GitHub에 커밋 금지.
- 작업 브랜치 `feat/pages-prototype-polish-v01`, Draft PR 작성.
- 사용자 승인 없이 main 병합/공식 데이터 게시하지 마. GitHub Pages의 현재 가상 사이트는 그대로 유지.

## 보고
변경파일·테스트 결과·검증된 15개 항목 매핑·시연 화면 경로·잔여 리스크를 PR 설명에 작성해 줘.
