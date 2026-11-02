import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {eventState,isRecentlyEnded,liveSections,validateLiveData} from '../src/live-data.mjs';

const published=JSON.parse(fs.readFileSync(new URL('../content/live.json',import.meta.url),'utf8'));

test('published Live data validates',()=>{
 assert.deepEqual(validateLiveData(published),[]);
});

test('event state moves from upcoming to live to ended by date',()=>{
 const event={start:'2026-11-04',end:'2026-11-09'};
 assert.equal(eventState(event,new Date('2026-11-03T12:00:00Z')),'upcoming');
 assert.equal(eventState(event,new Date('2026-11-04T12:00:00Z')),'live');
 assert.equal(eventState(event,new Date('2026-11-09T12:00:00Z')),'live');
 assert.equal(eventState(event,new Date('2026-11-10T12:00:00Z')),'ended');
});

test('recently ended window is limited to fourteen days',()=>{
 const event={start:'2026-10-01',end:'2026-10-26'};
 assert.equal(isRecentlyEnded(event,new Date('2026-11-02T12:00:00Z')),true);
 assert.equal(isRecentlyEnded(event,new Date('2026-11-11T12:00:00Z')),false);
});

test('live sections sort events and news for the hub',()=>{
 const data={
  events:[
   {id:'up-2',start:'2026-11-20',end:'2026-11-22'},
   {id:'live-2',start:'2026-10-01',end:'2026-12-01'},
   {id:'up-1',start:'2026-11-10',end:'2026-11-12'},
   {id:'live-1',start:'2026-10-01',end:'2026-11-05'},
   {id:'ended',start:'2026-10-01',end:'2026-10-30'}
  ],
  news:[
   {id:'old',publishedAt:'2026-10-01'},
   {id:'new',publishedAt:'2026-11-01'}
  ]
 };
 const sections=liveSections(data,new Date('2026-11-02T12:00:00Z'));
 assert.deepEqual(sections.live.map(x=>x.id),['live-1','live-2']);
 assert.deepEqual(sections.upcoming.map(x=>x.id),['up-1','up-2']);
 assert.deepEqual(sections.ended.map(x=>x.id),['ended']);
 assert.deepEqual(sections.news.map(x=>x.id),['new','old']);
});

test('validation rejects duplicate ids and non-official source hosts',()=>{
 const bad={version:1,events:[{id:'same',title:'A',start:'2026-11-01',end:'2026-11-02',sourceUrl:'https://example.com/a'}],news:[{id:'same',title:'B',publishedAt:'2026-11-01',sourceUrl:'https://example.com/b'}]};
 const errors=validateLiveData(bad).join('\n');
 assert.match(errors,/Duplicate live item id/);
 assert.match(errors,/approved official MCOC URL/);
});
