import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth'
import { useNavigate } from 'react-router-dom'
import logoImg from '@/assets/logo-cmtecs-a4c2e.jpeg'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate network request
    setTimeout(() => {
      login()
      navigate('/')
    }, 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-4 flex flex-col items-center text-center pb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-md bg-white">
            <img src={logoImg} alt="CMTecs Logo" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight">
              GGIM Gestão Integrada
            </CardTitle>
            <CardDescription className="text-base">
              Faça login para acessar sua conta
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ggim.foz.br"
                defaultValue="admin@ggim.foz.br"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a
                  href="#"
                  className="text-xs text-primary hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  Esqueceu a senha?
                </a>
              </div>
              <Input id="password" type="password" defaultValue="123456" required />
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
