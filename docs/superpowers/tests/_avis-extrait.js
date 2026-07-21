function avisValides(){
  const src = (typeof AVIS !== 'undefined' && Array.isArray(AVIS)) ? AVIS : [];
  return src.filter(a => a
    && Number.isInteger(a.note) && a.note >= 1 && a.note <= 5
    && typeof a.nom === 'string' && a.nom.trim()
    && typeof a.texte === 'string' && a.texte.trim());
}
function moyenneAvis(){
  const v = avisValides();
  if(!v.length) return 0;
  return Math.round((v.reduce((s,a)=>s+a.note,0) / v.length) * 10) / 10;
}
function etoilesHtml(note){
  const n = Math.max(0, Math.min(5, Math.round(note)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}
module.exports = { avisValides, moyenneAvis, etoilesHtml };
