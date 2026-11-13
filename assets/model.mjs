export function yoy(value, previous) {
  return Number.isFinite(value) && Number.isFinite(previous) && previous > 0 ? (value / previous - 1) * 100 : null;
}
export function monthlyRows(rows, year, month = 'all') {
  return rows.filter(r => r.year === Number(year) && (month === 'all' || r.month === Number(month))).sort((a,b)=>a.month-b.month);
}
export function validateData(data, definitions, registry, cities) {
  const expected = ['KTO-01','KTO-02','KTO-03','KTO-04','KTO-05','GG-01','GG-02','GG-03','GG-04','SP-01','SP-02','SP-03','AIR-01','DB-01','RES-01'];
  if (data.meta?.demo !== true || definitions.indicators?.length !== 15 || new Set(cities).size !== 31 || cities.length !== 31) throw Error('시연 데이터 / 지표 / 시군 정의 오류');
  const sources = new Map(registry.sources.map(s=>[s.id,s]));
  const codes = definitions.indicators.map(i=>i.code);
  if (new Set(codes).size !== 15 || expected.some(c=>!codes.includes(c))) throw Error('15개 지표 코드 불일치');
  for (const i of definitions.indicators) {
    if (!i.label_ko || !i.unit || !i.frequency || !Array.isArray(i.dimensions) || i.connected !== false || i.publication_approved !== false || !sources.get(i.source_id)?.dataset_group.includes(i.code)) throw Error('지표 출처 또는 상태 오류');
  }
  const seen = new Set();
  for (const r of data.monthly) {
    if (!Number.isInteger(r.year) || !Number.isInteger(r.month) || r.month<1 || r.month>12 || r.period !== `${r.year}-${String(r.month).padStart(2,'0')}` || !Number.isFinite(r.inbound) || r.inbound < 0 || r.status !== 'demo' || seen.has(r.period)) throw Error('월별 데이터 형식 오류');
    seen.add(r.period);
  }
  for (const key of ['markets','regions','resources','reports']) if (!Array.isArray(data[key])) throw Error('시연 목록 누락');
  for (const r of data.markets) if (!r.name || !Number.isFinite(r.value) || !Number.isFinite(r.change)) throw Error('국가 식별 또는 수치 오류');
  for (const r of data.regions) if (!cities.includes(r.name) || !Number.isFinite(r.visitor_index) || !Number.isFinite(r.spend_index)) throw Error('지역 식별 또는 수치 오류');
}
export function csv(headers, rows) {
  const cell = v => '"'+String(v ?? '').replaceAll('"','""')+'"';
  return '\uFEFF'+[headers,...rows].map(r=>r.map(cell).join(',')).join('\r\n');
}
