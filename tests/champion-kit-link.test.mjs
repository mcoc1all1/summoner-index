import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();

test('curated champion kit snapshot links to the full MCOC Scout kit when available',()=>{
 const html=fs.readFileSync(path.join(root,'dist','champions','doctor-doom','index.html'),'utf8');
 assert.match(html,/class="text-link full-kit-link"/);
 assert.match(html,/View full kit on MCOC Scout/);
 assert.match(html,/target="_blank"/);
});
