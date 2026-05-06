import React from 'react'
import StickerCell from './StickerCell.jsx'

export default function StickerGroup({ name, code, stickers, expanded, onToggle, onCellClick, missingCount }) {
  const owned = stickers.filter((s) => (s.quantity || 0) > 0).length
  const total = stickers.length

  return (
    <div className="sticker-group">
      <button
        className="section-header"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="section-arrow">{expanded ? '▼' : '►'}</span>
        {code && <span className="section-badge">{code}</span>}
        <span className="section-name">{name}</span>
        <span className={`section-progress${missingCount !== undefined ? ' missing' : ''}`}>
          {missingCount !== undefined ? `${missingCount} faltando` : `${owned}/${total}`}
        </span>
      </button>

      {expanded && (
        <div className="sticker-grid">
          {stickers.map((sticker) => (
            <StickerCell
              key={`${sticker.code}-${sticker.number}`}
              sticker={sticker}
              onClick={onCellClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
