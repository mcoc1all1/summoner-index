import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championCard,protectionPanel} from '../src/components.mjs';
import {validate,filterChampions} from '../src/domain.mjs';
import {matchingProtections,protectionFilterActive} from '../src/protections.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));

test('Magneto resistance is not indexed as Bleed or Shock immunity',()=>{
 const magneto=db.champions.find(c=>c.id==='magneto');
 assert(magneto.resistanceNote);
 assert(!magneto.immunityIds.includes('bleed'));
 assert(!magneto.immunityIds.includes('shock'));
 assert(!filterChampions(db,{immunity:'bleed'}).some(c=>c.id==='magneto'));
 assert(!filterChampions(db,{immunity:'shock'}).some(c=>c.id==='magneto'));
});

test('Cosmic Ghost Rider has reviewed always-active Bleed and Incinerate immunities',()=>{
 const c=db.champions.find(c=>c.id==='cosmic-ghost-rider');
 for(const effect of ['bleed','incinerate']){
  const records=matchingProtections(c,{immunity:effect,activation:'always'});
  assert.equal(records.length,1,effect);
  assert.deepEqual(records[0].forms,['debuff','passive']);
 }
});

test('conditional protection does not silently become an immunity or tested build',()=>{
 const c=db.champions.find(c=>c.id==='emma-frost');
 assert.equal(matchingProtections(c,{immunity:'bleed',activation:'always'}).length,0);
 assert(matchingProtections(c,{immunity:'bleed',activation:'conditional'}).length>0);
 assert(!filterChampions(db,{immunity:'bleed'}).some(x=>x.id===c.id));
 assert(filterChampions(db,{immunity:'bleed',activation:'conditional'}).some(x=>x.id===c.id));
});

test('conditional and adaptive immunities stay out of unconditional filters',()=>{
 for(const [id,effect] of [['emma-frost','poison'],['nimrod','shock'],['sandman','bleed']]){
  assert(!filterChampions(db,{immunity:effect}).some(c=>c.id===id),id);
  assert(filterChampions(db,{immunity:effect,activation:'conditional'}).some(c=>c.id===id),id);
 }
});

test('Hulkling reviewed Poison and Shock do not imply unrelated power immunities',()=>{
 const c=db.champions.find(c=>c.id==='hulkling');
 for(const effect of ['poison','shock'])assert(matchingProtections(c,{immunity:effect,activation:'always'}).length>0);
 for(const effect of ['power-lock','power-drain','power-burn'])assert(!c.immunityIds.includes(effect));
});

test('new profiles and matchup records retain honest review limits',()=>{
 const ids=['cosmic-ghost-rider','emma-frost','nimrod','sandman','hulkling'];
 for(const id of ids){
  const c=db.champions.find(c=>c.id===id);
  assert(c.sourceIds.length);
  for(const p of c.protections)assert(p.sourceIds?.length&&p.checkedAt);
 }
});

test('comparison preserves the conditions behind protection',()=>{
 const c=db.champions.find(c=>c.id==='emma-frost');
 const rows=matchingProtections(c,{immunity:'bleed',activation:'conditional'});
 assert(rows.some(x=>/Diamond Form/.test(x.condition)));
});

test('conditional immunity filters use reviewed activation and conservative form scope',()=>{
 const emma=db.champions.find(c=>c.id==='emma-frost');
 assert(protectionFilterActive({immunity:'bleed',activation:'conditional'}));
 assert(matchingProtections(emma,{immunity:'bleed',form:'debuff',activation:'conditional'}).length>0);
 assert(matchingProtections(emma,{immunity:'bleed',form:'passive',activation:'conditional'}).length>0);
});

test('remaining legacy immunity labels stay unknown until their activation is reviewed',()=>{
 const sample=db.champions.find(c=>c.immunityIds.length&&!c.protections?.length);
 if(!sample)return;
 assert.equal(matchingProtections(sample,{activation:'always'}).length,0);
 assert.equal(matchingProtections(sample,{activation:'conditional'}).length,0);
});

test('reviewed activation does not imply passive protection',()=>{
 const record={effectId:'poison',availability:'always',forms:['debuff'],condition:'Always active'};
 const c={protections:[record],immunityIds:['poison']};
 assert.equal(matchingProtections(c,{immunity:'poison',form:'passive',activation:'always'}).length,0);
});

test('form and activation can filter without choosing an effect',()=>{
 const results=filterChampions(db,{form:'passive',activation:'conditional'});
 assert(results.length>0);
 assert(results.every(c=>matchingProtections(c,{form:'passive',activation:'conditional'}).length));
});

test('review overrides legacy labels rather than accidentally granting always-on immunity',()=>{
 const c={immunityIds:['poison'],protections:[{effectId:'poison',availability:'conditional',forms:['debuff'],condition:'Only sometimes'}]};
 assert.equal(matchingProtections(c,{immunity:'poison',activation:'always'}).length,0);
});

test('immunity query respects explicitly selected activation',()=>{
 const conditional=filterChampions(db,{immunity:'bleed',activation:'conditional'});
 assert(conditional.some(c=>c.id==='emma-frost'));
 assert(!filterChampions(db,{immunity:'bleed',activation:'always'}).some(c=>c.id==='emma-frost'));
});

test('malformed protection evidence fails validation',()=>{
 const bad=structuredClone(db);bad.champions[0].protections=[{effectId:'missing',forms:['resistance'],availability:'conditional',condition:'',sourceIds:[],checkedAt:'bad'}];
 assert(validate(bad).filter(x=>/protection|unknown immunities/.test(x)).length>=4);
});

test('matching cards expose requirements and profile sources safely',()=>{
 const c=structuredClone(db.champions.find(c=>c.id==='emma-frost'));c.protections[0].condition='<script>bad</script>';
 const html=championCard(db,c,{immunity:'stun',activation:'conditional'});
 assert.match(html,/Conditional/);assert.match(html,/&lt;script&gt;/);assert(!html.includes('<script>'));
 assert.match(protectionPanel(db,c),/Evidence & sources/);
});

test('build ships filter controls and browser dependency',()=>{
 const html=fs.readFileSync(new URL('../dist/champions/index.html',import.meta.url),'utf8');
 for(const id of ['immunity-form','immunity-activation'])assert(html.includes(`id="${id}"`));
 assert(fs.existsSync(new URL('../dist/protections.mjs',import.meta.url)));
});
