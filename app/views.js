/* Views: checklist rows, the detail pane, the roadmap page and the missables page. */
import { applyFilters, gradeLabel, kindLabel, trophyIsSpoiled } from './filters.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function pill(text, cls) {
  return el('span', 'pill' + (cls ? ' ' + cls : ''), text);
}

export function renderProgress(trophies, earned, nodes) {
  const total = trophies.length;
  const done = trophies.filter(function (t) { return earned.has(t.id); }).length;
  const pct = total ? Math.round(done * 100 / total) : 0;
  nodes.text.textContent = done + ' of ' + total + ' earned';
  nodes.fill.style.width = pct + '%';
  const byGrade = {};
  trophies.forEach(function (t) {
    byGrade[t.grade] = byGrade[t.grade] || { got: 0, total: 0 };
    byGrade[t.grade].total += 1;
    if (earned.has(t.id)) byGrade[t.grade].got += 1;
  });
  nodes.gradeText.textContent = 'Platinum ' + byGrade.platinum.got + '/1  Gold ' + byGrade.gold.got + '/2  Silver ' + byGrade.silver.got + '/6  Bronze ' + byGrade.bronze.got + '/46';
  nodes.note.textContent = done === total
    ? 'Platinum earned. Every trophy is ticked.'
    : pct + '% to the platinum. ' + (total - done) + ' trophies left.';
}

export function renderChecklist(trophies, state, nodes, onToggle, onSelect) {
  const list = applyFilters(trophies, state);
  nodes.rows.replaceChildren();
  nodes.empty.hidden = list.length !== 0;
  nodes.head.textContent = 'Showing ' + list.length + ' of ' + trophies.length + ' trophies'
    + (state.earned.size ? '  |  ' + state.earned.size + ' earned' : '');
  list.forEach(function (t) {
    const spoiled = trophyIsSpoiled(t, state.earned, state.spoilers);
    const li = el('li', 'row' + (state.earned.has(t.id) ? ' earned' : '') + (state.selectedId === t.id ? ' selected' : ''));
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(t.id);
    box.setAttribute('aria-label', 'Earned: ' + (spoiled ? 'Hidden trophy' : t.name));
    box.addEventListener('change', function (ev) {
      ev.stopPropagation();
      onToggle(t.id, box.checked);
    });
    li.appendChild(box);
    const mid = el('div');
    mid.appendChild(el('div', 'rowName', spoiled ? 'Hidden trophy' : t.name));
    mid.appendChild(el('div', 'rowDesc', spoiled ? 'A story trophy. Earn it to reveal its name and description.' : t.description));
    const meta = el('div', 'rowMeta');
    meta.appendChild(pill(kindLabel(t.kind)));
    if (t.missable) meta.appendChild(pill('Missable', 'miss'));
    if (t.hidden) meta.appendChild(pill('Hidden', 'hiddenPill'));
    if (t.count) meta.appendChild(pill('Count: ' + t.count));
    mid.appendChild(meta);
    li.appendChild(mid);
    li.appendChild(el('span', 'grade ' + t.grade, gradeLabel(t.grade)));
    li.addEventListener('click', function () { onSelect(t.id); });
    nodes.rows.appendChild(li);
  });
}

export function renderDetail(trophy, earned, spoilers, nodes) {
  nodes.detail.replaceChildren();
  if (!trophy) {
    nodes.detail.appendChild(el('h2', null, 'Pick a trophy'));
    nodes.detail.appendChild(el('p', null, 'Select any trophy in the list to read its official description, its guide and its sources.'));
    return;
  }
  const spoiled = trophyIsSpoiled(trophy, earned, spoilers);
  const earnedNow = earned.has(trophy.id);
  nodes.detail.appendChild(el('h2', null, spoiled ? 'Hidden trophy' : trophy.name));
  const gradeLine = el('p');
  gradeLine.appendChild(el('span', 'grade ' + trophy.grade, gradeLabel(trophy.grade) + ' trophy'));
  gradeLine.appendChild(document.createTextNode('  |  ' + kindLabel(trophy.kind) + (trophy.missable ? '  |  Missable' : '')));
  nodes.detail.appendChild(gradeLine);
  nodes.detail.appendChild(el('p', null, earnedNow ? 'Earned. Ticked off in your checklist.' : 'Not earned yet.'));
  nodes.detail.appendChild(el('h3', null, 'Official description'));
  nodes.detail.appendChild(el('p', 'official', spoiled ? 'Hidden until earned. Turn spoilers off or earn this trophy to read it.' : trophy.description));
  if (trophy.count) {
    nodes.detail.appendChild(el('p', 'countLine', 'PlayStation tracks a count for this one: ' + trophy.count + '.'));
  }
  nodes.detail.appendChild(el('h3', null, 'Guide'));
  nodes.detail.appendChild(el('p', 'guideText', spoiled ? 'Hidden until earned. Earn this trophy to read its guide.' : trophy.guide));
  if (trophy.missable && !spoiled) {
    const box = el('div', 'missBox', 'Missable: this trophy can be missed if you pass the moment it needs. Do it before the final mission, and save before you try it so you can retry.');
    nodes.detail.appendChild(box);
  }
  nodes.detail.appendChild(el('h3', null, 'Sources'));
  const list = el('ul', 'sources');
  trophy.sources.forEach(function (s) {
    list.appendChild(el('li', null, s));
  });
  nodes.detail.appendChild(list);
}

