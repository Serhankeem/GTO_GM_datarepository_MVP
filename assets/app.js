import {yoy, monthlyRows, validateData, csv} from './model.mjs';
const $ = s=>document.querySelector(s);
const esc = v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = v=>Number.isFinite(v)?v.toLocaleString('ko-KR',{maximumFractionDigits:1}):'—';
const percent = v=>v===null?'— (전년 비교자료 없음 / 분모 0)':`${v>=0?'+':''}${v.toFixed(1)}%`;
const screens = {
 overview:['종합 대시보드','관광시장 데이터 한눈에 보기','전국 월별 시연 추이와 데이터 연결 상태를 확인합니다.'],
 inbound:['방한관광 통계','방한관광 통계','전국 방한객 추이와 국가별 모의 비중을 구분해 조회합니다.'],
 region:['경기도 방문분석','경기도 외국인 방문분석','이동통신 방문 추정치와 별도의 시군 모의지수 예시입니다.'],
 spending:['외국인 관광소비','외국인 관광소비','신용카드 표본 기반 소비 지표 · 전체 관광소비 총액이 아닙니다.'],
 aviation:['항공 운항 현황','방한 항공 운항 현황','운항편수와 여객 수를 구분하며, 원자료의 단위 확인 후 연결합니다.'],
 assets:['관광지·OTA DB','관광지·OTA 연결 DB','시군별 관광자원 예시 목록 · 실제 예약 및 판매 실적이 아닙니다.'],
 research:['해외시장 리서치','해외시장 리서치','공식 자료 탐색 링크를 제공합니다. 개별 보고서 서지는 검증 대기 중입니다.'],
 governance:['데이터 출처·갱신 관리','데이터 출처·갱신 관리','확정 15개 지표와 5개 원천 그룹의 연결·검증·갱신 상태입니다.']
};
let D, I, S, C, current='overview', downloads=[];
const state = ()=>({year:$('#year').value,month:$('#month').value,country:$('#country').value,city:$('#city').value,q:$('#search').value.trim().toLowerCase()});
const source = id=>S.sources.find(s=>s.id===id);
const link = (url,label)=>url && /^https:\/\//.test(url)?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`:esc(label);
function table(headers,rows){return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${headers.length}" class="empty">선택 조건의 시연 자료 없음 · 공식 데이터 연결 대기</td></tr>`}</tbody></table></div>`;}
const panel = (title,meta,body,action='')=>`<section class="panel"><div class="panel-head"><div><h2>${esc(title)}</h2><div class="meta">${esc(meta)}</div></div>${action}</div>${body}</section>`;
const empty = text=>`<div class="empty">${esc(text)}</div>`;
const metric = (label,value,note)=>`<div class="metric"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></div>`;
function downloadButton(label,headers,rows){const id=downloads.push({headers,rows})-1;return `<button data-download="${id}" ${rows.length?'':'disabled'}>${esc(label)} ↓</button>`;}
function chart(rows){
 if(!rows.length) return empty('선택한 기간의 시연 데이터가 없습니다.');
 const max=Math.max(...rows.map(r=>r.inbound),1)*1.1;
 const x=i=>50+(rows.length===1?310:i*620/(rows.length-1)),y=v=>190-v/max*160;
 const points=rows.map((r,i)=>`${x(i)},${y(r.inbound)}`).join(' ');
 return `<div class="chart-wrap"><svg class="chart" viewBox="0 0 720 230" role="img" aria-label="DEMO 전국 방한객 월별 추이, 단위 명"><line x1="50" y1="190" x2="680" y2="190" stroke="#bbc5d0"/><text x="5" y="30" font-size="11" fill="#626e7c">${fmt(Math.round(max/10000))}만</text><text x="24" y="193" font-size="11">0</text><polyline points="${points}" fill="none" stroke="#234b78" stroke-width="2.5"/>${rows.map((r,i)=>`<circle cx="${x(i)}" cy="${y(r.inbound)}" r="4" fill="#234b78"><title>${r.period}: ${fmt(r.inbound)}명 · DEMO</title></circle><text x="${x(i)}" y="215" text-anchor="middle" font-size="11" fill="#626e7c">${r.month}월</text>`).join('')}</svg></div>`;
}
function metadata(codes){
 const rows=I.indicators.filter(i=>codes.includes(i.code));
 return panel('지표 정의와 연결 상태','기준기간·공표일·최종 검증일은 공식 원자료 연결 후 기록합니다.',table(['지표','단위 / 갱신 주기','출처','기준기간 / 검증 상태'],rows.map(i=>{
  const s=source(i.source_id);return [`${esc(i.code)} · ${esc(i.label_ko)}<small>${esc(i.notes)}</small>`,`${esc(units[i.unit]??i.unit)}<small>${esc(freq[i.frequency])}</small>`,`${link(s.reference_url,s.label)}<small>${esc(s.update_expectation)}</small>`,'데이터 연결 대기<small>기준기간 — · 공표일 — · 검증일 —<br>수집·공개 승인 대기</small>'];
 })));
}
const units={person:'명',percent:'%',estimated_visits:'추정 방문량 (원자료 단위 확인 전)',source_unit_pending:'단위 확인 대기',flights_pending_verification:'운항 단위 확인 대기',link_records:'링크 레코드',reports:'서지 레코드'};
const freq={month:'월',year:'연',snapshot:'스냅샷',date_or_year:'발간일 또는 연도'};
function trend(){
 const s=state(), rows=monthlyRows(D.monthly,s.year,s.month), yearly=monthlyRows(D.monthly,s.year), total=rows.reduce((a,r)=>a+r.inbound,0);
 const annual=yearly.length===12;
 const latest=D.monthly.map(r=>r.period).sort().at(-1)??'—';
 const selected=rows.at(-1);
 const prev=selected?D.monthly.find(r=>r.year===selected.year-1&&r.month===selected.month):null;
 let html=`<div class="metrics">${metric(s.month==='all'?(annual?'연간 합계 · DEMO':'연간 누계 (YTD) · DEMO'):'선택 월 방한객 · DEMO',rows.length?fmt(total)+'명':'—',s.month==='all'?`${s.year}년 ${rows.length}개월 · 전국 합성값`:`${s.year}-${s.month.padStart(2,'0')} · 전국 합성값`)}${metric('선택 최근월 전년 동월비',selected?percent(yoy(selected.inbound,prev?.inbound)):'—','동일 월 합성값으로 산출')}${metric('시연 데이터 최신 기준월',latest,'공식 통계 최신월을 뜻하지 않음')}${metric('공식 데이터 연결','0 / 15','모든 지표 수집·공개 승인 대기')}</div>`;
 const trows=rows.map(r=>{const p=D.monthly.find(t=>t.year===r.year-1&&t.month===r.month);return [r.period,fmt(r.inbound),percent(yoy(r.inbound,p?.inbound)),'DEMO · 합성 데이터'];});
 html+=panel('전국 월별 방한객 추이 · DEMO',`단위 명 · 출처 기존 합성 시연 자료 · 선택 ${s.year}년 / ${s.month==='all'?'전체 월':s.month+'월'}`,chart(rows));
 html+=panel('월별 비교표','국가별 관측값이 없는 전국 합성 시계열입니다.',table(['기준월','방한객 (명)','전년 동월비','검증 상태'],trows),downloadButton('선택 시계열 CSV',['period','inbound_demo_persons','yoy_demo_percent','status'],rows.map(r=>[r.period,r.inbound,yoy(r.inbound,D.monthly.find(t=>t.year===r.year-1&&t.month===r.month)?.inbound),'synthetic_demo_only'])));
 return html;
}
function markets(){
 const s=state(),rows=D.markets.filter(r=>s.country==='all'||r.name===s.country);
 return panel('국가별 수요 모의 비중 · DEMO','기준기간 미지정 스냅샷 · 연도·월 필터 미적용 · 방한객 수/국가별 성장률 관측값 아님',table(['국가','모의 비중 (%)','상태'],rows.map(r=>[esc(r.name),`${fmt(r.value)}<div class="bar"><i style="width:${Math.max(0,Math.min(100,r.value))}%"></i></div>`,'DEMO · 기간 비교 불가'])),downloadButton('국가 모의 비중 CSV',['country_label','demo_share_percent','period','status'],rows.map(r=>[r.name,r.value,'unspecified_snapshot','synthetic_demo_only'])));
}
function regions(){
 const s=state(),cities=C.filter(c=>s.city==='all'||c===s.city);
 const rows=cities.map(c=>{const r=D.regions.find(r=>r.name===c);return [esc(c),r?fmt(r.visitor_index):'—',r?fmt(r.spend_index):'—',r?esc(r.signal):'시연 자료 없음','공식 방문 추정치 연결 대기'];});
 return panel('31개 시군 비교','기간 미지정 모의지수 · 기준 100 · 기존 7개 시군 예시만 제공 · 인원/소비액 아님',table(['시군','방문 모의지수','소비 모의지수','주제 예시','상태'],rows),downloadButton('시군 모의지수 CSV',['municipality','demo_visit_index','demo_spend_index','period','status'],cities.map(c=>{const r=D.regions.find(r=>r.name===c);return [c,r?.visitor_index??null,r?.spend_index??null,'unspecified_snapshot',r?'synthetic_demo_only':'no_demo_data'];})))+`<p class="notice">경기도 전체 방문량은 시군 합계로 만들지 않습니다. 모의지수를 한국관광통계의 방한객 수 또는 이동통신 추정 방문량과 비교·합산하지 않습니다.</p>`;
}
function assets(){
 const s=state(), rows=D.resources.filter(r=>(s.city==='all'||r.region===s.city)&&`${r.name} ${r.region} ${r.kind}`.toLowerCase().includes(s.q));
 return panel('관광자원 예시 목록 · DEMO','현재 스냅샷 · 제공 목록만 표시 · 실제 OTA URL/판매/예약 연결 없음',table(['관광자원','시군','분류','OTA 연결 상태'],rows.map(r=>[esc(r.name),esc(r.region),esc(r.kind),'데이터 연결 대기 · 검증 전'])),downloadButton('관광자원 CSV',['name','municipality','category','ota_status'],rows.map(r=>[r.name,r.region,r.kind,'unconnected_demo_resource'])));
}
function research(){
 const q=state().q;
 const rows=D.reports.filter(r=>`${r.title} ${r.org} ${r.type}`.toLowerCase().includes(q));
 return panel('공식 자료 탐색 링크','기존 시연 링크 보존 · 국가·발간일이 구조화된 보고서 카탈로그는 연결 대기',table(['자료 안내','기관 / 분류','주기 표기','원문 / 확인 상태'],rows.map(r=>[esc(r.title),`${esc(r.org)}<small>${esc(r.type)}</small>`,esc(r.period),`${link(r.link,'기존 안내 링크')}<small>개별 문서·권리·링크 유효성 미검증</small>`])),downloadButton('자료 안내 CSV',['title','publisher','frequency_label','reference_url','status'],rows.map(r=>[r.title,r.org,r.period,r.link,'unverified_reference_only'])));
}
function governance(){
 const q=state().q;
 const selected=I.indicators.filter(i=>`${i.code} ${i.label_ko} ${source(i.source_id).label}`.toLowerCase().includes(q));
 return metadata(selected.map(i=>i.code))+panel('출처 등록부 · 5개 원천 그룹','예상 갱신 시기이며 실제 공표 확인·검증·승인 후 게시합니다.',table(['출처 / 기관','수집 방식','갱신 기준','권리 / 검증 상태'],S.sources.map(s=>[`${link(s.reference_url,s.label)}<small>${esc(s.provider)}</small>`,esc(s.preferred_method),esc(s.update_expectation),`${esc(s.rights_status)}<small>공표일 — · 최종 검증일 — · 공개 승인 대기</small>`])))+panel('공식 데이터 게시 절차','이번 PR에서는 실행하지 않는 후속 운영 흐름','<p>원문 공표 확인 → 이용조건·수집 권한 확인 → 비공개 원본 보관·해시 → 스키마·수치 검증 → 정정 비교 → 담당자 승인 → 게시</p><p>검증 실패·0행·미공표·분모 0·정의 변경은 자동 게시하지 않고 기존 승인 자료를 보존합니다.</p>');
}
function configureFilters(){
 const allowed={overview:['year','month','country'],inbound:['year','month','country'],region:['city'],spending:[],aviation:[],assets:['city','search'],research:['search'],governance:['search']}[current];
 for(const id of ['year','month','country','city','search']){const el=$('#'+id);el.disabled=!allowed.includes(id);el.title=el.disabled?'이 화면의 시연 데이터에 해당 차원이 없습니다.':'';}
 const notes={overview:'연도·월 → 전국 시계열만 적용 / 국가 → 별도 모의 비중만 적용. 국가별 월별 방한객 관측값은 연결 대기입니다.',inbound:'연도·월 → 전국 시계열 / 국가 → 기간 미지정 모의 비중. 국가 선택으로 전국 합계를 바꾸지 않습니다.',region:'시군 필터 → 기간 미지정 모의지수. 국가·기간별 지역 관측값이 없어 해당 필터는 비활성화됩니다.',spending:'기간·국적·업종별 소비 관측값과 단위가 미확보되어 필터를 비활성화했습니다.',aviation:'기간·출발국별 운항 관측값과 단위가 미확보되어 필터를 비활성화했습니다.',assets:'시군·검색 → 관광자원 예시 목록. 시점·국가 정보가 없는 스냅샷입니다.',research:'검색 → 자료 제목·기관·분류. 국가·발간연도 메타데이터 미확보로 기간·국가 필터는 비활성화됩니다.',governance:'검색 → 지표 코드·명칭·출처. 출처·상태 정의에는 국가·기간 필터를 적용하지 않습니다.'};
 $('#filter-note').textContent=notes[current];
}
function render(){
 downloads=[];configureFilters();
 const [label,title,desc]=screens[current];$('#eyebrow').textContent=label;$('#title').textContent=title;$('#description').textContent=desc;
 for(const a of document.querySelectorAll('nav a')){if(a.hash==='#'+current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
 let html='';
 if(current==='overview')html=trend()+markets()+panel('분야별 데이터 탐색','서로 다른 지표의 단위·모집단을 구분합니다.',`<div class="links">${Object.entries(screens).filter(([k])=>k!=='overview').map(([k,v])=>`<a href="#${k}">${v[0]} →</a>`).join('')}</div>`);
 if(current==='inbound')html=trend()+markets()+metadata(['KTO-01','KTO-02','KTO-03','KTO-04','KTO-05']);
 if(current==='region')html=regions()+metadata(['GG-01','GG-02','GG-03','GG-04']);
 if(current==='spending')html=panel('관광소비 시계열 · 국적·업종 비교','단위·표본·업종 정의 확인 대기',empty('데이터 연결 대기 · 기간별 소비 관측값이 없습니다.'))+'<p class="notice">카드 소비는 공급사의 표본·업종 분류에 따른 값이며 전체 외국인 관광소비 총액으로 일반화할 수 없습니다. 기존의 출처·기간 없는 하드코딩 비중은 공식 지표 화면에서 제거했습니다.</p>'+metadata(['SP-01','SP-02','SP-03']);
 if(current==='aviation')html=panel('출발시장별 항공 운항','운항 단위·공항·기간 확인 대기',empty('데이터 연결 대기 · 운항편수와 탑승객 수를 구분합니다.'))+metadata(['AIR-01']);
 if(current==='assets')html=assets()+metadata(['DB-01']);
 if(current==='research')html=research()+metadata(['RES-01']);
 if(current==='governance')html=governance();
 $('#content').innerHTML=html;$('#status').textContent=`${label} · 화면 갱신 완료 · DEMO`;
}
function navigate(){current=Object.hasOwn(screens,location.hash.slice(1))?location.hash.slice(1):'overview';render();}
async function init(){
 try{
 const paths=['data/demo_data.json','config/indicators.json','config/sources.json','config/municipalities.json'];
 [D,I,S,C]=await Promise.all(paths.map(async p=>{const r=await fetch(new URL('../'+p,import.meta.url));if(!r.ok)throw Error(`${p}: HTTP ${r.status}`);return r.json();}));
 validateData(D,I,S,C);
 $('#navigation').innerHTML=Object.entries(screens).map(([k,v],i)=>`<a href="#${k}"><span aria-hidden="true">${String(i+1).padStart(2,'0')}　</span>${v[0]}</a>`).join('');
 $('#month').innerHTML+=Array.from({length:12},(_,i)=>`<option value="${i+1}">${i+1}월</option>`).join('');
 $('#country').innerHTML+=D.markets.map(r=>`<option>${esc(r.name)}</option>`).join('');
 $('#city').innerHTML+=C.map(c=>`<option>${esc(c)}</option>`).join('');
 for(const id of ['year','month','country','city'])$('#'+id).addEventListener('change',render);
 $('#search').addEventListener('input',render);
 $('#reset').addEventListener('click',()=>{$('#year').value='2026';for(const id of ['month','country','city'])$('#'+id).value='all';$('#search').value='';render();});
 $('#content').addEventListener('click',e=>{const b=e.target.closest('[data-download]');if(!b)return;const d=downloads[Number(b.dataset.download)];if(!d?.rows.length)return;const url=URL.createObjectURL(new Blob([csv(d.headers,d.rows)],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`DEMO_${current}_${state().year}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 window.addEventListener('hashchange',navigate);navigate();
 }catch(e){$('#title').textContent='데이터 로딩 실패';$('#description').textContent='파일 경로와 JSON 형식을 확인한 뒤 다시 시도하세요.';$('#status').textContent='로딩 오류';$('#content').innerHTML=`<div class="error" role="alert">${esc(e.message)}<p>기존 데이터가 정상 로딩되지 않아 수치를 표시하지 않습니다.</p><button id="retry">다시 시도</button></div>`;$('#retry').addEventListener('click',()=>location.reload());}
}
init();
