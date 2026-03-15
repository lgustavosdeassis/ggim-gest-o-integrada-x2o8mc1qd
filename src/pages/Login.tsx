import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth'
import { useNavigate } from 'react-router-dom'
import logoCmtecs from '@/assets/logo-cmtecs-a4c2e.jpeg'
import logoGgim from '@/assets/logo-ggim-texto-preto-sem-fundo-4ad89.jpeg'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      login()
      navigate('/')
    }, 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-chart-2/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card/95 backdrop-blur-xl z-10">
        <CardHeader className="space-y-6 flex flex-col items-center text-center pb-8 pt-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 shadow-md bg-white p-1">
              <img
                src={logoCmtecs}
                alt="CMTecs Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/30 shadow-md bg-white p-2">
              <img src={logoGgim} alt="GGIM Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Gestão Integrada GGIM
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground font-medium">
              Acesso restrito à plataforma de consolidação
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Corporativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="gestor@ggim.foz.br"
                defaultValue="gestor@ggim.foz.br"
                className="bg-background/50 h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a
                  href="#"
                  className="text-xs text-primary font-semibold hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                defaultValue="123456"
                className="bg-background/50 h-12"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 font-bold text-base shadow-lg hover:shadow-primary/25 transition-all mt-4"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Entrar no Sistema'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
