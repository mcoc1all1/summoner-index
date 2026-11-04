import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fingerprint} from '../src/rights-assessment.mjs';
import {rightsReviewQueue} from '../scripts/rights-review-queue.mjs';

const source=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const manifest=JSON.parse(fs.readFileSync(new URL('../content/publication-review.json',import.meta.url),'utf8'));

test('every assembled source-boss has a review queue item and pending review is not clearance',()=>{
 const report=rightsReviewQueue(source,manifest);
 assert.equal(report.total,source.bosses.length);
 assert.equal(report.items.length,report.total);
 assert(report.pending>0);
 assert(report.items.find(x=>x.id==='scytalis'));
 assert(report.items.find(x=>x.id==='scytalis').citations.some(s=>s.url.startsWith('https://')));
 assert.equal(report.items.find(x=>x.id==='scytalis').status,'pending');
});

test('rights approval requires an accepted basis and specific supporting evidence',()=>{
 const db={bosses:[{id:'example',name:'Example',chapter:'8.1.6',sourceIds:['x']}],
  sources:[{id:'x',title:'External source',url:'https://example.org/test',kind:'community-reference'}]};
 const manifest={reviews:[{id:'example',reviewedAt:'2026-11-04',
  rights:{status:'reviewed',basis:'unclassified',evidence:'Credit to source'}}]};
 assert.equal(rightsReviewQueue(db,manifest).reviewed,0);
 manifest.reviews[0].rights={status:'reviewed',basis:'independently-authored-facts',evidence:'Record of independent research and passage comparison'};
 assert.equal(rightsReviewQueue(db,manifest).reviewed,0);
 manifest.reviews[0]={...manifest.reviews[0],reviewer:'Test fixture',fingerprint:fingerprint(db,db.bosses[0])};
 Object.assign(manifest.reviews[0].rights,{expression:'Facts described originally',arrangement:'Functional sequence',compilation:'No copied compilation',unresolved:[],sources:[{sourceId:'x',url:'https://example.org/test',access:'compared',comparison:'Manual comparison fixture',licenseStatus:'No license relied on',locator:'Main text',checkedAt:'2026-11-04'}]});
 assert.equal(rightsReviewQueue(db,manifest).reviewed,1);
});
