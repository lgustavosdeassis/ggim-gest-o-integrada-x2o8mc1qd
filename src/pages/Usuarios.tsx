import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react'

type User = {
  id: string
  email: string
  name: string
  role: string
  status: string
  job_title: string
  is_admin: boolean
  can_generate_reports: boolean
  allowed_tabs: string[]
}

const TABS_AVAILABLE = [
  'Dashboard BI',
  'Registrar Atividade',
  'Importar Arquivo',
  'Acervo Histórico',
  'Videomonitoramento',
  'Observatório',
]

export default function Usuarios() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<Partial<User> & { password?: string }>({
    name: '',
    email: '',
    role: 'viewer',
    status: 'active',
    job_title: 'Visualizador',
    is_admin: false,
    can_generate_reports: false,
    allowed_tabs: [],
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: { action: 'list' },
      })

      if (error) throw error
      if (data?.users) {
        setUsers(data.users)
      }
    } catch (error: any) {
      toast.error('Erro ao buscar usuários: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      role: 'viewer',
      status: 'active',
      job_title: 'Visualizador',
      is_admin: false,
      can_generate_reports: false,
      allowed_tabs: [],
    })
    setIsEditing(false)
    setIsOpen(true)
  }

  const handleOpenEdit = (user: User) => {
    setFormData({
      ...user,
      password: '',
    })
    setIsEditing(true)
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      const { error } = await supabase.functions.invoke('manage-user', {
        body: { action: 'delete', userData: { id } },
      })
      if (error) throw error
      toast.success('Usuário excluído com sucesso!')
      fetchUsers()
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const action = isEditing ? 'update' : 'create'
      const payload = { action, userData: formData }

      const { error } = await supabase.functions.invoke('manage-user', {
        body: payload,
      })

      if (error) throw error

      toast.success(`Usuário ${isEditing ? 'atualizado' : 'criado'} com sucesso!`)
      setIsOpen(false)
      fetchUsers()
    } catch (error: any) {
      toast.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'}: ` + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">Gerencie o acesso ao sistema GGIM.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  required
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}</Label>
                <Input
                  type="password"
                  required={!isEditing}
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cargo / Título (Opcional)</Label>
                  <Select
                    value={formData.job_title || ''}
                    onValueChange={(val) => {
                      const isAdm = val === 'Administrador'
                      setFormData({
                        ...formData,
                        job_title: val,
                        role: isAdm ? 'admin' : val === 'Editor' ? 'editor' : 'viewer',
                        is_admin: isAdm,
                        allowed_tabs: val === 'Editor' ? formData.allowed_tabs || [] : [],
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cargo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Editor">Editor</SelectItem>
                      <SelectItem value="Visualizador">Visualizador</SelectItem>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status || 'active'}
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.job_title === 'Editor' && (
                <div className="space-y-3 pt-2">
                  <Label className="font-bold text-sm text-foreground">
                    Permissões de Edição (Abas)
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/40 p-4 rounded-lg border border-border">
                    {TABS_AVAILABLE.map((tab) => (
                      <div key={tab} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tab-${tab}`}
                          checked={formData.allowed_tabs?.includes(tab)}
                          onCheckedChange={(checked) => {
                            const current = formData.allowed_tabs || []
                            setFormData({
                              ...formData,
                              allowed_tabs: checked
                                ? [...current, tab]
                                : current.filter((t) => t !== tab),
                            })
                          }}
                        />
                        <Label
                          htmlFor={`tab-${tab}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {tab}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2 border-t mt-4">
                <Switch
                  id="reports"
                  checked={formData.can_generate_reports || false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, can_generate_reports: checked })
                  }
                />
                <Label htmlFor="reports">Pode gerar relatórios gerenciais</Label>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Cargo / Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-sm font-semibold">{user.job_title}</span>
                      <Badge
                        variant={user.is_admin || user.role === 'admin' ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {user.role === 'admin' || user.is_admin ? 'Admin' : user.role}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === 'active' ? 'outline' : 'destructive'}
                      className="capitalize"
                    >
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
