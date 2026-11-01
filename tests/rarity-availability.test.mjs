import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));

test('inventory champion ids for rarity review',()=>{
 console.log('RARITY_INVENTORY='+JSON.stringify(db.champions.map(c=>({id:c.id,name:c.name,eligibility:c.statFocusEligibility?.status||null,sourceIds:c.sourceIds||[]}))));
 assert.equal(db.champions.length,334);
});
