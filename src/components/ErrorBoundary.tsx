import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error('Uncaught rendering error in ProtectedRoute boundary:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white p-6 text-center z-[100] fixed inset-0 w-full h-full">
          <div className="bg-[#eab308]/10 p-6 rounded-full mb-6 border border-[#eab308]/20 shadow-[0_0_40px_rgba(234,179,8,0.1)]">
            <AlertTriangle className="h-12 w-12 text-[#eab308]" />
          </div>
          <h2 className="text-3xl font-black mb-3 tracking-tight">Modo de Segurança Ativado</h2>
          <p className="text-white/60 max-w-md mb-8 font-medium leading-relaxed">
            Ocorreu uma instabilidade na conexão com o sistema central e a interface não pôde ser
            carregada completamente. Nenhuma informação foi perdida.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#eab308] text-[#020617] hover:bg-[#ca8a04] font-black px-8 h-14 rounded-xl text-base shadow-xl transition-all hover:scale-[1.02]"
          >
            <RefreshCcw className="w-5 h-5 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
