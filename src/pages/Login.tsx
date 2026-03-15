import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth'
import { useNavigate } from 'react-router-dom'
import logoGgim from '@/assets/logo-ggim-texto-preto-sem-fundo-4ad89.jpeg'
import { useState } from 'react'
import { Loader2, ArrowRight } from 'lucide-react'

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
      {/* Abstract Background Effects */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-chart-2/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[80%] h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl border-border/20 bg-card/80 backdrop-blur-2xl z-10 rounded-3xl overflow-hidden">
        <CardHeader className="space-y-6 flex flex-col items-center text-center pb-8 pt-12 border-b border-border/10 bg-muted/5">
          <div className="flex items-center gap-6 relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 z-0" />
            <div className="w-24 h-24 rounded-2xl overflow-hidden border border-border/30 shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-white p-2 z-10">
              <img src={logoGgim} alt="GGIM Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="space-y-2 z-10">
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              GGIM Foz
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
              Plataforma de Gestão Integrada
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1"
              >
                Credencial de Acesso
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="gestor@ggim.foz.br"
                defaultValue="gestor@ggim.foz.br"
                className="bg-background/80 border-border/40 h-14 rounded-xl text-white px-4 font-medium focus-visible:ring-primary/50"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
                >
                  Senha de Segurança
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                defaultValue="123456"
                className="bg-background/80 border-border/40 h-14 rounded-xl text-white px-4 font-medium focus-visible:ring-primary/50 tracking-widest"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-14 font-black text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all mt-4 rounded-xl flex items-center justify-center gap-2 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight className="h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
