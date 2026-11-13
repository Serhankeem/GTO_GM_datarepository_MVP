import csv
import importlib.util
import tempfile
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('validator', ROOT/'scripts/validate_demo.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)

class ValidationTests(unittest.TestCase):
    def test_demo_fixture(self):
        rows, errors = validator.validate(ROOT/'data/demo_monthly.csv')
        self.assertEqual(len(rows), 33)
        self.assertEqual(errors, [])

    def test_invalid_fixtures(self):
        with (ROOT/'data/demo_monthly.csv').open(encoding='utf-8-sig') as f:
            records = list(csv.DictReader(f))
        cases = [records+[records[0]], records[1:], [dict(r,inbound='-1') if j==0 else r for j,r in enumerate(records)], [dict(r,status='official') if j==0 else r for j,r in enumerate(records)]]
        for data in cases:
            with self.subTest(data=data[:1]), tempfile.TemporaryDirectory() as tmp:
                path=Path(tmp)/'input.csv'
                with path.open('w',newline='') as f:
                    w=csv.DictWriter(f,fieldnames=records[0].keys()); w.writeheader(); w.writerows(data)
                self.assertTrue(validator.validate(path)[1])

if __name__ == '__main__': unittest.main()
