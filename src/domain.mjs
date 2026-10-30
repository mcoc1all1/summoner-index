import {validDate} from './review.mjs';
export const escapeHtml = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const names = (db, type, ids=[]) => ids.map(id=>db[type].find(x=>x.id===id)?.name || id);
export function search(db, query='', filters={}) {
  const text=query.toLowerCase().replace(/[^\w\s-]/g,' ').trim();
  const tokens=text.split(/\s+/).filter(t=>!['best','champion','champions','counter','counters','immune','immunity','defenders','defender','the','for'].includes(t));
  const immune=/\b(immune|immunity)\b/.test(text);
  const defense=/\bdefenders?\b/.test(text);
  const matches=db.champions.filter(c=>{
    if(filters.coverage && c.coverage!==filters.coverage) return false;
    if(filters.class && c.class!==filters.class) return false;
    if(filters.immunity && !c.immunityIds.includes(filters.immunity)) return false;
    if(filters.saved && !filters.saved.includes(c.id)) return false;
    if(defense && !c.tagIds.includes('defender')) return false;
    const hay=[c.name,c.class,...(c.referenceFacts?.abilities||[]),...names(db,'abilities',c.abilityIds),...names(db,'immunities',c.immunityIds),...names(db,'tags',c.tagIds)].join(' ').toLowerCase();
    const immunityWords=names(db,'immunities',c.immunityIds).join(' ').toLowerCase().split(/[^\w-]+/);
    return tokens.every(t=>immune ? immunityWords.includes(t) : hay.includes(t));
  });
  const bosses=immune||defense?[]:db.bosses.filter(b=>tokens.every(t=>`${b.name} ${b.chapter} ${b.summary}`.toLowerCase().includes(t)));
  return {champions:matches,bosses};
}
export function getCounters(db,defenderId,mode='') {
  return db.counters.filter(c=>c.defenderId===defenderId && (!mode||c.modeIds.includes(mode))).sort((a,b)=>b.score-a.score);
}
export function validate(db) {
  const errors=[];
  if(!db||typeof db!=='object'||Array.isArray(db))return ['Content must be an object.'];
  const required=['sources','abilities','immunities','tags','gameModes','champions','counters','nodes','quests','bosses','videos','relics','synergies','ratings'];
  for(const table of required) {
    if(!Array.isArray(db[table])) {errors.push(`Missing array: ${table}`);continue;}
    const seen=new Set();
    for(const item of db[table]){
      if(!item||typeof item!=='object'||Array.isArray(item)){errors.push(`Invalid record in ${table}`);continue;}
      if(!item.id || !/^[a-z0-9-]+$/.test(item.id)) errors.push(`Invalid ID in ${table}`);
      if(seen.has(item.id)) errors.push(`Duplicate ID: ${item.id}`);
      seen.add(item.id);
    }
  }
  if(required.some(table=>!Array.isArray(db[table]))) return errors;
  if(required.some(table=>db[table].some(item=>!item||typeof item!=='object'||Array.isArray(item))))return errors;
  const ref=(table,id,label)=>{if(!db[table].some(x=>x.id===id))errors.push(`${label}: unknown ${table} ID ${id}`);};
  for(const s of db.sources) {try{const url=new URL(s.url);if(url.protocol!=='https:'||url.username||url.password)throw Error();}catch{errors.push(`Source ${s.id} must use a valid HTTPS URL without credentials`);}if(!s.title)errors.push(`Source ${s.id} needs a title`);}
  for(const c of db.champions) {
    if(c.researchReview!=null){
      const r=c.researchReview;
      if(!r||typeof r!=='object'||Array.isArray(r)||!['guide-added','source-gap'].includes(r.status)||!validDate(r.checkedAt)||typeof r.note!=='string'||!r.note.trim())errors.push(`${c.id}: invalid research review`);
    }
    if(c.rotation!=null&&(!Array.isArray(c.rotation)||!c.rotation.length||c.rotation.some(s=>typeof s!=='string'||!s.trim())))errors.push(`${c.id}: rotation needs nonempty text steps`);
    if(c.referenceFacts!=null){
      const f=c.referenceFacts;
      if(!f||typeof f!=='object'||Array.isArray(f))errors.push(`${c.id}: invalid source catalogue`);
      else {
        if(f.status!=='source-catalogued'||!validDate(f.checkedAt))errors.push(`${c.id}: source catalogue needs status and date`);
        try{const u=new URL(f.url);if(u.protocol!=='https:'||u.username||u.password)throw Error();}catch{errors.push(`${c.id}: invalid source catalogue URL`);}
        for(const key of ['abilities','protections'])if(!Array.isArray(f[key])||f[key].some(x=>typeof x!=='string'||!x.trim()))errors.push(`${c.id}: invalid source ${key}`);
        for(const key of ['battlecast','statcast'])if(f[key]!=null&&(typeof f[key]!=='string'||!f[key].trim()))errors.push(`${c.id}: invalid source relic`);
      }
    }
    if(c.focusTrial!=null){
      const f=c.focusTrial,options=['Critical Rating','Critical Damage Rating','Special Damage','Armor Penetration','Block Penetration','Adrenaline','Armor Rating','Block Proficiency','Physical Resistance','Energy Resistance'];
      if(typeof f!=='object'||Array.isArray(f))errors.push(`${c.id}: invalid standalone focus trial`);
      else {
        if(!options.includes(f.attackFocus)||!options.includes(f.attackAlternative))errors.push(`${c.id}: invalid standalone focus choices`);
        for(const key of ['attackReason','eligibility'])if(typeof f[key]!=='string'||!f[key].trim())errors.push(`${c.id}: focus trial needs ${key}`);
        if(f.status!=='editorial-trial'||!validDate(f.reviewedAt))errors.push(`${c.id}: focus trial needs status and valid date`);
        if(!Array.isArray(f.sourceIds)||!f.sourceIds.length)errors.push(`${c.id}: focus trial needs sources`);else f.sourceIds.forEach(id=>ref('sources',id,c.id));
      }
    }
    if(c.loadoutException!=null){
      const x=c.loadoutException;
      if(!x||typeof x!=='object'||x.status!=='eligibility-unresolved'||!validDate(x.reviewedAt)||typeof x.reason!=='string'||!x.reason.trim()||typeof x.nextStep!=='string'||!x.nextStep.trim())errors.push(`${c.id}: invalid loadout exception`);
      if(c.loadout||c.focusTrial)errors.push(`${c.id}: unresolved eligibility cannot publish a focus assignment`);
      if(!Array.isArray(x?.sourceIds)||!x.sourceIds.length)errors.push(`${c.id}: loadout exception needs sources`);else x.sourceIds.forEach(id=>ref('sources',id,c.id));
    }
    if(c.loadout!=null){
      const l=c.loadout,focus=['Critical Rating','Critical Damage Rating','Special Damage','Armor Penetration','Block Penetration','Adrenaline','Armor Rating','Block Proficiency','Physical Resistance','Energy Resistance'];
      if(typeof l!=='object'||Array.isArray(l))errors.push(`${c.id}: invalid loadout`);
      else {
        for(const kind of ['battlecast','statcast']){if(l[kind+'Id']===null)continue;const r=db.relics.find(r=>r.id===l[kind+'Id']);if(!r||r.kind!==kind||r.class!==c.class)errors.push(`${c.id}: ${kind} must match relic type and champion class`);}
        for(const f of ['attackFocus','defenseFocus','attackAlternative','defenseAlternative'])if(!focus.includes(l[f]))errors.push(`${c.id}: invalid ${f}`);
        for(const f of ['attackReason','defenseReason','relicNotes','eligibility'])if(typeof l[f]!=='string'||!l[f].trim())errors.push(`${c.id}: loadout needs ${f}`);
        if(l.status!=='editorial-trial'||!validDate(l.reviewedAt))errors.push(`${c.id}: loadout needs editorial-trial status and a valid source-check date`);
        if(!Array.isArray(l.sourceIds)||!l.sourceIds.length)errors.push(`${c.id}: loadout needs sources`);else l.sourceIds.forEach(id=>ref('sources',id,c.id));
      }
    }
    if(c.signatureTarget!=null&&(!Number.isInteger(c.signatureTarget)||c.signatureTarget<0||c.signatureTarget>200))errors.push(`${c.id}: signature target must be 0–200`);
    if(!c.name||!['Mystic','Cosmic','Mutant','Skill','Science','Tech','Universal'].includes(c.class))errors.push(`Invalid champion ${c.id}`);
    for(const [field,table] of [['abilityIds','abilities'],['immunityIds','immunities'],['tagIds','tags'],['sourceIds','sources'],['relicIds','relics']]) {
      if(!Array.isArray(c[field])) errors.push(`${c.id}: missing ${field}`);
      else c[field].forEach(id=>ref(table,id,c.id));
    }
    if(!c.sourceIds?.length)errors.push(`${c.id} needs evidence`);
  }
  const targets=new Set([...db.champions,...db.bosses].map(x=>x.id));
  for(const s of db.synergies){
    ref('champions',s.championId,s.id);
    if(!Array.isArray(s.partnerIds)||!s.partnerIds.length)errors.push(`${s.id}: synergy needs partners`);
    else for(const id of s.partnerIds){ref('champions',id,s.id);if(id===s.championId)errors.push(`${s.id}: synergy cannot partner with itself`);}
    if(!s.summary||!s.conditions)errors.push(`${s.id}: synergy needs effect and conditions`);
    if(!Array.isArray(s.sourceIds)||!s.sourceIds.length)errors.push(`${s.id}: synergy needs sources`);else s.sourceIds.forEach(id=>ref('sources',id,s.id));
    if(s.review?.status!=='community-sourced'||!validDate(s.review?.reviewedAt))errors.push(`${s.id}: synergy needs a dated community review`);
  }
  for(const r of db.relics){
    if(!r.name||!['battlecast','statcast'].includes(r.kind)||!['Mystic','Cosmic','Mutant','Skill','Science','Tech'].includes(r.class))errors.push(`${r.id}: invalid relic name, type or class`);
    if(!Array.isArray(r.sourceIds)||!r.sourceIds.length)errors.push(`${r.id}: relic needs sources`);else r.sourceIds.forEach(id=>ref('sources',id,r.id));
  }
  for(const c of db.counters){
    if(c.conditions!=null&&(!Array.isArray(c.conditions)||!c.conditions.length||c.conditions.some(value=>typeof value!=='string'||!value.trim())))errors.push(`${c.id}: matchup conditions must be nonempty text items`);
    if(c.attackerId===c.defenderId)errors.push(`${c.id}: attacker and defender must differ`);
    if(!c.modeIds?.length)errors.push(`${c.id}: select at least one mode`);
    if(c.score>=4&&(!c.review?.gameVersion||!validDate(c.review?.reviewedAt)||c.review?.status!=='tested'||!Array.isArray(c.sourceIds)||!c.sourceIds.some(id=>db.sources.some(s=>s.id===id&&s.kind==='test'))))errors.push(`${c.id}: scores 4–5 need dated, versioned test evidence`);
    if(c.review?.reviewedAt!=null&&!validDate(c.review.reviewedAt))errors.push(`${c.id}: invalid review date`);
    if(c.review?.status==='tested'&&(!validDate(c.review.reviewedAt)||!c.review.gameVersion||!Array.isArray(c.sourceIds)||!c.sourceIds.some(id=>db.sources.some(s=>s.id===id&&s.kind==='test'))))errors.push(`${c.id}: tested status requires dated, versioned test evidence`);
    if(c.requirements!=null&&(typeof c.requirements!=='object'||Array.isArray(c.requirements)))errors.push(`${c.id}: requirements must be an object`);
    if(c.requirements){const r=c.requirements;if(r.awakened!=null&&typeof r.awakened!=='boolean')errors.push(`${c.id}: awakening requirement must be boolean or null`);if(r.minSignature!=null&&(!Number.isInteger(r.minSignature)||r.minSignature<0||r.minSignature>200))errors.push(`${c.id}: minimum signature must be 0–200`);}
    ref('champions',c.attackerId,c.id);
    if(!targets.has(c.defenderId))errors.push(`${c.id}: unknown defender`);
    for(const [field,table] of [['sourceIds','sources'],['modeIds','gameModes'],['abilityIds','abilities']]) {
      if(!Array.isArray(c[field]))errors.push(`${c.id}: missing ${field}`);
      else c[field].forEach(id=>ref(table,id,c.id));
    }
    if(!c.why||!c.strategy||!c.risks||!c.scoreReason||!c.sourceIds?.length||!Number.isInteger(c.score)||c.score<1||c.score>5)errors.push(`Incomplete counter ${c.id}`);
  }
  for(const b of db.bosses) {
    if(b.reviewedAt!=null&&!validDate(b.reviewedAt))errors.push(`${b.id}: invalid boss review date`);
    if(!b.name||!b.chapter||!b.summary||!b.avoid)errors.push(`Incomplete boss ${b.id}`);
    if(!Array.isArray(b.mistakes)||b.mistakes.some(m=>typeof m!=='string'||!m.trim()))errors.push(`${b.id}: mistakes must be a list of nonempty text`);
    ref('quests',b.questId,b.id);
    for(const [field,table] of [['sourceIds','sources'],['nodeIds','nodes'],['videoIds','videos']]) {if(!Array.isArray(b[field]))errors.push(`${b.id}: missing ${field}`);else b[field].forEach(id=>ref(table,id,b.id));}
    if(!Array.isArray(b.phases)||!b.phases.length||b.phases.some(p=>!p||typeof p.name!=='string'||!p.name.trim()||typeof p.text!=='string'||!p.text.trim()))errors.push(`${b.id} needs named phases with instructions`);
    if(!b.sourceIds?.length)errors.push(`${b.id} needs evidence`);
  }
  for(const q of db.quests){if(!q.name||!q.description)errors.push(`Incomplete quest ${q.id}`);if(!Array.isArray(q.bossIds))errors.push(`${q.id}: missing bossIds`);else {q.bossIds.forEach(id=>{ref('bosses',id,q.id);if(db.bosses.find(b=>b.id===id)?.questId!==q.id)errors.push(`${q.id}: boss ${id} belongs to another quest`);});for(const b of db.bosses.filter(b=>b.questId===q.id))if(!q.bossIds.includes(b.id))errors.push(`${q.id}: missing boss ${b.id}`);}}
  for(const node of db.nodes)if(!node.name||!node.description)errors.push(`Incomplete fight condition ${node.id}`);
  for(const v of db.videos){if(!/^[\w-]{11}$/.test(v.youtubeId))errors.push(`Invalid YouTube ID: ${v.id}`);if(v.start!=null&&(!Number.isInteger(v.start)||v.start<0))errors.push(`${v.id}: video start must be a nonnegative whole number`);}
  return errors;
}
