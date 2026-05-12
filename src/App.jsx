import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import CollectionsPage from './pages/CollectionsPage.jsx'
import AlbumPage from './pages/AlbumPage.jsx'

function ProtectedRoute({ children }) {
  const { token, initialized } = useAuth()
  if (!initialized) return null
  if (!token) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { token, initialized } = useAuth()

  if (!initialized) return null

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/collections" replace /> : <LoginPage />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route
        path="/collections"
        element={
          <ProtectedRoute>
            <CollectionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/album/:id"
        element={
          <ProtectedRoute>
            <AlbumPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
