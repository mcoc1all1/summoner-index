import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compareTable} from '../src/components.mjs';
import {applyAccuracyPatches} from '../src/accuracy-patches.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL('../content/'+name,import.meta.url),'utf8'));
const source=read('catalog.json');
const patched=['immunity-roster-audit-patches.json','immunity-verified-20261104b-patches.json','immunity-verified-20261104d-patches.json']
  .reduce((db,name)=>applyAccuracyPatches(db,read(name)),source);

test('comparison differentiates reviewed always-on, conditional and unknown protections',()=>{
 const html=compareTable(patched,['titania','mysterio','black-tarantula']);
 assert.match(html,/Reviewed always-active protections/);
 assert.match(html,/Reviewed conditional protections/);
 assert.match(html,/Source-listed effects · activation unreviewed/);
 assert.match(html,/open a champion page for activation details/i);
 assert.doesNotMatch(html,/Immunities \(curated subset\)/);
 assert.match(html,/TITANIA|Titania/);
 assert.match(html,/Mysterio/);
 assert.match(html,/Black Tarantula/);
});

test('source-only unknown immunity never becomes an always-active claim on compare',()=>{
 const html=compareTable(patched,['black-tarantula']);
 assert.match(html,/Source-listed effects · activation unreviewed/);
 assert.match(html,/Nullify/);
 assert.match(html,/None reviewed/);
});
