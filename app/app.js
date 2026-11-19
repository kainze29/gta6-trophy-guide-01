/* Leonida Platinum boot: load the trophy data, wire the store, filters and views, route by hash. */
import { loadEarned, saveEarned, exportProgress, readImportFile } from './store.js';
import { renderProgress, renderChecklist, renderDetail, renderRoadmap, renderMissables } from './views.js';

const params = new URLSearchParams(location.search);
const data = await (await fetch('data/trophies.json')).json();
const roadmap = await (await fetch('data/roadmap.json')).json();
const trophies = data.trophies;

const saved = loadEarned();
let earned = saved;
const seed = Number(params.get('seed'));
if (saved.size === 0 && Number.isInteger(seed) && seed > 0) {
  earned = new Set(trophies.slice(0, Math.min(seed, trophies.length)).map(function (t) { return t.id; }));
}

const state = {
  search: '',
  kind: 'all',
  grade: 'all',
  spoilers: params.get('spoilers') === 'on',
  earnedOnly: false,
  earned: earned,
  selectedId: 17
};

const nodes = {
  text: document.getElementById('progressText'),
  gradeText: document.getElementById('gradeText'),
  note: document.getElementById('progressNote'),
  fill: document.getElementById('progressFill'),
  rows: document.getElementById('rows'),
  head: document.getElementById('listHead'),
  empty: document.getElementById('empty'),
  detail: document.getElementById('detail'),
  page: document.getElementById('page')
};
const layout = document.querySelector('.layout');
const hint = document.getElementById('spoilerHint');
const searchInput = document.getElementById('search');
const kindInput = document.getElementById('kind');
const gradeInput = document.getElementById('grade');
const spoilerInput = document.getElementById('spoilers');
const earnedOnlyInput = document.getElementById('earnedOnly');

spoilerInput.checked = state.spoilers;

function selectedTrophy() {
  return trophies.find(function (t) { return t.id === state.selectedId; }) || null;
}

function selectTrophy(id) {
  state.selectedId = id;
  renderAll();
  if (location.hash !== '#/trophy/' + id) history.replaceState(null, '', '#/trophy/' + id);
}

function toggleEarned(id, on) {
  if (on) state.earned.add(id);
  else state.earned.delete(id);
  saveEarned(state.earned);
  renderAll();
}

function renderAll() {
  renderProgress(trophies, state.earned, nodes);
  renderChecklist(trophies, state, nodes, toggleEarned, selectTrophy);
  renderDetail(selectedTrophy(), state.earned, state.spoilers, nodes);
  hint.textContent = state.spoilers
    ? 'Spoilers on: unearned story (hidden) trophies show as Hidden trophy until you earn them.'
    : 'Spoilers off: story trophy names and descriptions are shown. Turn on Hide spoilers to cover unearned story trophies until you earn them.';
  const hash = location.hash || '#/';
  const isRoadmap = hash === '#/roadmap';
  const isMissables = hash === '#/missables';
  document.getElementById('tabChecklist').classList.toggle('active', !isRoadmap && !isMissables);
  document.getElementById('tabRoadmap').classList.toggle('active', isRoadmap);
  document.getElementById('tabMissables').classList.toggle('active', isMissables);
  nodes.page.hidden = !isRoadmap && !isMissables;
  layout.hidden = isRoadmap || isMissables;
  if (isRoadmap) renderRoadmap(roadmap, trophies, state, nodes, selectTrophy);
  if (isMissables) renderMissables(trophies, state.earned, state.spoilers, nodes, selectTrophy);
}

function routeFromHash() {
  const hash = location.hash || '#/';
  if (hash.indexOf('#/trophy/') === 0) {
    const id = Number(hash.slice(9));
    if (Number.isInteger(id) && trophies.some(function (t) { return t.id === id; })) state.selectedId = id;
  }
  renderAll();
}

searchInput.addEventListener('input', function () { state.search = searchInput.value; renderAll(); });
kindInput.addEventListener('change', function () { state.kind = kindInput.value; renderAll(); });
gradeInput.addEventListener('change', function () { state.grade = gradeInput.value; renderAll(); });
spoilerInput.addEventListener('change', function () { state.spoilers = spoilerInput.checked; renderAll(); });
earnedOnlyInput.addEventListener('change', function () { state.earnedOnly = earnedOnlyInput.checked; renderAll(); });
document.getElementById('export').addEventListener('click', function () { exportProgress(state.earned); });
document.getElementById('import').addEventListener('change', async function (ev) {
  const file = ev.target.files[0];
  if (!file) return;
  try {
    state.earned = await readImportFile(file);
    saveEarned(state.earned);
  } catch (e) {
    alert('That file is not a Leonida Platinum progress export.');
  }
  ev.target.value = '';
  renderAll();
});
document.getElementById('reset').addEventListener('click', function () {
  if (confirm('Clear all earned ticks?')) {
    state.earned = new Set();
    saveEarned(state.earned);
    renderAll();
  }
});
window.addEventListener('hashchange', routeFromHash);
routeFromHash();
