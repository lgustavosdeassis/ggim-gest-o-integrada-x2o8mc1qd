import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import logoGgim from '@/assets/logo-ggim.svg'

export default function Login() {
  const { login, users } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      const user = users.find((u) => u.email === email && u.password === password)
      if (user) {
        login(user)
        navigate('/')
      } else {
        toast({
          title: 'Acesso Negado',
          description: 'Login ou Senha incorretos. Verifique as credenciais.',
          variant: 'destructive',
        })
        setIsLoading(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#eab308]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#0f172a]/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl border border-[#0f172a]/10 bg-white z-10 rounded-3xl overflow-hidden">
        <CardHeader className="space-y-6 flex flex-col items-center text-center pb-8 pt-12 border-b border-[#0f172a]/10 bg-slate-50/50">
          <div className="flex items-center gap-6 relative">
            <div className="absolute inset-0 bg-[#eab308]/20 blur-2xl rounded-full scale-150 z-0" />
            <div className="w-32 h-32 z-10 flex items-center justify-center drop-shadow-xl">
              <img src={logoGgim} alt="GGIM Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="space-y-2 z-10">
            <CardTitle className="text-3xl font-black tracking-tight text-[#0f172a]">
              GGIM Foz
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
              Plataforma de Gestão Integrada
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
              <p className="mb-2 font-bold text-sm">Credenciais de Acesso (Teste):</p>
              <div className="space-y-1">
                <p>
                  Proprietário: <span className="font-bold">admin@ggim.foz.br</span> /{' '}
                  <span className="font-bold">admin</span>
                </p>
                <p>
                  Editor: <span className="font-bold">editor@ggim.foz.br</span> /{' '}
                  <span className="font-bold">editor</span>
                </p>
                <p>
                  Visualizador: <span className="font-bold">viewer@ggim.foz.br</span> /{' '}
                  <span className="font-bold">viewer</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-[#0f172a] uppercase tracking-widest ml-1"
              >
                Login
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="Ex: admin@ggim.foz.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-[#0f172a]/20 h-14 rounded-xl text-foreground px-4 font-medium focus-visible:ring-[#eab308] shadow-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold text-[#0f172a] uppercase tracking-widest"
                >
                  Senha
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-[#0f172a]/20 h-14 rounded-xl text-foreground px-4 font-medium focus-visible:ring-[#eab308] tracking-widest shadow-sm"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-14 font-black text-base bg-[#0f172a] text-white hover:bg-[#1e293b] shadow-xl transition-all mt-4 rounded-xl flex items-center justify-center gap-2 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  Entrar
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
