import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { GlobalDataSync } from '@/components/GlobalDataSync'
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, logout } = useAuthStore()

  // Verify strict authentication and ensure old sessions without a role are logged out
  if (!isAuthenticated || (isAuthenticated && !user?.role)) {
    if (isAuthenticated) logout()
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
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
              <GlobalDataSync />
              <Layout />
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
