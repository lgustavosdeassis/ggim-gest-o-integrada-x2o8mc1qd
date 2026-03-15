import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import { DataStoreProvider } from './stores/main'

import Index from './pages/Index'
import Registrar from './pages/Registrar'
import Historico from './pages/Historico'
import Importar from './pages/Importar'
import NotFound from './pages/NotFound'

const App = () => (
  <DataStoreProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/registrar" element={<Registrar />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/importar" element={<Importar />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </DataStoreProvider>
)

export default App
