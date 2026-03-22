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
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      // Get fresh state to ensure new users created in other sessions are immediately available
      const currentUsers = useAuthStore.getState().users
      const user = currentUsers.find(
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative">
      <Card className="w-full max-w-[400px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 bg-white z-10 rounded-[2rem] overflow-hidden">
        <CardHeader className="space-y-4 flex flex-col items-center text-center pb-6 pt-10">
          <div className="w-[110px] h-[110px] flex items-center justify-center shadow-xl bg-[#0f172a] rounded-[2rem] p-3 mb-2 border-2 border-[#1e293b]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-[#eab308] drop-shadow-md"
            >
              <path d="M12 2L2 7L2 17L12 22L22 17L22 7L12 2Z" fill="currentColor" />
              <path d="M12 4.5L4.5 8.5V15.5L12 19.5L19.5 15.5V8.5L12 4.5Z" fill="#0f172a" />
              <path d="M12 6L6 9V15L12 18L18 15V9L12 6Z" fill="currentColor" fillOpacity="0.1" />
              <text
                x="12"
                y="13.5"
                fontSize="4.5"
                fontWeight="900"
                fill="#eab308"
                textAnchor="middle"
                dominantBaseline="middle"
                letterSpacing="0.5"
              >
                GGIM
              </text>
            </svg>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight text-[#0f172a]">
              GGIM Foz
            </CardTitle>
            <CardDescription className="text-xs text-[#0f172a]/60 font-bold uppercase tracking-widest mt-1">
              Plataforma de Gestão Integrada
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-[#0f172a] uppercase tracking-widest ml-1"
              >
                E-mail de Acesso
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#f1f5f9] border-transparent hover:border-slate-300 h-14 rounded-xl text-[#0f172a] px-4 font-semibold focus-visible:ring-2 focus-visible:ring-[#eab308] focus-visible:border-transparent focus-visible:bg-white shadow-inner transition-all"
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
                className="bg-[#f1f5f9] border-transparent hover:border-slate-300 h-14 rounded-xl text-[#0f172a] px-4 font-semibold focus-visible:ring-2 focus-visible:ring-[#eab308] focus-visible:border-transparent focus-visible:bg-white tracking-widest shadow-inner transition-all"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-14 font-black text-lg bg-[#eab308] text-[#0f172a] hover:bg-[#ca8a04] shadow-xl transition-all mt-8 rounded-xl flex items-center justify-center gap-2 group border border-[#ca8a04]/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[#0f172a]" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-5 w-5 text-[#0f172a] opacity-90 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
