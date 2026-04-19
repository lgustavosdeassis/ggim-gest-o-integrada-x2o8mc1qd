import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    // Sentry.init() and captureException have been removed to fix browser extension issues
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4 text-center bg-background">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Algo deu errado.</h1>
            <p className="mt-2 text-muted-foreground">Por favor, recarregue a página.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors hover:bg-primary/90"
            >
              Recarregar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
