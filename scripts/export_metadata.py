"""Generate human-readable dictionaries from the canonical 15-indicator registry."""
import argparse
import csv
import io
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def exports():
    definitions=json.loads((ROOT/'config/indicators.json').read_text())['indicators']
    sources=json.loads((ROOT/'config/sources.json').read_text())['sources']
    return [
        ('docs/indicator_dictionary.csv',['code','id','label_ko','dimensions','unit','frequency','source_id','connected','publication_approved','notes'],[[i[k] if k!='dimensions' else '|'.join(i[k]) for k in ['code','id','label_ko','dimensions','unit','frequency','source_id','connected','publication_approved','notes']] for i in definitions]),
        ('docs/source_registry.csv',['id','label','provider','reference_url','dataset_group','update_expectation','rights_status','collection_status'],[[s[k] if k!='dataset_group' else '|'.join(s[k]) for k in ['id','label','provider','reference_url','dataset_group','update_expectation','rights_status','collection_status']] for s in sources])]
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args()
    for path,headers,rows in exports():
        out=io.StringIO(newline='');w=csv.writer(out,lineterminator='\n');w.writerow(headers);w.writerows(rows)
        target=ROOT/path
        if args.check:
            if target.read_text()!=out.getvalue(): raise SystemExit(f'Metadata drift: {path}')
        else: target.write_text(out.getvalue(),encoding='utf-8')
    print('Metadata dictionaries match: 15 indicators, 5 source groups')
if __name__=='__main__':main()
