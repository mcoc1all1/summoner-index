function upsertById(table, records = []) {
  for (const record of records) {
    const index = table.findIndex(item => item.id === record.id);
    if (index === -1) table.push(structuredClone(record));
    else table[index] = structuredClone(record);
  }
}

export function deriveInitials(name) {
  const match = String(name || '').match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!match) {
    const words = String(name || '').split(/[^A-Za-z0-9]+/).filter(Boolean);
    return words.slice(0, 2).map(word => word[0].toUpperCase()).join('');
  }
  const baseWords = match[1].split(/[^A-Za-z0-9]+/).filter(Boolean);
  const qualifierWords = match[2].split(/[^A-Za-z0-9]+/).filter(Boolean);
  return `${baseWords[0]?.[0] || ''}${qualifierWords[0]?.[0] || ''}`.toUpperCase();
}

export function applyAccuracyPatches(input, patches) {
  const db = structuredClone(input);
  upsertById(db.sources, patches?.sources);
  upsertById(db.champions, patches?.champions);

  for (const patch of patches?.bossPatches || []) {
    const boss = db.bosses.find(item => item.id === patch.id);
    if (!boss) throw new Error(`Accuracy patch references unknown boss: ${patch.id}`);
    if (patch.phaseNames) {
      if (!Array.isArray(patch.phaseNames) || patch.phaseNames.length !== boss.phases.length) {
        throw new Error(`Accuracy patch for ${patch.id} must provide one phase name per existing phase.`);
      }
      boss.phases = boss.phases.map((phase, index) => ({...phase, name: patch.phaseNames[index]}));
    }
  }

  for (const champion of db.champions) {
    if (typeof champion.initials === 'string' && champion.initials.endsWith('(')) {
      champion.initials = deriveInitials(champion.name);
    }
  }

  return db;
}
