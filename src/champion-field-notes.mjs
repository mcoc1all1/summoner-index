import {escapeHtml as e} from './domain.mjs';
import {sources} from './components.mjs';

// Original decision-focused editorial guidance; names, mechanics and source
// citations are factual references, not a republication of source kit lists.
export function championFieldNotes(db,champion){
 const notes=champion.fieldNotes;
 if(!notes?.decisions?.length)return '';
 const blocks=notes.decisions.map((item,index)=>`<article class="panel"><span class="eyebrow">DECISION ${index+1}</span><h3>${e(item.title)}</h3><p>${e(item.text)}</p></article>`).join('');
 return `<section id="field-notes" class="field-notes"><div class="section-head"><div><span class="eyebrow">INDEPENDENT FIELD NOTES · SOURCE-LINKED</span><h2>What to check in the fight</h2></div></div><p class="muted">Practical decisions based on the linked kit and published mechanics, not an in-game performance test or a guaranteed counter. Checked ${e(notes.checkedAt)}; confirm your current champion version, nodes and matchup.</p><div class="boss-grid">${blocks}</div>${sources(db,notes.sourceIds)}</section>`;
}
