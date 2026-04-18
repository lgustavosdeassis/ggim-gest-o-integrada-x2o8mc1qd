import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Save, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

export default function UsuariosForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()

  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditing)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'viewer',
  })

  useEffect(() => {
    if (isEditing) {
      pb.collection('users')
        .getOne(id)
        .then((record) => {
          setFormData({
            name: record.name || '',
            email: record.email || '',
            password: '',
            passwordConfirm: '',
            role: record.role || 'viewer',
          })
        })
        .catch((err) => {
          console.error(err)
          toast.error('Erro ao carregar usuário.')
          navigate('/usuarios')
        })
        .finally(() => {
          setInitialLoading(false)
        })
    }
  }, [id, isEditing, navigate])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})

    try {
      if (formData.password && formData.password !== formData.passwordConfirm) {
        setFieldErrors({ passwordConfirm: 'As senhas não coincidem' })
        setLoading(false)
        return
      }

      const dataToSave: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      }

      if (formData.password) {
        dataToSave.password = formData.password
        dataToSave.passwordConfirm = formData.passwordConfirm
      }

      if (isEditing) {
        await pb.collection('users').update(id, dataToSave)
      } else {
        await pb.collection('users').create(dataToSave)
      }

      toast.success('Usuário salvo com sucesso!')
      navigate('/usuarios')
    } catch (error) {
      console.error(error)
      const errors = extractFieldErrors(error)
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        toast.error('Erro ao salvar usuário. Verifique os campos.')
      } else {
        toast.error('Erro ao salvar usuário. Por favor, tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-in fade-in">
        <ShieldAlert className="h-16 w-16 text-destructive opacity-80" />
        <h2 className="text-2xl font-black text-foreground uppercase tracking-widest">
          Acesso Negado
        </h2>
        <p className="text-muted-foreground font-medium">
          Apenas administradores podem gerenciar usuários.
        </p>
      </div>
    )
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/usuarios')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </h1>
          <p className="text-muted-foreground font-medium">
            Preencha os dados abaixo para {isEditing ? 'atualizar' : 'cadastrar'} o usuário.
          </p>
        </div>
      </div>

      <Card className="border-border shadow-sm rounded-2xl bg-card">
        <form onSubmit={handleSubmit}>
          <CardHeader className="border-b border-border pb-4 bg-muted/20">
            <CardTitle className="text-lg font-bold">Dados do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nome completo"
                  className={fieldErrors.name ? 'border-destructive' : ''}
                />
                {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                  className={fieldErrors.email ? 'border-destructive' : ''}
                  required
                />
                {fieldErrors.email && (
                  <p className="text-sm text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Senha{' '}
                  {isEditing && (
                    <span className="text-muted-foreground text-xs font-normal">
                      (Opcional para manter a atual)
                    </span>
                  )}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className={fieldErrors.password ? 'border-destructive' : ''}
                  required={!isEditing}
                  minLength={8}
                />
                {fieldErrors.password && (
                  <p className="text-sm text-destructive">{fieldErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Confirmar Senha</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={formData.passwordConfirm}
                  onChange={(e) => handleChange('passwordConfirm', e.target.value)}
                  placeholder="••••••••"
                  className={fieldErrors.passwordConfirm ? 'border-destructive' : ''}
                  required={!isEditing || !!formData.password}
                  minLength={8}
                />
                {fieldErrors.passwordConfirm && (
                  <p className="text-sm text-destructive">{fieldErrors.passwordConfirm}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Perfil de Acesso</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleChange('role', value)}
                >
                  <SelectTrigger className={fieldErrors.role ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Visualizador (Viewer)</SelectItem>
                    <SelectItem value="admin">Administrador (Admin)</SelectItem>
                    <SelectItem value="owner">Proprietário (Owner)</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.role && <p className="text-sm text-destructive">{fieldErrors.role}</p>}
              </div>
            </div>
          </CardContent>
          <div className="border-t border-border p-4 bg-muted/20 flex justify-end gap-3 rounded-b-2xl">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/usuarios')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
