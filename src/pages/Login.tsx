import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { api, setCloudDbId } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { GgimLogo } from '@/components/GgimLogo'

export default function Login() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [syncId, setSyncId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (syncId) {
        setCloudDbId(syncId)
        await new Promise((resolve) => setTimeout(resolve, 800))
      }

      // Always fetch the freshest users from the centralized API to authenticate globally
      const usersList = await api.users.list(true)

      const user = usersList.find(
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
      }
    } catch (error) {
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível contatar o servidor central.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative">
      <Card className="w-full max-w-[400px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 bg-white z-10 rounded-[2rem] overflow-hidden">
        <CardHeader className="space-y-4 flex flex-col items-center text-center pb-6 pt-10">
          <div className="w-[120px] h-[120px] flex items-center justify-center shadow-xl bg-black rounded-[2rem] overflow-hidden border-2 border-[#1e293b]">
            <GgimLogo className="w-full h-full object-contain" />
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

            <div className="space-y-2 pt-3 border-t border-slate-100 mt-2">
              <Label
                htmlFor="syncId"
                className="text-xs font-bold text-[#0f172a]/60 uppercase tracking-widest ml-1"
              >
                Código Cloud Sync (Opcional)
              </Label>
              <Input
                id="syncId"
                type="text"
                placeholder="ID para restaurar dados de outro PC..."
                value={syncId}
                onChange={(e) => setSyncId(e.target.value)}
                className="bg-[#f1f5f9] border-transparent hover:border-slate-300 h-12 rounded-xl text-[#0f172a] px-4 font-semibold focus-visible:ring-2 focus-visible:ring-[#eab308] focus-visible:border-transparent focus-visible:bg-white shadow-inner transition-all text-sm"
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
