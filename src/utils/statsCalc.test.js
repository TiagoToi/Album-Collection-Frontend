import { describe, it, expect } from 'vitest'
import {
  calculateDuplicates,
  calculateMissing,
  calculateTotalUnits,
  calculateGroupStats,
} from './statsCalc.js'

const s = (code, quantity) => ({ code, quantity })

describe('calculateDuplicates', () => {
  it('conta stickers com quantity >= 2', () => {
    expect(calculateDuplicates([s('A', 0), s('B', 1), s('C', 2), s('D', 3)])).toBe(2)
  })
  it('retorna 0 quando não há repetidas', () => {
    expect(calculateDuplicates([s('A', 1), s('B', 0)])).toBe(0)
  })
})

describe('calculateMissing', () => {
  it('conta stickers com quantity 0', () => {
    expect(calculateMissing([s('A', 0), s('B', 0), s('C', 1)])).toBe(2)
  })
  it('retorna 0 quando todas possuídas', () => {
    expect(calculateMissing([s('A', 1), s('B', 2)])).toBe(0)
  })
})

describe('calculateTotalUnits', () => {
  it('soma todas as quantities', () => {
    expect(calculateTotalUnits([s('A', 2), s('B', 3), s('C', 0)])).toBe(5)
  })
  it('retorna 0 com lista vazia', () => {
    expect(calculateTotalUnits([])).toBe(0)
  })
})

describe('calculateGroupStats', () => {
  const groups = [
    { group: 'A', countries: ['BRA', 'ARG'] },
    { group: 'B', countries: ['FRA', 'ENG'] },
  ]
  const standalones = ['FWC', 'CC']
  const stickers = [
    s('FWC', 1), s('FWC', 0),
    s('BRA', 2), s('ARG', 0),
    s('FRA', 1), s('ENG', 1),
    s('CC', 0),
  ]

  it('retorna seções na ordem: FWC, grupos, CC', () => {
    const result = calculateGroupStats(stickers, groups, standalones)
    expect(result.map(r => r.label)).toEqual(['FWC', 'A', 'B', 'CC'])
  })

  it('calcula owned, total e pct por seção', () => {
    const result = calculateGroupStats(stickers, groups, standalones)
    expect(result[0]).toEqual({ label: 'FWC', owned: 1, total: 2, pct: 50 })
    expect(result[1]).toEqual({ label: 'A',   owned: 1, total: 2, pct: 50 })
    expect(result[2]).toEqual({ label: 'B',   owned: 2, total: 2, pct: 100 })
    expect(result[3]).toEqual({ label: 'CC',  owned: 0, total: 1, pct: 0 })
  })

  it('ignora grupos sem stickers', () => {
    const result = calculateGroupStats(
      [s('BRA', 1)],
      [{ group: 'A', countries: ['BRA'] }, { group: 'Z', countries: ['XXX'] }],
      ['FWC', 'CC']
    )
    expect(result.map(r => r.label)).toEqual(['A'])
  })
})
