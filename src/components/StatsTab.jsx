import React from 'react'
import { GROUPS, STANDALONE_SECTIONS } from '../constants/album.js'
import {
  calculateDuplicates,
  calculateMissing,
  calculateTotalUnits,
  calculateGroupStats,
} from '../utils/statsCalc.js'

export default function StatsTab({ stickers, stats, loading, error }) {
  const duplicates = calculateDuplicates(stickers)
  const missing = calculateMissing(stickers)
  const totalUnits = calculateTotalUnits(stickers)
  const groupStats = calculateGroupStats(stickers, GROUPS, STANDALONE_SECTIONS)

  const foilPct = stats && stats.total_foils > 0
    ? Math.round((stats.owned_foils / stats.total_foils) * 100)
    : null

  return (
    <div className="stats-scroll">

      <div className="stats-hero">
        <div className="stats-hero-label">Progresso Geral</div>
        {loading && <div className="stats-hero-value">—</div>}
        {error && <div className="stats-hero-value" style={{ fontSize: '1.2rem' }}>Erro ao carregar</div>}
        {!loading && !error && stats && (
          <>
            <div className="stats-hero-value">
              {stats.percentage.toLocaleString('pt-BR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}%
            </div>
            <div className="stats-hero-sub">
              {stats.owned_stickers} de {stats.total_stickers} figurinhas
            </div>
            <div className="stats-hero-bar">
              <div className="stats-hero-fill" style={{ width: `${stats.percentage}%` }} />
            </div>
          </>
        )}
      </div>

      <div className="stats-mini-grid">
        <div className="stats-mini-card">
          <div className="stats-mini-label">Foils</div>
          {loading || !stats ? (
            <div className="stats-mini-value" style={{ color: 'var(--gold)' }}>—</div>
          ) : (
            <>
              <div className="stats-mini-value" style={{ color: 'var(--gold)' }}>
                {stats.owned_foils}
                <span className="stats-mini-denom">/{stats.total_foils}</span>
              </div>
              <div className="stats-mini-sub">{foilPct}% das foils</div>
            </>
          )}
        </div>

        <div className="stats-mini-card">
          <div className="stats-mini-label">Repetidas</div>
          <div className="stats-mini-value" style={{ color: 'var(--warning)' }}>{duplicates}</div>
          <div className="stats-mini-sub">para trocar</div>
        </div>

        <div className="stats-mini-card">
          <div className="stats-mini-label">Faltando</div>
          <div className="stats-mini-value" style={{ color: 'var(--danger)' }}>{missing}</div>
          <div className="stats-mini-sub">figurinhas</div>
        </div>

        <div className="stats-mini-card">
          <div className="stats-mini-label">Total coletado</div>
          <div className="stats-mini-value" style={{ color: 'var(--success)' }}>{totalUnits}</div>
          <div className="stats-mini-sub">unidades</div>
        </div>
      </div>

      <div className="stats-group-card">
        <div className="stats-group-header">Por Grupo</div>
        {groupStats.map(({ label, owned, total, pct }) => (
          <div key={label} className="stats-group-row">
            <div className="stats-group-code">{label}</div>
            <div className="stats-group-bar-bg">
              <div className="stats-group-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="stats-group-count">{owned}/{total}</div>
            <div className="stats-group-pct">{pct}%</div>
          </div>
        ))}
      </div>

    </div>
  )
}