export function renderRoadmap(roadmap, trophies, state, nodes, onSelect) {
  const byId = {};
  trophies.forEach(function (t) { byId[t.id] = t; });
  nodes.page.replaceChildren();
  nodes.page.appendChild(el('h2', null, 'Roadmap to the platinum'));
  nodes.page.appendChild(el('p', 'lead', 'The order that wastes the least replays. Story first, then side strands, then activities, then collectibles and exploration, then money and cleanup. The platinum pops when all 54 other trophies are earned.'));
  roadmap.stages.forEach(function (stage, index) {
    const box = el('section', 'stage');
    const head = el('h3');
    head.appendChild(el('span', 'num', String(index + 1)));
    head.appendChild(document.createTextNode(stage.title + '  (' + stage.trophies.length + ' trophies)'));
    box.appendChild(head);
    box.appendChild(el('p', null, stage.text));
    const list = el('ul');
    stage.trophies.forEach(function (id) {
      const t = byId[id];
      if (!t) return;
      const item = el('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = (trophyIsSpoiled(t, state.earned, state.spoilers) ? 'Hidden trophy' : t.name) + '  (' + gradeLabel(t.grade) + ')';
      btn.addEventListener('click', function () { onSelect(t.id); });
      item.appendChild(btn);
      list.appendChild(item);
    });
    box.appendChild(list);
    nodes.page.appendChild(box);
  });
}

export function renderMissables(trophies, earned, spoilers, nodes, onSelect) {
  const missed = trophies.filter(function (t) { return t.missable; });
  nodes.page.replaceChildren();
  nodes.page.appendChild(el('h2', null, 'Missable trophies'));
  nodes.page.appendChild(el('p', 'lead', missed.length + ' trophies can be missed if you pass the moment they need. Do them before the final mission, and save before each attempt so a failed try costs nothing. Everything else in the list can be earned in free roam after the story.'));
  missed.forEach(function (t) {
    const spoiled = trophyIsSpoiled(t, earned, spoilers);
    const box = el('section', 'missCard');
    const head = el('h3');
    head.appendChild(document.createTextNode((spoiled ? 'Hidden trophy' : t.name) + '  '));
    head.appendChild(el('span', 'grade ' + t.grade, gradeLabel(t.grade)));
    box.appendChild(head);
    box.appendChild(el('p', null, spoiled ? 'A story trophy. Earn it to reveal its description.' : t.description));
    box.appendChild(el('p', 'why', 'Why it can be missed: ' + missableWhy(t)));
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Read the full guide';
    btn.addEventListener('click', function () { onSelect(t.id); });
    box.appendChild(btn);
    if (earned.has(t.id)) box.appendChild(el('p', null, 'Earned.'));
    nodes.page.appendChild(box);
  });
}

function missableWhy(t) {
  if (t.id === 20) return 'a fishing challenge against Cal that may only be offered in a limited window, so play it when it appears.';
  if (t.id === 29) return 'a unique animal that may only appear once, so a failed hunt can end the chance.';
  if (t.id === 33) return 'it needs your partner beside you during a 4 star escape, which only happens in story stretches where your partner rides along.';
  if (t.id === 34) return 'it needs your partner with you for three shop robberies in a row without losing the wanted level.';
  if (t.id === 37) return 'it reads as a one time airport departure tied to a story beat at VCIA.';
  if (t.id === 39) return 'a silent jewelry robbery can fail the moment you are detected, so a save before you go in is the safety net.';
  if (t.id === 45) return 'smashing out of a vehicle showroom may only be possible during a specific story beat.';
  if (t.id === 48) return 'story choices can only be made while the story is running, so deciding rarely risks running out of chances.';
  return 'it is tied to a moment that may not come back.';
}
