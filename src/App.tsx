import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Index from '@/pages/Index'
import Registrar from '@/pages/Registrar'
import Importar from '@/pages/Importar'
import Historico from '@/pages/Historico'
import NotFound from '@/pages/NotFound'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import { Toaster } from '@/components/ui/sonner'
import { useAuthStore } from '@/stores/auth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
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
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Index />} />
          <Route path="registrar" element={<Registrar />} />
          <Route path="importar" element={<Importar />} />
          <Route path="historico" element={<Historico />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  )
}
