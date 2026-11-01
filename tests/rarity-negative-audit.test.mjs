import test from 'node:test';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
const patch=JSON.parse(fs.readFileSync(new URL('../content/rarity-availability-patches.json',import.meta.url)));

test('print champions currently classified as not listed as 7-star',()=>{
  const available=new Set(patch.sevenStarAvailability.availableIds);
  const exceptions=new Set(patch.sevenStarAvailability.exceptionIds||[]);
  const negatives=db.champions.filter(c=>!available.has(c.id)&&!exceptions.has(c.id)).map(c=>({id:c.id,name:c.name,class:c.class}));
  console.log('NEGATIVE_7STAR_AUDIT='+JSON.stringify(negatives));
  assert.equal(negatives.length,67);
});
