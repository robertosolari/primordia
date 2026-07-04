// Persistenza minimale su localStorage. Per scelta di design il reload NON
// è un salvataggio completo: si conservano solo i progressi "permanenti"
// (parti evolutive e milestone già annunciate). DNA e taglia ripartono
// da zero a ogni sessione: l'unica scorciatoia contro i predatori è nuotare.
const KEY = 'primordia-save';

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      parts: { flagellum: 0, spike: 0, cilia: 0, ...(data.parts ?? {}) },
      milestones: Array.isArray(data.milestones) ? data.milestones : [],
    };
  } catch {
    return null; // salvataggio corrotto: si riparte puliti
  }
}

export function persist(parts, milestones) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ parts, milestones: [...milestones] }));
  } catch {
    // storage pieno o bloccato: pazienza, il gioco continua senza salvare
  }
}
