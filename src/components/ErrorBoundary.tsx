import React, { Component, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    // Sentry.init() and Sentry.captureException() removed here to resolve
    // "[Sentry] You cannot use Sentry.init() in a browser extension" error.
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#020617] p-4 text-center">
          <div className="rounded-lg border border-slate-800 bg-slate-900 text-slate-100 shadow-sm p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-2 text-[#eab308]">Algo deu errado</h2>
            <p className="text-sm text-slate-400 mb-6 max-w-md">
              O aplicativo encontrou um erro inesperado. Por favor, tente recarregar a página.
            </p>
            <button
              className="px-4 py-2 bg-[#eab308] text-slate-900 font-medium rounded-md hover:bg-[#ca8a04] transition-colors"
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
                window.location.reload()
              }}
            >
              Recarregar Página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
