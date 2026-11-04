import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {inventorySources} from '../scripts/source-rights-inventory.mjs';

test('provenance inventory includes newer patch sources and source URLs',()=>{
 const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
 const inventory=inventorySources();
 assert.equal(inventory.baseSourceDeclarations,db.sources.length);
 assert(inventory.patchFiles>0);
 assert(inventory.patchSourceDeclarations>0);
 assert.equal(inventory.totalSourceDeclarations,inventory.baseSourceDeclarations+inventory.patchSourceDeclarations);
 assert(inventory.distinctSourceURLs>0);
 assert(inventory.sourceHosts>=16);
 assert.equal(inventory.championReferenceBlocks,db.champions.filter(c=>c.referenceFacts).length);
 assert(inventory.hosts['mcocscout.com'].sourceDeclarations>0);
 assert.match(inventory.restrictions,/do not authorize/);
});
