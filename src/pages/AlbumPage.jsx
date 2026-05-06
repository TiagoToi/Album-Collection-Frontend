import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getStickers, patchSticker } from '../services/api.js'
import StickerGroup from '../components/StickerGroup.jsx'
import SearchBar from '../components/SearchBar.jsx'

// Groups A–L with their country codes as they appear in the API `code` field.
const GROUPS = [
  { group: 'A', countries: ['MEX', 'RSA', 'KOR', 'CZE'] },
  { group: 'B', countries: ['CAN', 'BIH', 'QAT', 'SUI'] },
  { group: 'C', countries: ['BRA', 'MAR', 'HAI', 'SCO'] },
  { group: 'D', countries: ['USA', 'PAR', 'AUS', 'TUR'] },
  { group: 'E', countries: ['GER', 'CUW', 'CIV', 'ECU'] },
  { group: 'F', countries: ['NED', 'JPN', 'SWE', 'TUN'] },
  { group: 'G', countries: ['BEL', 'EGY', 'IRN', 'NZL'] },
  { group: 'H', countries: ['ESP', 'CPV', 'KSA', 'URU'] },
  { group: 'I', countries: ['FRA', 'SEN', 'IRQ', 'NOR'] },
  { group: 'J', countries: ['ARG', 'ALG', 'AUT', 'JOR'] },
  { group: 'K', countries: ['POR', 'COD', 'UZB', 'COL'] },
  { group: 'L', countries: ['ENG', 'CRO', 'GHA', 'PAN'] },
]

// Standalone sections (not inside a group)
const STANDALONE_SECTIONS = ['FWC', 'CC']
const STANDALONE_LABELS = {
  FWC: 'Fifa World Cup',
  CC: 'Coca-Cola',
}

// Given a code, determine the display name.
// If API provides a `name` field, that is used inside the group.
function codeName(code, stickers) {
  const found = stickers.find((s) => s.code === code)
  return found?.name || code
}

// Build an ordered list of sections for rendering.
// Returns an array of:
//   { type: 'standalone', code, label, stickers }
//   { type: 'group', group, sections: [{ code, label, stickers }] }
function buildSections(stickers) {
  // Group stickers by code
  const byCode = {}
  for (const s of stickers) {
    if (!byCode[s.code]) byCode[s.code] = []
    byCode[s.code].push(s)
  }

  // Sort stickers within each code by number
  for (const code of Object.keys(byCode)) {
    byCode[code].sort((a, b) => {
      const na = Number(a.number)
      const nb = Number(b.number)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      return String(a.number).localeCompare(String(b.number))
    })
  }

  const allCodes = Object.keys(byCode)

  // Determine which codes belong to defined groups/standalones
  const assignedCodes = new Set()

  // FWC first standalone (pre-groups)
  const fwcStickers = byCode['FWC'] || []
  assignedCodes.add('FWC')

  const groupSections = GROUPS.map(({ group, countries }) => {
    const sections = countries
      .filter((c) => byCode[c])
      .map((code) => {
        assignedCodes.add(code)
        // Derive country name from the stickers' name field
        const stickerName = byCode[code]?.[0]?.name || code
        return { code, label: stickerName, stickers: byCode[code] }
      })
    return { type: 'group', group, sections }
  }).filter((g) => g.sections.length > 0)

  // CC standalone (post-groups)
  const ccStickers = byCode['CC'] || []
  assignedCodes.add('CC')

  // Any remaining unassigned codes
  const extraSections = allCodes
    .filter((c) => !assignedCodes.has(c))
    .map((code) => ({
      type: 'standalone',
      code,
      label: byCode[code]?.[0]?.name || code,
      stickers: byCode[code],
    }))

  const result = []

  if (fwcStickers.length > 0) {
    result.push({ type: 'standalone', code: 'FWC', label: 'Fifa World Cup', stickers: fwcStickers })
  }

  result.push(...groupSections)

  if (ccStickers.length > 0) {
    result.push({ type: 'standalone', code: 'CC', label: 'Coca-Cola', stickers: ccStickers })
  }

  result.push(...extraSections)

  return result
}

// Collect all individual country-level sections (with group info) for search
function flattenSections(sections) {
  const flat = []
  for (const sec of sections) {
    if (sec.type === 'standalone') {
      flat.push({ groupId: null, code: sec.code, label: sec.label, stickers: sec.stickers })
    } else {
      for (const cs of sec.sections) {
        flat.push({ groupId: sec.group, code: cs.code, label: cs.label, stickers: cs.stickers })
      }
    }
  }
  return flat
}

