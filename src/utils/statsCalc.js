export function calculateDuplicates(stickers) {
  return stickers.filter(s => (s.quantity || 0) >= 2).length
}

export function calculateMissing(stickers) {
  return stickers.filter(s => (s.quantity || 0) === 0).length
}

export function calculateTotalUnits(stickers) {
  return stickers.reduce((acc, s) => acc + (s.quantity || 0), 0)
}

export function calculateGroupStats(stickers, groups, standalones) {
  const result = []

  const addSection = (label, codes) => {
    const section = stickers.filter(s => codes.includes(s.code))
    if (section.length === 0) return
    const owned = section.filter(s => (s.quantity || 0) > 0).length
    result.push({
      label,
      owned,
      total: section.length,
      pct: Math.round((owned / section.length) * 100),
    })
  }

  addSection(standalones[0], [standalones[0]])
  for (const { group, countries } of groups) {
    addSection(group, countries)
  }
  addSection(standalones[1], [standalones[1]])

  return result
}
