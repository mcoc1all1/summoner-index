import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {championCard} from '../src/components.mjs';
import {catalogViews} from '../src/catalog-views.mjs';

const root=new URL('../dist/',import.meta.url);
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const read=p=>fs.readFileSync(new URL(p,root),'utf8');

test('branded site assets and identity survive the production build',()=>{
 const icon=read('favicon.svg');
 const social=read('og.svg');
 const css=read('ux-cleanup.css');
 const home=read('index.html');
 assert.match(icon,/Summoner Index crest/);
 assert.match(social,/KNOW THE MATCHUP/);
 assert.match(css,/Summoner Index presentation system/);
 assert.match(css,/\.sidebar nav\{position:fixed/);
 assert.match(home,/Know the matchup\. Win the fight\./);
 assert.match(home,/class="home-proof"/);
 assert.match(home,/SUMMONER INDEX/);
 assert(fs.existsSync(new URL('summoner-crest.svg',root)));
});

test('new champion identity cards still expose saving, navigation and class',()=>{
 const c=db.champions.find(x=>x.id==='doctor-doom');
 const view=catalogViews(db)['catalog-champions'];
 const html=championCard(view,view.champions.find(x=>x.id===c.id));
 assert.match(html,/champion-card-identity/);
 assert.match(html,/champion-card--mystic/);
 assert.match(html,/data-save="doctor-doom"/);
 assert.match(html,/href="\/champions\/doctor-doom"/);
 assert.match(html,/Doctor Doom/);
});
