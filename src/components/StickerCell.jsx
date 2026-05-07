import React from 'react'

export default function StickerCell({ sticker, onClick }) {
  const { number, quantity = 0, is_foil = false } = sticker

  let cellClass = 'sticker-cell-compact'
  if (is_foil) cellClass += ' foil'
  cellClass += quantity > 0 ? ' owned' : ' not-owned'

  return (
    <button
      className={cellClass}
      onClick={() => onClick(sticker)}
      aria-label={`Figurinha ${number}${is_foil ? ' especial' : ''}, quantidade: ${quantity}`}
    >
      <span className="cell-number">{String(number).padStart(2, '0')}</span>
      <span className="cell-qty">{quantity > 0 ? quantity : '–'}</span>
    </button>
  )
}
