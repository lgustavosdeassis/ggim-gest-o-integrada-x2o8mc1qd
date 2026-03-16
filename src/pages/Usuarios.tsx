import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
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
import { Trash2, ShieldAlert, UserPlus, Shield } from 'lucide-react'
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

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(4, 'A senha deve ter pelo menos 4 caracteres'),
  role: z.enum(['editor', 'viewer'], { required_error: 'Selecione um perfil' }),
})

export default function Usuarios() {
  const { user: currentUser, users, addUser, removeUser } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', password: '', role: 'viewer' },
  })

  if (currentUser?.role !== 'editor') return <Navigate to="/" replace />

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (users.some((u) => u.email === values.email)) {
      return toast.error('Este e-mail já está em uso por outro usuário.')
    }
    addUser({
      id: Math.random().toString(36).substring(2, 9),
      ...values,
      jobTitle: values.role === 'editor' ? 'Gestor Administrativo' : 'Visualizador',
    })
    toast.success('Usuário registrado com sucesso!')
    setIsOpen(false)
    form.reset()
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

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-xl font-bold bg-primary text-primary-foreground shadow-md">
              <UserPlus className="mr-2 h-5 w-5" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-border bg-card rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-foreground">
                Registrar Acesso
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
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
                          <SelectItem value="editor">Proprietário (Admin)</SelectItem>
                          <SelectItem value="viewer">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl font-bold"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="rounded-xl font-bold">
                    Criar Conta
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
            {users.map((u) => {
              const isMe = u.id === currentUser?.id
              return (
                <TableRow key={u.id} className="border-border hover:bg-muted/50">
                  <TableCell className="py-4 pl-6 font-bold text-sm">
                    {u.name}{' '}
                    {isMe && (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary uppercase">
                        Você
                      </span>
                    )}
                    <div className="text-xs text-muted-foreground font-medium mt-1">
                      {u.jobTitle || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="py-4">
                    <span
                      className={`rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest ${u.role === 'editor' ? 'border-chart-2/20 bg-chart-2/10 text-chart-2' : 'border-chart-3/20 bg-chart-3/10 text-chart-3'}`}
                    >
                      {u.role === 'editor' ? 'Proprietário' : 'Visualizador'}
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
                              onClick={() => {
                                removeUser(u.id)
                                toast.success('Removido')
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
