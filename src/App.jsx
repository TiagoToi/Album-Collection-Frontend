import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import CollectionsPage from './pages/CollectionsPage.jsx'
import AlbumPage from './pages/AlbumPage.jsx'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
      <Route path="/" element={<Navigate to="/collections" replace />} />
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
