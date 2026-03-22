import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { GlobalDataSync } from '@/components/GlobalDataSync'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Index from '@/pages/Index'
import Registrar from '@/pages/Registrar'
import Importar from '@/pages/Importar'
import Historico from '@/pages/Historico'
import Videomonitoramento from '@/pages/Videomonitoramento'
import Observatorio from '@/pages/Observatorio'
import NotFound from '@/pages/NotFound'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import Usuarios from '@/pages/Usuarios'
import AuditLogs from '@/pages/AuditLogs'
import { Toaster } from '@/components/ui/sonner'
import { useAuthStore } from '@/stores/auth'
import { useState, useEffect } from 'react'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [isReady, setIsReady] = useState(false)
  const location = useLocation()

  useEffect(() => {
    let isMounted = true
    const timer = setTimeout(() => {
      if (isMounted) setIsReady(true)
    }, 1000)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (isReady && isAuthenticated && !user?.role) {
      logout()
    }
  }, [isReady, isAuthenticated, user, logout])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#eab308] border-t-transparent rounded-full animate-spin mb-5" />
          <p className="text-white/60 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">
            Sincronizando Módulo Seguro...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user?.role) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <ErrorBoundary>{children}</ErrorBoundary>
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <GlobalDataSync>
                <Layout />
              </GlobalDataSync>
            </ProtectedRoute>
          }
        >
          <Route index element={<Index />} />
          <Route path="registrar" element={<Registrar />} />
          <Route path="importar" element={<Importar />} />
          <Route path="historico" element={<Historico />} />
          <Route path="videomonitoramento" element={<Videomonitoramento />} />
          <Route path="observatorio" element={<Observatorio />} />
          <Route path="profile" element={<Profile />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  )
}
