import {escapeHtml as e} from './domain.mjs';
const KEY='fieldguide:roster:v1';
export function normalizeRoster(value,db){
 if(!value||value.version!==1||!Array.isArray(value.champions))throw Error('Expected a version 1 roster with a champions list.');
 const seen=new Set();
 const champions=value.champions.map(row=>{
  const champion=row&&db.champions.find(c=>c.id===row.id);
  if(!champion)throw Error('Roster contains an unknown champion. Only the curated collection is supported.');
  if(seen.has(row.id))throw Error('Duplicate champion in roster.');seen.add(row.id);
  if(typeof row.awakened!=='boolean'||!Number.isInteger(row.signature)||row.signature<0||row.signature>200||(!row.awakened&&row.signature!==0))throw Error('Signature must be 0–200, and 0 for an unawakened champion.');
  const extras={};
  for(const [key,min,max] of [['rarity',1,7],['rank',1,10],['ascension',0,10]]){if(row[key]!=null){if(!Number.isInteger(row[key])||row[key]<min||row[key]>max)throw Error('Invalid optional '+key+' value.');extras[key]=row[key];}}
  if(extras.rarity===7&&champion.rarityAvailability?.status==='verified'&&champion.rarityAvailability.sevenStarAvailable===false)throw Error(`${champion.name} is not listed as a 7★ champion in the reviewed availability snapshot.`);
  return {id:row.id,awakened:row.awakened,signature:row.signature,...extras};
 });
 return {version:1,champions};
}
export function readRoster(db){try{return normalizeRoster(JSON.parse(localStorage.getItem(KEY)||'{"version":1,"champions":[]}'),db);}catch{return {version:1,champions:[]};}}
export function requirementCheck(counter,owned){
 if(!owned)return {eligible:false,message:'Not in your roster'};
 const r=counter.requirements||{};
 if(r.awakened===true&&!owned.awakened)return {eligible:false,message:'Requires awakening'};
 if(Number.isInteger(r.minSignature)&&owned.signature<r.minSignature)return {eligible:false,message:`Requires signature ${r.minSignature}+`};
 const known=typeof r.awakened==='boolean'&&Number.isInteger(r.minSignature);
 const partial=typeof r.awakened==='boolean'?(r.awakened?'Awakening requirement met; signature threshold is unreviewed.':'Awakening is not required for the recorded plan; signature threshold is unreviewed.'):'In your roster • awakening/signature requirements are unreviewed.';
 return {eligible:true,message:known?'Recorded awakening and signature requirements met; check nodes and relics.':partial};
}
export function downloadJson(data,name){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function mountRoster(db,notify){
 const host=document.querySelector('#roster-manager');if(!host)return;
 let roster=readRoster(db);
 const save=next=>{try{const checked=normalizeRoster(next,db);localStorage.setItem(KEY,JSON.stringify(checked));roster=checked;return true;}catch(err){notify(err.message);return false;}};
 host.innerHTML=`<div class="notice">Check Owned to save instantly. Build details are optional. Stored on this browser; export a backup before switching devices. Verified 7★ availability is checked when you save a 7★ build.</div><label for="roster-query">Find a champion</label><input id="roster-query" type="search" placeholder="Search your collection…"><p id="roster-count" role="status"></p><label><input type="checkbox" id="owned-only"> Show only my champions</label><div id="roster-list"></div><div class="actions"><button id="roster-export">Export roster backup</button><button id="roster-import-button">Import backup</button><input id="roster-import" type="file" accept="application/json,.json" hidden></div><a class="text-link" href="/counters">Use my roster in the counter finder →</a>`;
 const list=host.querySelector('#roster-list');
 const render=()=>{const q=host.querySelector('#roster-query').value.toLowerCase();host.querySelector('#roster-count').textContent=`${roster.champions.length} champion${roster.champions.length===1?'':'s'} owned`;list.innerHTML=db.champions.filter(c=>c.name.toLowerCase().includes(q)&&(!host.querySelector('#owned-only').checked||roster.champions.some(r=>r.id===c.id))).map(c=>{const row=roster.champions.find(x=>x.id===c.id),availability=c.rarityAvailability;const seven=availability?.status==='verified'?(availability.sevenStarAvailable?'7★ available':'Not listed as 7★'):'7★ availability exception/unreviewed';return `<form class="roster-row" data-id="${c.id}" aria-label="${e(c.name)} roster entry"><div><strong>${e(c.name)}</strong><small>${e(c.class)} · ${e(seven)}</small></div><label><input type="checkbox" name="owned" ${row?'checked':''}> Owned</label><details class="roster-build"><summary>Optional build details</summary><label><input type="checkbox" name="awakened" ${row?.awakened?'checked':''} ${row?'':'disabled'}> Awakened</label><label>Signature <input type="number" name="signature" min="0" max="200" value="${row?.signature||0}" ${row?.awakened?'':'disabled'}></label>${[['rarity','Stars',1,7],['rank','Rank',1,10],['ascension','Ascension level',0,10]].map(([key,label,min,max])=>`<label>${label} <input type="number" name="${key}" min="${min}" max="${max}" value="${row?.[key]??''}" placeholder="Optional" ${row?'':'disabled'}></label>`).join('')}<p class="muted">Build notes are not used to estimate damage. A saved 7★ rarity must match the reviewed availability snapshot.</p><button>Save build</button></details></form>`;}).join('')||'<p>No champions match that search.</p>';};
 host.querySelector('#roster-query').addEventListener('input',render);
 host.querySelector('#owned-only').addEventListener('change',render);
 list.addEventListener('change',event=>{const f=event.target.closest('form');if(!f)return;if(event.target.name==='owned'){const rows=roster.champions.filter(c=>c.id!==f.dataset.id);if(event.target.checked)rows.push({id:f.dataset.id,awakened:false,signature:0});if(save({version:1,champions:rows})){for(const key of ['awakened','rarity','rank','ascension'])f.elements[key].disabled=!event.target.checked;f.elements.awakened.checked=false;f.elements.signature.value=0;host.querySelector('#roster-count').textContent=roster.champions.length+' champion'+(roster.champions.length===1?'':'s')+' owned';notify(event.target.checked?'Added to your roster':'Removed from your roster');if(!event.target.checked&&host.querySelector('#owned-only').checked){render();return;}}else event.target.checked=!event.target.checked;}f.elements.awakened.disabled=!f.elements.owned.checked;f.elements.signature.disabled=!f.elements.owned.checked||!f.elements.awakened.checked;if(f.elements.signature.disabled)f.elements.signature.value=0;});
 list.addEventListener('submit',event=>{event.preventDefault();const f=event.target,rows=roster.champions.filter(c=>c.id!==f.dataset.id);if(f.elements.owned.checked)rows.push({id:f.dataset.id,awakened:f.elements.awakened.checked,signature:f.elements.awakened.checked?Number(f.elements.signature.value):0,...Object.fromEntries(['rarity','rank','ascension'].filter(key=>f.elements[key].value!=='').map(key=>[key,Number(f.elements[key].value)]))});if(save({version:1,champions:rows})){render();notify('Roster saved on this browser');}});
 host.querySelector('#roster-import-button').onclick=()=>host.querySelector('#roster-import').click();
 host.querySelector('#roster-export').onclick=()=>downloadJson(roster,'fieldguide-roster.json');
 host.querySelector('#roster-import').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>100000)throw Error('Roster file is too large.');const candidate=normalizeRoster(JSON.parse(await file.text()),db);const merged=new Map(roster.champions.map(c=>[c.id,c]));candidate.champions.forEach(c=>merged.set(c.id,c));if(save({version:1,champions:[...merged.values()]})){render();notify('Backup merged into your roster');}}catch(err){notify(err.message);}finally{event.target.value='';}};
 render();
}
