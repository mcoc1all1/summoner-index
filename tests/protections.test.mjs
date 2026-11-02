import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {search,validate} from '../src/domain.mjs';
import {matchingProtections,protectionRecords,protectionLabel} from '../src/protections.mjs';
import {championCard,protectionPanel} from '../src/components.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
const ids=f=>search(db,'',f).champions.map(c=>c.id);

test('conditional immunity filters use reviewed activation and conservative form scope',()=>{
 const debuff=ids({immunity:'shock',form:'debuff',activation:'conditional'});
 for(const id of ['emma-frost','absorbing-man','scorpion'])assert(debuff.includes(id));
 const passive=ids({immunity:'shock',form:'passive',activation:'conditional'});
 assert.deepEqual(passive,['emma-frost']);
 assert(!ids({immunity:'shock',form:'passive',activation:'always'}).includes('emma-frost'));
 assert(ids({immunity:'bleed',form:'passive',activation:'either'}).includes('colossus'));
 assert(ids({immunity:'bleed',form:'passive',activation:'either'}).includes('emma-frost'));
});

test('remaining legacy immunity labels stay unknown until their activation is reviewed',()=>{
 const wiccan=db.champions.find(c=>c.id==='wiccan');
 const reversed=protectionRecords(wiccan).find(p=>p.effectId==='reversed-controls');
 assert.equal(reversed.availability,'unknown');
 assert.match(protectionLabel(reversed),/Activation not yet reviewed/);
 assert(!ids({immunity:'reversed-controls',activation:'always'}).includes('wiccan'));
 assert(!ids({immunity:'reversed-controls',activation:'either'}).includes('wiccan'));
 assert(ids({immunity:'reversed-controls',activation:'unknown'}).includes('wiccan'));
 assert(ids({immunity:'reversed-controls',activation:'all'}).includes('wiccan'));
});

test('reviewed activation does not imply passive protection',()=>{
 assert(ids({immunity:'shock',activation:'always'}).includes('doctor-doom'));
 assert(!ids({immunity:'shock',form:'passive',activation:'always'}).includes('doctor-doom'));
 for(const id of ['ghost','magneto','shang-chi'])assert(!ids({immunity:'bleed',activation:'either'}).includes(id));
 assert(!ids({immunity:'armor-break',form:'passive',activation:'either'}).includes('colossus'));
 assert(ids({immunity:'armor-break',form:'debuff',activation:'conditional'}).includes('colossus'));
});

test('form and activation can filter without choosing an effect',()=>{
 assert(ids({form:'passive',activation:'conditional'}).includes('emma-frost'));
 assert(!ids({activation:'conditional'}).includes('doctor-doom'));
 assert(ids({activation:'unknown'}).includes('wiccan'));
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
 assert.match(protectionPanel(db,c),/Evidence & sources/);
});

test('build ships filter controls and browser dependency',()=>{
 const html=fs.readFileSync(new URL('../dist/champions/index.html',import.meta.url),'utf8');
 for(const id of ['immunity-form','immunity-activation'])assert(html.includes(`id="${id}"`));
 assert(fs.existsSync(new URL('../dist/protections.mjs',import.meta.url)));
});
