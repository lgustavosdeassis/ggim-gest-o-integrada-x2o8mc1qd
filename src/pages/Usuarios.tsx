import { useState, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { useAuditStore } from '@/stores/audit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
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
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2, ShieldAlert, UserPlus, Shield, Upload, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(4, 'A senha deve ter pelo menos 4 caracteres'),
  role: z.enum(['owner', 'editor', 'viewer'], { required_error: 'Selecione um perfil' }),
  avatarUrl: z.string().optional(),
  canGenerateReports: z.boolean().optional(),
  allowedTabs: z.array(z.string()).optional(),
})

export default function Usuarios() {
  const { user: currentUser, users, addUser, removeUser } = useAuthStore()
  const addLog = useAuditStore((state) => state.addLog)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'viewer',
      avatarUrl: '',
      canGenerateReports: false,
      allowedTabs: [],
    },
  })

  if (currentUser?.role !== 'owner') return <Navigate to="/" replace />

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (users.some((u) => u.email === values.email)) {
      return toast.error('Este e-mail já está em uso por outro usuário.')
    }
    setIsSubmitting(true)
    try {
      await addUser({
        id: Math.random().toString(36).substring(2, 9),
        ...values,
        jobTitle:
          values.role === 'owner'
            ? 'Proprietário'
            : values.role === 'editor'
              ? 'Editor'
              : 'Visualizador',
      })
      addLog({
        userName: currentUser?.name || 'Sistema',
        userEmail: currentUser?.email || '',
        action: `Cadastrou o novo usuário: ${values.email} (${values.role})`,
      })
      setIsOpen(false)
      form.reset()
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 256
          const MAX_HEIGHT = 256
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          form.setValue('avatarUrl', canvas.toDataURL('image/jpeg', 0.8))
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-primary" /> Gestão de Usuários
          </h1>
          <p className="text-muted-foreground text-base font-medium">
            Gerencie o acesso ao sistema. Apenas Proprietários podem adicionar ou remover contas.
          </p>
        </div>

        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) form.reset()
          }}
        >
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-xl font-bold bg-primary text-primary-foreground shadow-md">
              <UserPlus className="mr-2 h-5 w-5" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-border bg-card rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-foreground">
                Registrar Acesso
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <div className="flex justify-center mb-6">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg transition-all duration-300 group-hover:opacity-80">
                      <AvatarImage src={form.watch('avatarUrl') || ''} className="object-cover" />
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-bold text-xl">
                        <UserIcon className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Nome Completo
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: João da Silva"
                          className="h-11 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        E-mail
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="joao@ggim.foz.br"
                          className="h-11 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Senha Provisória
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="h-11 rounded-xl tracking-widest"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Nível de Permissão
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue placeholder="Selecione um perfil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="owner">Proprietário (Admin)</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('role') === 'viewer' && (
                  <FormField
                    control={form.control}
                    name="canGenerateReports"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border p-4 bg-muted/20">
                        <div className="space-y-0.5">
                          <FormLabel className="text-xs font-bold text-foreground uppercase tracking-widest">
                            Gerar Relatórios
                          </FormLabel>
                          <div className="text-xs text-muted-foreground font-medium">
                            Permitir que este usuário gere relatórios.
                          </div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {form.watch('role') === 'editor' && (
                  <FormField
                    control={form.control}
                    name="allowedTabs"
                    render={({ field }) => (
                      <FormItem className="p-4 rounded-xl border border-border bg-muted/20">
                        <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Permissões de Edição (Abas)
                        </FormLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                          {[
                            'Dashboard BI',
                            'Registrar Atividade',
                            'Importar Arquivo',
                            'Acervo Histórico',
                            'Videomonitoramento',
                            'Observatório',
                          ].map((tab) => (
                            <div key={tab} className="flex items-center space-x-2">
                              <Checkbox
                                id={`tab-${tab.replace(/\s+/g, '-')}`}
                                checked={field.value?.includes(tab)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || []
                                  if (checked) {
                                    field.onChange([...current, tab])
                                  } else {
                                    field.onChange(current.filter((t) => t !== tab))
                                  }
                                }}
                              />
                              <label
                                htmlFor={`tab-${tab.replace(/\s+/g, '-')}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {tab}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl font-bold"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="rounded-xl font-bold" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Criar Conta'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs font-bold uppercase tracking-widest py-5 pl-6">
                Nome
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest py-5">
                E-mail
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest py-5">
                Perfil
              </TableHead>
              <TableHead className="text-right pr-6 py-5 text-xs font-bold uppercase tracking-widest">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u, idx) => {
              const isMe = u.id === currentUser?.id
              return (
                <TableRow key={u.id || `user-${idx}`} className="border-border hover:bg-muted/50">
                  <TableCell className="py-4 pl-6 font-bold text-sm">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border shadow-sm">
                        <AvatarImage src={u.avatarUrl || ''} />
                        <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                          {u.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        {u.name}{' '}
                        {isMe && (
                          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary uppercase">
                            Você
                          </span>
                        )}
                        <div className="text-xs text-muted-foreground font-medium mt-1">
                          {u.jobTitle || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="py-4">
                    <span
                      className={`rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest ${
                        u.role === 'owner'
                          ? 'border-primary/20 bg-primary/10 text-primary'
                          : u.role === 'editor'
                            ? 'border-chart-2/20 bg-chart-2/10 text-chart-2'
                            : 'border-chart-3/20 bg-chart-3/10 text-chart-3'
                      }`}
                    >
                      {u.role === 'owner'
                        ? 'Proprietário'
                        : u.role === 'editor'
                          ? 'Editor'
                          : 'Visualizador'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    {!isMe ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold">
                              <ShieldAlert className="h-6 w-6 text-destructive" /> Revogar Acesso
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-base font-medium">
                              Tem certeza que deseja remover este usuário?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl font-bold">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                try {
                                  await removeUser(u.id)
                                  addLog({
                                    userName: currentUser?.name || 'Sistema',
                                    userEmail: currentUser?.email || '',
                                    action: `Revogou o acesso do usuário: ${u.email}`,
                                  })
                                } catch (e) {
                                  console.error(e)
                                }
                              }}
                              className="rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <span className="text-xs text-muted-foreground/50 font-medium uppercase tracking-widest pr-2">
                        Protegido
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
