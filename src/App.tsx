import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { GlobalDataSync } from '@/components/GlobalDataSync'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Index from '@/pages/Index'
import Registrar from '@/pages/Registrar'
import Importar from '@/pages/Importar'
import Historico from '@/pages/Historico'
import Videomonitoramento from '@/pages/Videomonitoramento'
import Observatorio from '@/pages/Observatorio'
import Relatorios from '@/pages/Relatorios'
import NotFound from '@/pages/NotFound'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import Usuarios from '@/pages/Usuarios'
import AuditLogs from '@/pages/AuditLogs'
import { Toaster } from '@/components/ui/sonner'
import { useAuthStore } from '@/stores/auth'
import { Loader2 } from 'lucide-react'
import { AuthProvider, useAuth } from '@/hooks/use-auth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user: authUser, loading: authLoading } = useAuth()
  const { isAuthenticated, user: storeUser } = useAuthStore()
  const location = useLocation()

  if (authLoading || (authUser && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] relative z-50">
        <Loader2 className="h-12 w-12 animate-spin text-[#eab308]" />
      </div>
    )
  }

  if (!authUser || !isAuthenticated || !storeUser?.role) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <ErrorBoundary>{children}</ErrorBoundary>
}

const AppContent = () => {
  const { user: authUser, loading: authLoading } = useAuth()
  const fetchProfile = useAuthStore((state) => state.fetchProfile)
  const logout = useAuthStore((state) => state.logout)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (authLoading) return

    if (!authUser) {
      logout()
      return
    }

    if (!isAuthenticated && authUser.email) {
      fetchProfile(authUser.email)
    }
  }, [authUser, authLoading, fetchProfile, logout, isAuthenticated])

  if (authLoading || (authUser && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] relative z-50">
        <Loader2 className="h-12 w-12 animate-spin text-[#eab308]" />
      </div>
    )
  }

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
          <Route path="relatorios" element={<Relatorios />} />
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
