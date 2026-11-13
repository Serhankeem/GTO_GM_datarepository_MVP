"""GTO Data Hub proof of concept: validate synthetic monthly rows.

SAFETY: No live data acquisition, no access credentials, no publish/deploy action.
This script is intentionally limited to DEMO data. See README.
"""
import argparse, csv, json, sys
from collections import defaultdict
from datetime import date
from pathlib import Path

def validate(csv_path: Path):
    entries=[]; errors=[]; seen=set(); groups=defaultdict(set)
    with csv_path.open('r',encoding='utf-8-sig',newline='') as f:
        reader=csv.DictReader(f)
        if not {'period','year','month','inbound','status'}.issubset(reader.fieldnames or []):
            return [], ['필수 필드 없음: period/year/month/inbound/status']
        for n,r in enumerate(reader,start=2):
            try:
                y=int(r['year']); m=int(r['month']); count=int(r['inbound']); period=r['period']
                if not (2024<=y<=2026 and 1<=m<=12): raise ValueError('year/month 범위')
                if period !=f'{y}-{m:02d}': raise ValueError('기준월 불일치')
                if count<0: raise ValueError('음수 방한객 수')
                if r['status']!='demo': raise ValueError('본 스크립트는 합성 demo 데이터만 허용')
                if period in seen: raise ValueError('중복 기준월')
                seen.add(period);groups[y].add(m)
                entries.append({'period':period,'year':y,'month':m,'inbound':count,'status':'demo'})
            except (ValueError,TypeError,KeyError) as e:
                errors.append(f'행 {n}: {e}')
    for yr, months in groups.items():
        ordered=sorted(months)
        if ordered!=list(range(1,max(ordered)+1)):
            errors.append(f'{yr}년: 1월부터 연속된 자료가 아님')
        if yr in (2024,2025) and len(months)!=12:
            errors.append(f'{yr}년: 연간 자료 12개월 미충족')
        if yr==2026 and max(months,default=0)>9:
            errors.append('2026년 시연자료 범위를 넘어섬 (최대 9월)')
    if set(groups)!={2024,2025,2026}:
        errors.append('시연용 2024~2026 3개년 모두 있어야 함')
    return sorted(entries,key=lambda v:v['period']),errors

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--input',type=Path,default=Path(__file__).resolve().parents[1]/'data/demo_monthly.csv');ap.add_argument('--outdir',type=Path,default=Path('/tmp/ggto-validation'));a=ap.parse_args()
    entries,errors=validate(a.input)
    report={'kind':'synthetic_demo_only','rows':len(entries),'errors':errors,'validation_passed':not errors,'publish_approved':False,'live_data':False,'generated_at':'not_recorded_in_demo'}
    a.outdir.mkdir(parents=True,exist_ok=True)
    (a.outdir/'validation_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    if errors:
        print('VALIDATION FAILED — 승인 데이터 변경 없음')
        for e in errors:print('-',e)
        return 1
    output=a.outdir/'validated_demo.json'
    output.write_text(json.dumps({'demo':True,'monthly':entries},ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'VALIDATION PASS — {len(entries)} synthetic rows; no publication')
    return 0

if __name__=='__main__':sys.exit(main())
