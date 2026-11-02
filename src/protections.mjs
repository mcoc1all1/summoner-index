// Scope reviews override legacy labels for the same effect.
export function protectionRecords(c) {
 const reviewed=c.protections||[];
 return [...reviewed,...(c.immunityIds||[]).filter(id=>!reviewed.some(p=>p.effectId===id)).map(effectId=>({effectId,forms:[],availability:'always',condition:'Debuff/passive scope not yet reviewed.'}))];
}
export function protectionFilterActive(f={}) {return Boolean(f.immunity||f.form||f.activation&&f.activation!=='always');}
export function matchingProtections(c,f={}) {
 return protectionRecords(c).filter(p=>(!f.immunity||p.effectId===f.immunity)&&(!f.form||p.forms.includes(f.form))&&(!f.activation||f.activation==='either'||p.availability===f.activation));
}
export function protectionLabel(p) {
 const scope=p.forms.length===2?'Debuffs and passives':p.forms[0]==='debuff'?'Debuffs · passive protection unverified':p.forms[0]==='passive'?'Passives · debuff protection unverified':'Form not yet reviewed';
 return `${scope} · ${p.availability==='always'?'Always active':'Conditional'}`;
}
