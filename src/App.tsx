import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Registrar from '@/pages/Registrar'
import Historico from '@/pages/Historico'
import Importar from '@/pages/Importar'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/registrar" element={<Registrar />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/importar" element={<Importar />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  )
}
