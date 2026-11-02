import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();

test('Events & News page marks only its own main navigation item active',()=>{
 const html=fs.readFileSync(path.join(root,'dist','live','index.html'),'utf8');
 const nav=html.match(/<nav aria-label="Main navigation">([\s\S]*?)<\/nav>/)?.[1]||'';
 assert.match(nav,/Events &amp; News/);
 assert.match(nav,/href="[^\"]*\/live" class="active" aria-current="page"/);
 assert.doesNotMatch(nav,/href="[^\"]*\/" class="active" aria-current="page"/);
 const activeCount=(nav.match(/aria-current="page"/g)||[]).length;
 assert.equal(activeCount,1);
});
