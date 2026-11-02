import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {search,validate} from '../src/domain.mjs';
import {matchingProtections,protectionRecords,protectionLabel} from '../src/protections.mjs';
import {championCard,protectionPanel} from '../src/components.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
const ids=f=>search(db,'',f).champions.map(c=>c.id);

test('conditional immunity is opt-in and both-form protection matches either form',()=>{
 for(const form of ['debuff','passive']){
  assert.deepEqual(ids({immunity:'shock',form,activation:'conditional'}),['emma-frost']);
  assert(!ids({immunity:'shock',form,activation:'always'}).includes('emma-frost'));
 }
 assert(ids({immunity:'bleed',form:'passive',activation:'either'}).includes('colossus'));
 assert(ids({immunity:'bleed',form:'passive',activation:'either'}).includes('emma-frost'));
});

test('legacy immunity labels are unknown, never silently always-active',()=>{
 const doom=db.champions.find(c=>c.id==='doctor-doom');
 const shock=protectionRecords(doom).find(p=>p.effectId==='shock');
 assert.equal(shock.availability,'unknown');
 assert.match(protectionLabel(shock),/Activation not yet reviewed/);
 assert(!ids({immunity:'shock',activation:'always'}).includes('doctor-doom'));
 assert(!ids({immunity:'shock',activation:'either'}).includes('doctor-doom'));
 assert(ids({immunity:'shock',activation:'unknown'}).includes('doctor-doom'));
 assert(ids({immunity:'shock',activation:'all'}).includes('doctor-doom'));
});

test('unreviewed scope and resistance never imply passive protection',()=>{
 assert(!ids({immunity:'shock'}).includes('doctor-doom'));
 assert(!ids({immunity:'shock',form:'passive',activation:'all'}).includes('doctor-doom'));
 for(const id of ['ghost','magneto','shang-chi'])assert(!ids({immunity:'bleed',activation:'either'}).includes(id));
 assert(!ids({immunity:'armor-break',form:'passive',activation:'either'}).includes('colossus'));
 assert(ids({immunity:'armor-break',form:'debuff',activation:'conditional'}).includes('colossus'));
});

test('form and activation can filter without choosing an effect',()=>{
 assert.deepEqual(ids({form:'passive',activation:'conditional'}),['emma-frost']);
 assert(!ids({activation:'conditional'}).includes('doctor-doom'));
 assert(ids({activation:'unknown'}).includes('doctor-doom'));
});

test('review overrides legacy labels rather than accidentally granting always-on immunity',()=>{
 const c={immunityIds:['bleed'],protections:[{effectId:'bleed',forms:['debuff'],availability:'conditional'}]};
 assert.equal(matchingProtections(c,{activation:'always'}).length,0);
 assert.equal(matchingProtections(c,{activation:'unknown'}).length,0);
});

test('immunity query respects explicitly selected activation',()=>{
 assert(search(db,'shock immune',{activation:'conditional',form:'passive'}).champions.some(c=>c.id==='emma-frost'));
});

test('malformed protection evidence fails validation',()=>{
 const bad=structuredClone(db);bad.champions[0].protections=[{effectId:'missing',forms:['resistance'],availability:'conditional',condition:'',sourceIds:[],checkedAt:'bad'}];
 assert(validate(bad).filter(x=>/protection|unknown immunities/.test(x)).length>=4);
});

test('matching cards expose requirements and profile sources safely',()=>{
 const c=structuredClone(db.champions.find(c=>c.id==='emma-frost'));c.protections[0].condition='<script>bad</script>';
 const html=championCard(db,c,{immunity:'stun',activation:'conditional'});
 assert.match(html,/Conditional/);assert.match(html,/&lt;script&gt;/);assert(!html.includes('<script>'));
 assert.match(protectionPanel(db,c),/Sources & review notes/);
});

test('build ships filter controls and browser dependency',()=>{
 const html=fs.readFileSync(new URL('../dist/champions/index.html',import.meta.url),'utf8');
 for(const id of ['immunity-form','immunity-activation'])assert(html.includes(`id="${id}"`));
 assert(fs.existsSync(new URL('../dist/protections.mjs',import.meta.url)));
});
