import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const app=fs.readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
test('generated history addresses stay inside a GitHub project for filters, compare and search',()=>{
 const expressions=[...app.matchAll(/history\.replaceState\(null,'',(.+?)\);/g)].map(m=>m[1]);
 assert.equal(expressions.length,4);
 for(const base of ['', '/summoner-index']){
  const context={base,p:new URLSearchParams({q:'Doctor Doom'}),ids:['doctor-doom','kushala'],mode:'questing',location:{pathname:base+'/counters/serpent/'},input:{value:'Doom & Fury'},encodeURIComponent};
  for(const expression of expressions){
   const result=vm.runInNewContext(expression,context);
   assert.ok(result.startsWith(base+'/'),`Outside project: ${result}`);
   assert.ok(!result.includes('undefined'));
  }
 }
});
test('every emitted browser-module dependency exists',()=>{
 const root=new URL('../dist/',import.meta.url);
 for(const name of fs.readdirSync(root).filter(x=>x.endsWith('.mjs'))){
  const text=fs.readFileSync(new URL(name,root),'utf8');
  for(const [,dependency] of text.matchAll(/(?:from\s*|import\s*\(\s*)['"](\.\/[^'"]+)['"]/g))assert.ok(fs.existsSync(new URL(dependency,root)),`${name}: missing ${dependency}`);
 }
});
