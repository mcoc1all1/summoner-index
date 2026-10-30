import {rotationPanel} from './guidance.mjs';
import {loadoutPanel} from './loadouts.mjs';
import {escapeHtml as e,names} from './domain.mjs';
import {counterCard,championCard,sources} from './components.mjs';

export function updateRecord(db,table,row){
 const next=structuredClone(db),index=next[table].findIndex(x=>x.id===row.id);
 if(index<0)next[table].push(structuredClone(row));else next[table][index]=structuredClone(row);
 if(table==='bosses'||table==='quests')for(const quest of next.quests)quest.bossIds=next.bosses.filter(b=>b.questId===quest.id).map(b=>b.id);
 return next;
}
export function draftPreview(db,table,row){
 if(table==='counters')return counterCard(db,row);
 if(table==='champions')return championCard(db,row)+rotationPanel(row)+loadoutPanel(db,row);
 if(table==='bosses')return `<article><span class="eyebrow">Boss guide · ${e(row.chapter)}</span><h2>${e(row.name)}</h2><p>${e(row.summary)}</p><div class="chips">${names(db,'nodes',row.nodeIds).map(n=>`<span class="chip">${e(n)}</span>`).join('')}</div>${row.phases.map((p,i)=>`<section><h3>${i+1}. ${e(p.name)}</h3><p>${e(p.text)}</p></section>`).join('')}<h3>Common mistakes</h3><ul>${row.mistakes.map(m=>`<li>${e(m)}</li>`).join('')}</ul><p class="risk">${e(row.avoid)}</p><h3>Videos</h3>${row.videoIds.length?row.videoIds.map(id=>{const v=db.videos.find(v=>v.id===id);return `<p>${e(v.title)} · ${e(v.creator)}</p>`;}).join(''):'<p>No linked videos yet.</p>'}${sources(db,row.sourceIds)}</article>`;
 if(table==='quests')return `<article><h2>${e(row.name)}</h2><p>${e(row.description)}</p><h3>Boss guides</h3>${db.bosses.filter(b=>b.questId===row.id).map(b=>`<p>${e(b.chapter)} · ${e(b.name)}</p>`).join('')||'<p>No bosses assigned. Assign this quest in a boss form.</p>'}</article>`;
 if(table==='nodes')return `<article><h2>${e(row.name)}</h2><p>${e(row.description)}</p><p class="muted">A condition description does not establish which champions counter it.</p></article>`;
 return `<article><h2>${e(row.title||row.name||row.id)}</h2><p>${e(row.creator||row.kind||'')}</p></article>`;
}
