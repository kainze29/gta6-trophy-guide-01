/* Filters, search and the spoiler rule for the trophy list. */
export function trophyIsHidden(trophy) {
  return trophy.hidden === true;
}

export function trophyIsSpoiled(trophy, earned, spoilersOn) {
  if (!spoilersOn) return false;
  if (earned.has(trophy.id)) return false;
  return trophyIsHidden(trophy);
}

export function applyFilters(trophies, state) {
  const query = state.search.trim().toLowerCase();
  return trophies.filter(function (t) {
    if (state.kind === 'missable') {
      if (!t.missable) return false;
    } else if (state.kind !== 'all' && t.kind !== state.kind) {
      return false;
    }
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.earnedOnly && !state.earned.has(t.id)) return false;
    if (query) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (hay.indexOf(query) === -1) return false;
    }
    return true;
  });
}

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function kindLabel(kind) {
  if (kind === 'story') return 'Story';
  if (kind === 'collectibles') return 'Collectibles';
  if (kind === 'activities') return 'Activities';
  if (kind === 'cleanup') return 'Cleanup';
  return kind;
}
