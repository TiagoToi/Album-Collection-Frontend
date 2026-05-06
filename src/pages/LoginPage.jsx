import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { login as apiLogin, register as apiRegister } from '../services/api.js'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let data
      if (isRegister) {
        data = await apiRegister(email, password, name)
      } else {
        data = await apiLogin(email, password)
      }
      auth.login(data.token, data.user)
      navigate('/collections')
    } catch (err) {
      setError(err.message || 'Erro ao processar a solicitação')
    } finally {
      setLoading(false)
    }
  }

  function toggle() {
    setIsRegister((v) => !v)
    setError('')
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-icon">⚽</span>
          <h1 className="login-title">Figurinhas Copa 2026</h1>
        </div>

        <h2 className="login-subtitle">{isRegister ? 'Cadastrar' : 'Entrar'}</h2>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="form-group">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Aguarde...' : isRegister ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>

        <button className="btn-link" onClick={toggle}>
          {isRegister
            ? 'Já tem conta? Entrar'
            : 'Não tem conta? Cadastrar'}
        </button>
      </div>
    </div>
  )
}
