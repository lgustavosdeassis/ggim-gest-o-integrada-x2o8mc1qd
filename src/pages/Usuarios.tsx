import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, UserPlus, Pencil, Trash2, ShieldCheck, Mail, Briefcase } from 'lucide-react'

const AVAILABLE_TABS = [
  'Dashboard BI',
  'Registrar Atividade',
  'Importar Arquivo',
  'Acervo Histórico',
  'Videomonitoramento',
  'Observatório',
  'Relatórios GGIM',
]

type User = {
  id: string
  email: string
  name: string
  role: string
  status: string
  job_title: string
  is_admin: boolean
  can_generate_reports: boolean
  can_delete_reports: boolean
  allowed_tabs: string[]
}

export default function Usuarios() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'viewer',
    job_title: '',
    can_generate_reports: false,
    can_delete_reports: false,
    allowed_tabs: [] as string[],
  })

  const isOwnerOrAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin'

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: { action: 'list' },
      })
      if (error) throw error
      setUsers(data?.users || [])
    } catch (err: any) {
      toast.error('Erro ao carregar usuários: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOwnerOrAdmin) fetchUsers()
  }, [isOwnerOrAdmin])

  const openNewDialog = () => {
    setEditingUser(null)
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'viewer',
      job_title: '',
      can_generate_reports: false,
      can_delete_reports: false,
      allowed_tabs: [],
    })
    setDialogOpen(true)
  }

  const openEditDialog = (u: User) => {
    setEditingUser(u)
    setFormData({
      email: u.email,
      password: '', // blank on edit unless changed
      name: u.name,
      role: u.role,
      job_title: u.job_title || '',
      can_generate_reports: u.can_generate_reports || false,
      can_delete_reports: u.can_delete_reports || false,
      allowed_tabs: u.allowed_tabs || [],
    })
    setDialogOpen(true)
  }

  const toggleTab = (tab: string) => {
    setFormData((prev) => ({
      ...prev,
      allowed_tabs: prev.allowed_tabs.includes(tab)
        ? prev.allowed_tabs.filter((t) => t !== tab)
        : [...prev.allowed_tabs, tab],
    }))
  }

  const handleSubmit = async () => {
    if (!formData.email || !formData.name) {
      toast.error('Preencha os campos obrigatórios (Nome e E-mail)')
      return
    }
    if (!editingUser && !formData.password) {
      toast.error('Senha é obrigatória para novos usuários')
      return
    }

    setSubmitting(true)
    try {
      const action = editingUser ? 'update' : 'create'
      const payload = {
        action,
        userData: {
          id: editingUser?.id,
          ...formData,
          is_admin: formData.role === 'admin' || formData.role === 'owner',
        },
      }

      if (editingUser && !formData.password) {
        delete (payload.userData as any).password
      }

      const { error } = await supabase.functions.invoke('manage-user', { body: payload })
      if (error) throw error

      toast.success(`Usuário ${editingUser ? 'atualizado' : 'criado'} com sucesso!`)
      setDialogOpen(false)
      fetchUsers()
    } catch (err: any) {
      toast.error('Erro ao salvar usuário: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return
    setLoading(true)
    try {
      const { error } = await supabase.functions.invoke('manage-user', {
        body: { action: 'delete', userData: { id } },
      })
      if (error) throw error
      toast.success('Usuário excluído com sucesso!')
      fetchUsers()
    } catch (err: any) {
      toast.error('Erro ao excluir usuário: ' + err.message)
      setLoading(false)
    }
  }

  if (!isOwnerOrAdmin) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <p className="text-muted-foreground font-medium">Acesso restrito a administradores.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3 mb-2">
            <ShieldCheck className="w-10 h-10 text-primary" /> Gestão de Usuários
          </h1>
          <p className="text-muted-foreground text-base font-medium">
            Gerencie os acessos, permissões e perfis do sistema GGIM.
          </p>
        </div>
        <Button
          onClick={openNewDialog}
          className="h-11 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Novo Usuário
        </Button>
      </div>

      <Card className="border-border shadow-sm rounded-2xl bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Cargo / Função</TableHead>
              <TableHead>Nível de Acesso (Role)</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground font-medium"
                >
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase border border-primary/20 shrink-0">
                        {u.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium mt-0.5">
                          <Mail className="w-3 h-3" /> {u.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> {u.job_title || 'Não informado'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md border border-border px-2.5 py-1 text-[10px] font-bold bg-background uppercase tracking-widest text-muted-foreground shadow-sm">
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex flex-col gap-1.5">
                      {u.can_generate_reports && (
                        <span className="text-primary font-bold flex items-center gap-1">
                          • Pode gerar relatórios
                        </span>
                      )}
                      {u.can_delete_reports && (
                        <span className="text-destructive font-bold flex items-center gap-1">
                          • Pode excluir anexos
                        </span>
                      )}
                      <span className="font-semibold text-foreground">
                        • {u.allowed_tabs?.length || 0} páginas liberadas
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(u)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(u.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground">
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Nome Completo
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: João Silva"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  E-mail
                </Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="joao@exemplo.com"
                  disabled={!!editingUser}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Cargo / Função
                </Label>
                <Input
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="Ex: Analista de Dados"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {editingUser ? 'Nova Senha (opcional)' : 'Senha'}
                </Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="***"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Nível de Acesso (Role)
              </Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val })}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer" className="font-medium">
                    Visualizador (Somente Leitura)
                  </SelectItem>
                  <SelectItem value="editor" className="font-medium">
                    Editor (Leitura e Escrita)
                  </SelectItem>
                  <SelectItem value="admin" className="font-medium">
                    Administrador (Acesso Total)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role !== 'admin' && formData.role !== 'owner' && (
              <div className="space-y-4 border border-border p-5 rounded-2xl bg-muted/20">
                <Label className="text-sm font-bold block mb-2 text-foreground">
                  Páginas Permitidas no Menu
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {AVAILABLE_TABS.map((tab) => (
                    <div key={tab} className="flex items-center space-x-3">
                      <Checkbox
                        id={`tab-${tab}`}
                        checked={formData.allowed_tabs.includes(tab)}
                        onCheckedChange={() => toggleTab(tab)}
                        className="rounded"
                      />
                      <label
                        htmlFor={`tab-${tab}`}
                        className="text-sm font-semibold cursor-pointer text-foreground hover:text-primary transition-colors"
                      >
                        {tab}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-5 border border-border p-5 rounded-2xl bg-muted/20">
              <Label className="text-sm font-bold block mb-1 text-foreground">
                Permissões Especiais
              </Label>
              <div className="flex items-center justify-between bg-background p-4 rounded-xl border border-border shadow-sm">
                <div className="space-y-1">
                  <Label className="text-sm font-bold">Pode gerar relatórios gerenciais</Label>
                  <p className="text-xs text-muted-foreground font-medium">
                    Permite exportar e imprimir documentos.
                  </p>
                </div>
                <Switch
                  checked={formData.can_generate_reports}
                  onCheckedChange={(c) => setFormData({ ...formData, can_generate_reports: c })}
                />
              </div>
              <div className="flex items-center justify-between bg-background p-4 rounded-xl border border-border shadow-sm mt-3">
                <div className="space-y-1">
                  <Label className="text-sm font-bold text-destructive">
                    Pode excluir relatórios anexados
                  </Label>
                  <p className="text-xs text-muted-foreground font-medium">
                    Permite apagar permanentemente registros do banco de dados.
                  </p>
                </div>
                <Switch
                  checked={formData.can_delete_reports}
                  onCheckedChange={(c) => setFormData({ ...formData, can_delete_reports: c })}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-2 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
              className="font-bold h-11 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="font-bold h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-8 shadow-sm"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
