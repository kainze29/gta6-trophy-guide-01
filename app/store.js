/* Progress store: earned trophy ids kept in localStorage, with JSON export and import. */
const KEY = 'leonida-platinum-progress-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return new Set();
    return new Set(list.filter(function (n) { return Number.isInteger(n); }));
  } catch (e) {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(earned).sort(function (a, b) { return a - b; })));
  } catch (e) {
    return;
  }
}

export function exportProgress(earned) {
  const payload = {
    app: 'Leonida Platinum',
    game: 'Grand Theft Auto VI',
    exported: new Date().toISOString(),
    earned: Array.from(earned).sort(function (a, b) { return a - b; })
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-platinum-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
}

export async function readImportFile(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(list)) throw new Error('bad file');
  return new Set(list.filter(function (n) { return Number.isInteger(n); }));
}
