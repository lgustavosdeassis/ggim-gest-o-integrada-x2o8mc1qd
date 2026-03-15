import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('Erro 404: Usuário tentou acessar rota inexistente:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="bg-muted p-6 rounded-full mb-6">
        <span className="text-4xl">🚧</span>
      </div>
      <h1 className="text-5xl font-bold tracking-tight mb-4 text-primary">404</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Ops! A página que você procura não existe no sistema.
      </p>
      <Link
        to="/"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        Voltar para o Início
      </Link>
    </div>
  )
}

export default NotFound
