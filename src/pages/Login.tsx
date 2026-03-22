import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
      // Improved authentication logic to be case-insensitive and ignore trailing spaces
      const user = users.find(
        (u) =>
          u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password,
      )

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
            <div className="w-32 h-32 z-10 flex items-center justify-center drop-shadow-xl bg-[#0f172a] rounded-2xl p-3 border border-[#1e293b]/50">
              <img src="/logo-ggim.png" alt="GGIM Logo" className="w-full h-full object-contain" />
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
              className="w-full h-14 font-black text-base bg-[#0f172a] text-[#eab308] hover:bg-[#1e293b] hover:text-[#facc15] shadow-xl transition-all mt-4 rounded-xl flex items-center justify-center gap-2 group border border-[#eab308]/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[#eab308]" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-5 w-5 opacity-80 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
