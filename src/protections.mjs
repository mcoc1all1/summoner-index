// Scope reviews override legacy labels for the same effect.
const reviewedAvailability=new Set(['always','conditional']);

export function protectionRecords(c) {
 const reviewed=c.protections||[];
 return [
  ...reviewed,
  ...(c.immunityIds||[])
   .filter(id=>!reviewed.some(p=>p.effectId===id))
   .map(effectId=>({
    effectId,
    forms:[],
    availability:'unknown',
    condition:'Activation and debuff/passive scope not yet reviewed.'
   }))
 ];
}

export function protectionFilterActive(f={}) {
 return Boolean(f.immunity||f.form||f.activation&&f.activation!=='always');
}

export function matchingProtections(c,f={}) {
 return protectionRecords(c).filter(p=>{
  const activationMatches=!f.activation||f.activation==='all'||(f.activation==='either'?reviewedAvailability.has(p.availability):p.availability===f.activation);
  return (!f.immunity||p.effectId===f.immunity)&&(!f.form||p.forms.includes(f.form))&&activationMatches;
 });
}

export function protectionLabel(p) {
 const scope=p.forms.length===2?'Debuffs and passives':p.forms[0]==='debuff'?'Debuffs · passive protection unverified':p.forms[0]==='passive'?'Passives · debuff protection unverified':'Form not yet reviewed';
 const activation=p.availability==='always'?'Always active':p.availability==='conditional'?'Conditional':'Activation not yet reviewed';
 return `${scope} · ${activation}`;
}
