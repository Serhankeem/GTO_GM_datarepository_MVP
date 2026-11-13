"""Run: python3 tests/browser_smoke.py; no external requests or deployments."""
import csv
import io
import os
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
PREFIX='/GTO_GM_datarepository_MVP/'
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith(PREFIX): self.path='/'+self.path[len(PREFIX):]
        super().do_GET()
    def log_message(self,*args): pass

def run():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}'
    checks=[]
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True)
            page=browser.new_page(accept_downloads=True)
            def nav(key):
                a=page.locator(f'nav a[href="#{key}"]'); a.click()
                expect(a).to_have_attribute('aria-current','page')
            errors=[]; failed=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('response',lambda r:failed.append(r.url) if r.status>=400 else None)
            for path in ['/',PREFIX]:
                page.goto(base+path);page.wait_for_selector('nav a')
                assert page.locator('nav a').count()==8
                for key in ['overview','inbound','region','spending','aviation','assets','research','governance']:
                    nav(key)
                    assert page.locator(f'nav a[href="#{key}"]').get_attribute('aria-current')=='page'
                    assert page.locator('#content h2').count()>0
                assert page.locator('#content table').first.locator('tbody tr').count()==15
                checks.append('8 menus + 15 indicators at '+path)
            nav('inbound')
            for year,n in [('2024',12),('2025',12),('2026',9)]:
                page.select_option('#year',year)
                assert page.locator('svg circle').count()==n
            page.select_option('#month','2')
            assert page.locator('svg circle').count()==1
            original=page.locator('.metric strong').first.inner_text()
            page.select_option('#country','일본')
            assert page.locator('.metric strong').first.inner_text()==original
            market=page.locator('.panel').filter(has=page.get_by_role('heading',name='국가별 수요 모의 비중 · DEMO'))
            assert market.locator('tbody tr').count()==1
            assert market.locator('tbody').inner_text().startswith('일본')
            with page.expect_download() as info:
                page.get_by_role('button',name='선택 시계열 CSV').click()
            raw=Path(info.value.path()).read_bytes();assert raw.startswith(b'\xef\xbb\xbf')
            rows=list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))))
            assert len(rows)==1 and rows[0]['period']=='2026-02' and rows[0]['status']=='synthetic_demo_only'
            page.select_option('#month','12')
            assert page.locator('svg').count()==0
            assert page.get_by_role('button',name='선택 시계열 CSV').is_disabled()
            page.select_option('#year','2024');page.select_option('#month','1')
            assert '전년 비교자료 없음' in page.locator('.metrics').inner_text()
            checks.append('period, unsupported country scope, missing month, CSV BOM/content, missing YoY')
            nav('region')
            assert page.locator('#city option').count()==32
            assert page.locator('#year').is_disabled() and page.locator('#country').is_disabled()
            page.select_option('#city','연천군')
            assert '시연 자료 없음' in page.locator('.panel').first.inner_text()
            page.select_option('#city','수원시')
            assert '132' in page.locator('.panel').first.inner_text()
            nav('assets')
            assert page.locator('.panel').first.locator('tbody tr').count()==1
            page.fill('#search','존재하지않음');assert '시연 자료 없음' in page.locator('.panel').first.inner_text()
            page.get_by_role('button',name='조건 초기화').click()
            assert page.locator('.panel').first.locator('tbody tr').count()==7
            page.fill('#search','수원');assert page.locator('.panel').first.locator('tbody tr').count()==1
            nav('research');page.fill('#search','메타데이터')
            assert page.locator('.panel').first.locator('tbody tr').count()==1
            for key in ['spending','aviation']:
                nav(key)
                assert '데이터 연결 대기' in page.locator('#content').inner_text()
                for name in ['year','month','country','city']:assert page.locator('#'+name).is_disabled()
            checks.append('31 cities, null city, resource/report search, reset, waiting screens')
            page.get_by_role('button',name='조건 초기화').click()
            out=Path('/tmp/ggto-screenshots');out.mkdir(exist_ok=True)
            for width in [1440,768,375]:
                page.set_viewport_size({'width':width,'height':1000})
                for key in ['overview','inbound','region','spending','aviation','assets','research','governance']:
                    nav(key)
                    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),(width,key)
                    assert page.locator('h1').is_visible()
                nav('overview')
                page.screenshot(path=str(out/f'overview-{width}.png'),full_page=True)
            checks.append('24 responsive page checks; screenshots 375/768/1440')
            page.goto(base+PREFIX+'#assets');page.wait_for_selector('nav a')
            page.locator('#search').focus();page.keyboard.type('수원')
            assert page.locator('.panel').first.locator('tbody tr').count()==1
            page.keyboard.press('Tab');assert page.evaluate('document.activeElement.id')=='reset'
            assert errors==[],errors
            assert failed==[],failed
            # Fail closed if required JSON is unavailable, then verify retry UI.
            page.route('**/config/indicators.json',lambda route:route.fulfill(status=404,body='missing'))
            page.reload();page.wait_for_selector('[role="alert"]')
            assert page.get_by_role('button',name='다시 시도').is_visible()
            assert page.locator('.metric').count()==0
            page.unroute('**/config/indicators.json');page.get_by_role('button',name='다시 시도').click();page.wait_for_selector('nav a')
            checks.append('keyboard, deep link, no console/resource errors, JSON failure + recovery')
            browser.close()
        for check in checks:print('PASS',check)
        print('BROWSER SMOKE PASS')
    finally:server.shutdown();server.server_close()
if __name__=='__main__':run()
