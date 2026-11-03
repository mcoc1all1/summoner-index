import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();

test('Events & News page uses /events and marks only its own main navigation item active',()=>{
 const html=fs.readFileSync(path.join(root,'dist','events','index.html'),'utf8');
 const nav=html.match(/<nav aria-label="Main navigation">([\s\S]*?)<\/nav>/)?.[1]||'';
 assert.match(nav,/Events &amp; News/);
 assert.match(nav,/href="[^\"]*\/events" class="active" aria-current="page"/);
 assert.doesNotMatch(nav,/href="[^\"]*\/" class="active" aria-current="page"/);
 assert.doesNotMatch(nav,/href="[^\"]*\/live"/);
 const activeCount=(nav.match(/aria-current="page"/g)||[]).length;
 assert.equal(activeCount,1);
 assert.match(html,/rel="canonical" href="[^"]*\/events"/);
 assert.match(html,/data-page="\/events"/);
});

test('legacy /live route redirects to canonical Events & News route',()=>{
 const html=fs.readFileSync(path.join(root,'dist','live','index.html'),'utf8');
 assert.match(html,/noindex,follow/);
 assert.match(html,/rel="canonical" href="[^"]*\/events"/);
 assert.match(html,/http-equiv="refresh" content="0; url=[^"]*\/events"/);
});

test('privacy page documents the real saved-champion storage key',()=>{
 const html=fs.readFileSync(path.join(root,'dist','privacy','index.html'),'utf8');
 assert.match(html,/<code>fieldguide:saved<\/code>/);
 assert.doesNotMatch(html,/<code>Summoner Index:saved<\/code>/);
});

test('sitemap lastmod reflects the latest reviewed content date',()=>{
 const xml=fs.readFileSync(path.join(root,'dist','sitemap.xml'),'utf8');
 assert.match(xml,/<lastmod>2026-11-03<\/lastmod>/);
});
