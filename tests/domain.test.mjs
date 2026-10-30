import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {search,getCounters,validate,escapeHtml} from '../src/domain.mjs';
import {counterResults,compareTable} from '../src/components.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
test('catalog references and evidence validate',()=>assert.deepEqual(validate(db),[]));
test('shock immune query excludes resistance',()=>{const found=search(db,'Shock immune champions').champions;for(const id of ['doctor-doom','hulkling','mole-man','shuri'])assert(found.some(c=>c.id===id));assert(found.every(c=>c.immunityIds.includes('shock')));assert(!found.some(c=>['ghost','ultron','emma-frost','onslaught'].includes(c.id)));});
test('cleanse is not indexed as immunity',()=>assert(!search(db,'immune cleanse').champions.some(c=>c.id==='shang-chi')));
test('best skill defenders retrieves profiles without inventing a ranking',()=>assert.deepEqual(search(db,'Best Skill defenders').champions.map(c=>c.id),['bullseye']));
test('Bahamet counters resolves the boss',()=>assert.equal(search(db,'Bahamet counters').bosses[0].id,'bahamet'));
test('class and immunity filters intersect',()=>{const found=search(db,'',{class:'Mystic',immunity:'bleed'}).champions;assert(found.some(c=>c.id==='kushala'));assert(found.every(c=>c.class==='Mystic'&&c.immunityIds.includes('bleed')));});
test('mode filtering does not silently return unrelated counters',()=>{const questing=getCounters(db,'bullseye','questing');assert(questing.some(c=>c.id==='kitty-bullseye'));assert(questing.every(c=>c.defenderId==='bullseye'&&c.modeIds.includes('questing')));assert(!getCounters(db,'bullseye','battlegrounds').some(c=>c.id==='kitty-bullseye'));assert.equal(getCounters(db,'bullseye','alliance-war').length,0);});
test('empty results communicate incomplete coverage',()=>assert.match(counterResults(db,'bullseye','alliance-war'),/does not mean no counter exists/));
test('compare unknown data remains explicitly unreviewed',()=>assert.match(compareTable(db,['kushala','serpent']),/Not reviewed/));
test('invalid foreign keys rejected',()=>{const bad=structuredClone(db);bad.counters[0].attackerId='missing';assert(validate(bad).some(e=>e.includes('unknown champions')));});
test('duplicate records and unsafe source URLs rejected',()=>{const bad=structuredClone(db);bad.champions.push(bad.champions[0]);bad.sources[0].url='javascript:alert(1)';assert(validate(bad).length>=2);});
test('text rendering escapes injected markup',()=>assert.equal(escapeHtml('<img onerror="x">'),'&lt;img onerror=&quot;x&quot;&gt;'));
test('all generated internal links resolve and SEO is present',()=>{
 const root=new URL('../dist/',import.meta.url);
 const files=fs.readdirSync(root,{recursive:true}).filter(f=>f.endsWith('.html'));
 assert(files.length>=30);
 for(const file of files){
  const html=fs.readFileSync(new URL(file.replaceAll('\\','/'),root),'utf8');
  assert.match(html,/<title>.+<\/title>/);assert.match(html,/rel="canonical"/);assert.match(html,/<h1>/);
  for(const [,href] of html.matchAll(/href="(\/[^"#?]*)(?:[^"]*)"/g)){
   const base=new URL('.'+href,root);
   assert(fs.existsSync(base)||fs.existsSync(new URL('.'+href+'/index.html',root)),`${file}: broken ${href}`);
  }
 }
});

test('Shock and Neuroshock immunity searches do not overlap by substring',()=>{
 const shock=search(db,'shock immune').champions;
 const neuroshock=search(db,'neuroshock immune').champions;
 assert(!shock.some(c=>c.id==='the-maker'));
 assert(neuroshock.some(c=>c.id==='the-maker'));
});
