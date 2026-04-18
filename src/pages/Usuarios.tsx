import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Users, ShieldAlert, Trash2 } from 'lucide-react'

export default function Usuarios() {
  const { user } = useAuthStore()
  const [usersList, setUsersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await api.users.list()
      setUsersList(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  if (user?.role !== 'admin' && user?.role !== 'owner') {
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

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3 mb-2">
          <Users className="w-10 h-10 text-primary" /> Gerenciar Usuários
        </h1>
        <p className="text-muted-foreground text-base font-medium">
          Visualize e gerencie os usuários e permissões de acesso ao sistema.
        </p>
      </div>

      <Card className="border-border shadow-sm rounded-2xl bg-card">
        <CardHeader className="border-b border-border pb-4 bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Usuários Cadastrados</CardTitle>
            <CardDescription>Lista de todos os perfis com acesso à plataforma.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cargo/Função</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersList.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-bold pl-6">{u.name || 'Sem nome'}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>{u.jobTitle || '-'}</TableCell>
                    <TableCell>
                      <span className="text-[10px] font-black bg-muted px-2 py-0.5 rounded uppercase tracking-wider text-primary border border-border shrink-0">
                        {u.role || 'viewer'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={async () => {
                            if (window.confirm('Tem certeza que deseja remover este usuário?')) {
                              try {
                                await api.users.delete(u.id)
                                loadUsers()
                              } catch (e) {
                                console.error(e)
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