// ---------------------------------------------------------------------------
// AlbumPage component
// ---------------------------------------------------------------------------
export default function AlbumPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [stickers, setStickers] = useState([])
  const [collectionName, setCollectionName] = useState('Álbum')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // expandedSections: key = `${groupId || 'standalone'}-${code}`, value = bool
  const [expandedSections, setExpandedSections] = useState({})

  // Search
  const [search, setSearch] = useState('')

  // Modal
  const [modalSticker, setModalSticker] = useState(null)
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getStickers(token, id)
        const list = data.stickers || data || []
        setStickers(list)
        if (data.collection?.name) setCollectionName(data.collection.name)
        else if (data.collectionName) setCollectionName(data.collectionName)
      } catch (err) {
        setError(err.message || 'Erro ao carregar figurinhas')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, token])

  const sections = buildSections(stickers)

  // Total progress
  const totalOwned = stickers.filter((s) => (s.quantity || 0) > 0).length
  const totalCount = 994

  // Section key helper
  function sectionKey(groupId, code) {
    return `${groupId || 'standalone'}-${code}`
  }

  function toggleSection(groupId, code) {
    const key = sectionKey(groupId, code)
    setExpandedSections((prev) => {
      const next = { ...prev }
      // Within a group, collapse siblings
      if (groupId) {
        // Find all sibling codes in this group
        const group = sections.find((s) => s.type === 'group' && s.group === groupId)
        if (group) {
          for (const sibling of group.sections) {
            const sk = sectionKey(groupId, sibling.code)
            if (sk !== key) next[sk] = false
          }
        }
      }
      next[key] = !prev[key]
      return next
    })
  }

  // Search logic
  const lowerSearch = search.toLowerCase().trim()
  const flatSections = flattenSections(sections)
  const filteredFlat = lowerSearch
    ? flatSections.filter((sec) => sec.label.toLowerCase().includes(lowerSearch))
    : null

  // Modal handlers
  function openModal(sticker) {
    setModalSticker({ ...sticker })
    setModalError('')
  }

  function closeModal() {
    setModalSticker(null)
    setModalError('')
  }

  async function handleDelta(delta) {
    if (!modalSticker) return
    const prevQty = modalSticker.quantity || 0
    const newQty = Math.max(0, prevQty + delta)

    // Optimistic update
    setModalSticker((prev) => ({ ...prev, quantity: newQty }))
    setStickers((prev) =>
      prev.map((s) =>
        s.code === modalSticker.code && s.number === modalSticker.number
          ? { ...s, quantity: newQty }
          : s
      )
    )

    try {
      await patchSticker(token, id, modalSticker.code, modalSticker.number, delta)
    } catch (err) {
      // Revert
      setModalSticker((prev) => (prev ? { ...prev, quantity: prevQty } : null))
      setStickers((prev) =>
        prev.map((s) =>
          s.code === modalSticker.code && s.number === modalSticker.number
            ? { ...s, quantity: prevQty }
            : s
        )
      )
      setModalError(err.message || 'Erro ao atualizar')
    }
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  function renderStickerGroup(code, label, groupStickers, groupId) {
    const key = sectionKey(groupId, code)
    const expanded = !!expandedSections[key]
    return (
      <StickerGroup
        key={key}
        name={label}
        stickers={groupStickers}
        expanded={expanded}
        onToggle={() => toggleSection(groupId, code)}
        onCellClick={openModal}
      />
    )
  }

  function renderSearchResults() {
    return (
      <div className="search-results">
        {filteredFlat.length === 0 && (
          <p className="empty-state">Nenhum resultado para "{search}"</p>
        )}
        {filteredFlat.map((sec) =>
          renderStickerGroup(sec.code, sec.label, sec.stickers, sec.groupId)
        )}
      </div>
    )
  }

  function renderFullAlbum() {
    return sections.map((sec) => {
      if (sec.type === 'standalone') {
        return (
          <div key={sec.code} className="album-standalone-section">
            {renderStickerGroup(sec.code, sec.label, sec.stickers, null)}
          </div>
        )
      }
      // Group
      return (
        <div key={sec.group} className="album-group">
          <div className="group-header">Grupo {sec.group}</div>
          {sec.sections.map((cs) =>
            renderStickerGroup(cs.code, cs.label, cs.stickers, sec.group)
          )}
        </div>
      )
    })
  }

  // ---------------------------------------------------------------------------
  return (
    <div className="page-container">
      <div className="phone-header">
        <button className="btn-back" onClick={() => navigate('/collections')} aria-label="Voltar">
          ‹ Voltar
        </button>
        <span className="phone-header-title">{collectionName}</span>
        <span className="header-progress">
          {totalOwned}/{totalCount}
        </span>
      </div>

      <SearchBar value={search} onChange={setSearch} />

      <div className="album-scroll">
        {loading && <p className="loading-text">Carregando figurinhas...</p>}
        {error && <p className="form-error" style={{ margin: '16px' }}>{error}</p>}
        {!loading && !error && (
          lowerSearch ? renderSearchResults() : renderFullAlbum()
        )}
      </div>

      {/* Bottom-sheet modal */}
      {modalSticker && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-sticker-header">
              <span className="modal-sticker-title">
                Figurinha {String(modalSticker.number).padStart(2, '0')}
                {modalSticker.is_foil && <span className="foil-badge"> ⭐</span>}
              </span>
              {modalSticker.label && (
                <p className="modal-sticker-desc">{modalSticker.label}</p>
              )}
              {modalSticker.name && (
                <p className="modal-sticker-country">{modalSticker.name}</p>
              )}
            </div>

            <div className="modal-qty-row">
              <button
                className="btn-qty"
                onClick={() => handleDelta(-1)}
                disabled={(modalSticker.quantity || 0) <= 0}
                aria-label="Diminuir quantidade"
              >
                −
              </button>
              <span className="modal-qty-value">{modalSticker.quantity || 0}</span>
              <button
                className="btn-qty"
                onClick={() => handleDelta(1)}
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            </div>

            {modalError && <p className="form-error modal-error">{modalError}</p>}

            <button className="btn-secondary modal-close-btn" onClick={closeModal}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
