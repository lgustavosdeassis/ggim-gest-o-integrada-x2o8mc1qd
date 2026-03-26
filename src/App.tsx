import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
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
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { AuthProvider, useAuth } from '@/hooks/use-auth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user: authUser, loading: authLoading } = useAuth()
  const { isAuthenticated, user: storeUser } = useAuthStore()
  const location = useLocation()

  if (authLoading) {
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
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    let mounted = true
    if (authUser) {
      setProfileLoading(true)
      supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
        .then(({ data, error }) => {
          if (!mounted) return
          if (error && error.code !== 'PGRST116') {
            console.error('Erro ao buscar perfil:', error)
          }

          const profile = data as any

          let parsedTabs: string[] = []
          try {
            const rawTabs = profile?.allowed_tabs ?? authUser.user_metadata?.allowed_tabs
            if (Array.isArray(rawTabs)) {
              parsedTabs = rawTabs
            } else if (typeof rawTabs === 'string') {
              if (rawTabs.startsWith('{') && rawTabs.endsWith('}')) {
                const inner = rawTabs.slice(1, -1).trim()
                if (inner) {
                  parsedTabs = inner.split(',').map((s) => s.trim().replace(/(^"|"$)/g, ''))
                }
              } else {
                try {
                  parsedTabs = JSON.parse(rawTabs)
                } catch (e) {
                  // Ignora parse se não for json
                }
              }
            }
          } catch (e) {
            console.error('Error parsing allowedTabs', e)
          }

          if (profile) {
            login({
              id: profile.id,
              email: profile.email || authUser.email || '',
              name: profile.name || authUser.user_metadata?.name || 'Usuário',
              role: profile.role || authUser.user_metadata?.role || 'viewer',
              jobTitle: profile.job_title || authUser.user_metadata?.job_title,
              avatarUrl: profile.avatar_url,
              canGenerateReports:
                profile.can_generate_reports ??
                authUser.user_metadata?.can_generate_reports ??
                false,
              canDeleteReports:
                profile.can_delete_reports ?? authUser.user_metadata?.can_delete_reports ?? false,
              allowedTabs: parsedTabs,
            })
          } else {
            login({
              id: authUser.id,
              email: authUser.email || '',
              name: authUser.user_metadata?.name || 'Usuário',
              role: authUser.user_metadata?.role || 'viewer',
              allowedTabs: parsedTabs,
            })
          }
          setProfileLoading(false)
        })
        .catch((err) => {
          console.error('Profile catch block:', err)
          if (!mounted) return
          login({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || 'Usuário',
            role: authUser.user_metadata?.role || 'viewer',
            allowedTabs: Array.isArray(authUser.user_metadata?.allowed_tabs)
              ? authUser.user_metadata.allowed_tabs
              : [],
          })
          setProfileLoading(false)
        })
    } else {
      logout()
      setProfileLoading(false)
    }

    return () => {
      mounted = false
    }
  }, [authUser, authLoading, login, logout])

  if (authLoading || profileLoading) {
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
