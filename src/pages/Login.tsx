import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { GgimHexLogo } from '@/components/GgimHexLogo'

export default function Login() {
  const { login, isAuthenticated, fetchUsers } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
      return
    }
    // Fetch users in the background completely decoupled from UI
    fetchUsers().catch(() => {})
  }, [isAuthenticated, fetchUsers, navigate, location])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading) return // Prevent multiple submissions

    setIsLoading(true)
    setErrorMsg(null)

    try {
      // Simulate network request delay for UX and to allow browser autofill/managers to process
      await new Promise((resolve) => setTimeout(resolve, 800))

      let usersList = useAuthStore.getState().users

      // Attempt to fetch from the data layer if state is empty to ensure PocketBase/Skip Cloud alignment
      if (!Array.isArray(usersList) || usersList.length === 0) {
        try {
          const remoteUsers = await api.users.list()
          if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
            usersList = remoteUsers
          }
        } catch (err) {
          console.warn('Could not fetch remote users during login', err)
        }
      }

      if (!Array.isArray(usersList) || usersList.length === 0) {
        usersList = [
          {
            id: '1',
            email: 'admin@ggim.foz.br',
            password: 'admin',
            role: 'owner',
            name: 'Gestor GGIM',
            jobTitle: 'Proprietário',
          },
          {
            id: '2',
            email: 'editor@ggim.foz.br',
            password: 'editor',
            role: 'editor',
            name: 'Editor GGIM',
            jobTitle: 'Editor',
          },
          {
            id: '3',
            email: 'viewer@ggim.foz.br',
            password: 'viewer',
            role: 'viewer',
            name: 'Visualizador GGIM',
            jobTitle: 'Visualizador',
          },
        ]
      }

      const user = usersList.find(
        (u) =>
          u?.email?.toLowerCase().trim() === email.toLowerCase().trim() && u?.password === password,
      )

      if (user) {
        login(user)
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      } else {
        setErrorMsg(
          'E-mail ou senha incorretos. Verifique as credenciais digitadas e tente novamente.',
        )
        toast({
          title: 'Acesso Negado',
          description: 'E-mail ou senha incorretos. Verifique as credenciais.',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      setErrorMsg(
        'Ocorreu uma falha de comunicação com o servidor de autenticação. Tente novamente.',
      )
      toast({
        title: 'Falha na Autenticação',
        description: 'Verifique sua conexão ou tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f172a] via-[#020617] to-[#020617] z-0 pointer-events-none opacity-80" />

      <Card className="w-full max-w-[440px] shadow-2xl border border-white/5 bg-[#0f172a]/95 backdrop-blur-xl z-10 rounded-[2.5rem] overflow-hidden text-white transition-all duration-500 hover:shadow-[0_0_40px_rgba(234,179,8,0.05)]">
        <CardHeader className="space-y-6 flex flex-col items-center text-center pb-6 pt-12 relative">
          <div className="w-[180px] h-[180px] flex items-center justify-center p-0 transition-transform hover:scale-105 duration-500 ease-out relative">
            <GgimHexLogo className="w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
          </div>
          <div className="space-y-1.5 z-10">
            <CardTitle className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
              GGIM Foz
            </CardTitle>
            <CardDescription className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">
              Plataforma de Gestão Integrada
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0 relative z-10">
          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-200 leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-white uppercase tracking-widest ml-1"
              >
                E-mail de Acesso
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-transparent hover:border-white/20 h-14 rounded-xl text-white px-4 font-semibold focus-visible:ring-2 focus-visible:ring-[#eab308] focus-visible:border-transparent focus-visible:bg-white/10 shadow-inner transition-all placeholder:text-white/20"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold text-white uppercase tracking-widest"
                >
                  Senha
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-transparent hover:border-white/20 h-14 rounded-xl text-white px-4 font-semibold focus-visible:ring-2 focus-visible:ring-[#eab308] focus-visible:border-transparent focus-visible:bg-white/10 tracking-widest shadow-inner transition-all placeholder:text-white/20"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 font-black text-lg bg-[#eab308] text-[#020617] hover:bg-[#ca8a04] shadow-xl transition-all mt-8 rounded-2xl flex items-center justify-center gap-2 group border border-[#ca8a04]/20 hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-[#020617]" />
                  Autenticando...
                </>
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight className="h-5 w-5 text-[#020617] opacity-90 group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
