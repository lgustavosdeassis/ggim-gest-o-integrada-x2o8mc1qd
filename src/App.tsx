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
import NotFound from '@/pages/NotFound'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import Usuarios from '@/pages/Usuarios'
import AuditLogs from '@/pages/AuditLogs'
import { Toaster } from '@/components/ui/sonner'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated || !user?.role) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <ErrorBoundary>{children}</ErrorBoundary>
}

export default function App() {
  const { login, logout } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) {
          login({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role as any,
            jobTitle: profile.job_title,
            avatarUrl: profile.avatar_url,
          })
        } else {
          login({
            id: session.user.id,
            email: session.user.email || '',
            name: 'Usuário',
            role: 'editor' as any,
          })
        }
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        logout()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [login, logout])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
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
