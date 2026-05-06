import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getCollections,
  createCollection,
  joinCollection,
} from '../services/api.js'

function ProgressBar({ owned, total }) {
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0
  return (
    <div className="progress-bar-bg">
      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function CollectionsPage() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // New collection modal
  const [showNewModal, setShowNewModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLoading, setNewLoading] = useState(false)
  const [newError, setNewError] = useState('')

  // Join modal
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')

  // Copy feedback
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    fetchCollections()
  }, [])

  async function fetchCollections() {
    setLoading(true)
    setError('')
    try {
      const data = await getCollections(token)
      setCollections(data.collections || data || [])
    } catch (err) {
      setError(err.message || 'Erro ao carregar coleções')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setNewError('')
    setNewLoading(true)
    try {
      const data = await createCollection(token, newName)
      setCollections((prev) => [...prev, data.collection || data])
      setShowNewModal(false)
      setNewName('')
    } catch (err) {
      setNewError(err.message || 'Erro ao criar coleção')
    } finally {
      setNewLoading(false)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    setJoinError('')
    setJoinLoading(true)
    try {
      const data = await joinCollection(token, joinCode)
      setCollections((prev) => [...prev, data.collection || data])
      setShowJoinModal(false)
      setJoinCode('')
    } catch (err) {
      setJoinError(err.message || 'Código inválido ou expirado')
    } finally {
      setJoinLoading(false)
    }
  }

  function copyCode(code, id) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  return (
    <div className="page-container">
      <div className="phone-header">
        <span className="phone-header-title">Minhas Coleções</span>
        <button className="btn-logout" onClick={logout}>
          Fechar sessão
        </button>
      </div>

      <div className="page-content">
        {loading && <p className="loading-text">Carregando...</p>}
        {error && <p className="form-error">{error}</p>}

        {!loading && collections.length === 0 && !error && (
          <div className="empty-state">
            <p>Nenhuma coleção ainda.</p>
            <p>Crie ou entre em uma coleção abaixo.</p>
          </div>
        )}

        <div className="collections-list">
          {collections.map((col) => {
            const owned = col.ownedCount ?? col.owned ?? 0
            const total = col.totalCount ?? col.total ?? 994
            return (
              <div
                key={col._id || col.id}
                className="collection-card"
                onClick={() => navigate(`/album/${col._id || col.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/album/${col._id || col.id}`)}
              >
                <div className="collection-card-header">
                  <h3 className="collection-name">{col.name}</h3>
                  <span className="collection-progress-text">
                    {owned} / {total} figurinhas
                  </span>
                </div>
                <ProgressBar owned={owned} total={total} />
                {col.inviteCode && (
                  <div className="invite-row" onClick={(e) => e.stopPropagation()}>
                    <span className="invite-label">Código:</span>
                    <span className="invite-code">{col.inviteCode}</span>
                    <button
                      className="btn-copy"
                      onClick={() => copyCode(col.inviteCode, col._id || col.id)}
                    >
                      {copiedId === (col._id || col.id) ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer action buttons */}
      <div className="footer-actions">
        <button className="btn-secondary" onClick={() => setShowJoinModal(true)}>
          Entrar por Código
        </button>
        <button className="btn-primary" onClick={() => setShowNewModal(true)}>
          + Nova Coleção
        </button>
      </div>

      {/* New Collection Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Nova Coleção</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="col-name">Nome da coleção</label>
                <input
                  id="col-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Copa da Turma"
                  required
                  autoFocus
                />
              </div>
              {newError && <p className="form-error">{newError}</p>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setShowNewModal(false); setNewName(''); setNewError('') }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={newLoading}>
                  {newLoading ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Collection Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Entrar por Código</h3>
            <form onSubmit={handleJoin}>
              <div className="form-group">
                <label htmlFor="join-code">Código de convite (6 caracteres)</label>
                <input
                  id="join-code"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="EX: AB12CD"
                  maxLength={6}
                  required
                  autoFocus
                  className="input-monospace"
                />
              </div>
              {joinError && <p className="form-error">{joinError}</p>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setShowJoinModal(false); setJoinCode(''); setJoinError('') }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={joinLoading}>
                  {joinLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
