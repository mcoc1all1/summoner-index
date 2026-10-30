import test from 'node:test';
import assert from 'node:assert/strict';
import {assessPublication,fingerprint,renderPilot} from '../src/publication.mjs';
const boss={id:'example',name:'Example',chapter:'1.1.1',summary:'A test guide',sourceIds:['source'],phases:[{name:'Opening',text:'Fixture'}],mistakes:['Fixture mistake'],avoid:'Fixture advice'};
const db={bosses:[boss,{...boss,id:'held',summary:'NEVER_PUBLISH_THIS'}],sources:[{id:'source',url:'https://example.com',checkedAt:'2026-10-30'}]};
const review=()=>({id:'example',fingerprint:fingerprint(db,boss),reviewer:'Test fixture only',reviewedAt:'2026-10-30',accuracy:{status:'source-checked',evidence:'Fixture'},rights:{status:'reviewed',basis:'independently-authored-facts',evidence:'Fixture'},limitations:'Not gameplay tested',attribution:'Fixture attribution'});
test('publication defaults to hold and does not infer rights from source presence',()=>{const r=assessPublication(db,{selectedBossIds:['example'],reviews:[]});assert.equal(r.eligible.length,0);assert.equal(r.held.length,1);});
test('changing either guide or source invalidates publication review',()=>{for(const mutate of [d=>d.bosses[0].summary='Changed',d=>d.sources[0].checkedAt='2026-10-31']){const copy=structuredClone(db);mutate(copy);assert.equal(assessPublication(copy,{selectedBossIds:['example'],reviews:[review()]}).eligible.length,0);}});
test('public output excludes held catalog records and escapes reviewed text',()=>{const copy=structuredClone(db);copy.bosses[0].summary='<script>bad()</script>';const r=review();r.fingerprint=fingerprint(copy,copy.bosses[0]);const result=assessPublication(copy,{selectedBossIds:['example'],reviews:[r]});const files=renderPilot(result.eligible);const text=Object.values(files).join('');assert(!text.includes('NEVER_PUBLISH_THIS'));assert(!text.includes('<script>'));assert(text.includes('&lt;script&gt;'));assert(!('catalog.json' in files));assert(!('content-workbench/index.html' in files));});
test('rights declarations without evidence and impossible review dates stay held',()=>{const r=review();r.rights.evidence='';r.reviewedAt='2026-02-30';assert.equal(assessPublication(db,{selectedBossIds:['example'],reviews:[r]}).eligible.length,0);});

test('original factual guidance does not require a permission grant or gameplay-test claim',()=>{
 const result=assessPublication(db,{permissionsObtained:false,selectedBossIds:['example'],reviews:[review()]});
 assert.equal(result.eligible.length,1);assert.equal(result.held.length,0);
 const files=renderPilot(result.eligible);
 assert(files['content-policy/index.html'].includes('a citation is not a license'));
 assert(files['privacy/index.html']);
 assert(!Object.values(files).join('').includes('fonts.googleapis.com'));
});
