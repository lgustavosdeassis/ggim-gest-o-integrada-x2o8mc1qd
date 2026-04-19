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
    console.error('Uncaught rendering error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center w-full h-full min-h-[60vh] rounded-xl border border-dashed border-border/50 bg-background/50">
          <div className="bg-destructive/10 p-5 rounded-full mb-6 border border-destructive/20 shadow-sm">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-black mb-3 tracking-tight">Erro ao carregar os dados</h2>
          <p className="text-muted-foreground max-w-md mb-8 font-medium leading-relaxed">
            Ocorreu uma falha de conexão ou você não tem permissão para acessar este recurso. Tente
            novamente em instantes.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="default"
            className="font-bold px-8 h-12 rounded-xl text-base transition-all hover:scale-[1.02]"
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
