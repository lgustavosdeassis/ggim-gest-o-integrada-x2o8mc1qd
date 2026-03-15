import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth'
import { User, Upload, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function Profile() {
  const { user, updateAvatar } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatarUrl || null)
  const [isSaving, setIsSaving] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewUrl(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    if (previewUrl) {
      setIsSaving(true)
      // Simulate saving delay
      setTimeout(() => {
        updateAvatar(previewUrl)
        toast.success('Foto de perfil atualizada com sucesso!')
        setIsSaving(false)
      }, 600)
    }
  }

  const hasChanges = previewUrl !== user?.avatarUrl && previewUrl !== null

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas informações de perfil e preferências do sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Foto do Perfil</CardTitle>
          <CardDescription>
            Atualize sua foto de perfil. Esta imagem será exibida em todo o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
          <Avatar className="h-28 w-28 border-4 border-background shadow-sm">
            <AvatarImage src={previewUrl || ''} className="object-cover" />
            <AvatarFallback className="bg-[#b68d40] text-white">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>

          <div className="space-y-4 flex-1">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="flex flex-wrap gap-3">
              <Button
                variant={hasChanges ? 'outline' : 'default'}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Escolher nova imagem
              </Button>
              {hasChanges && (
                <Button onClick={handleSave} disabled={isSaving} className="min-w-[120px]">
                  {isSaving ? (
                    <span className="flex items-center">Salvando...</span>
                  ) : (
                    <span className="flex items-center">
                      <Check className="mr-2 h-4 w-4" /> Salvar foto
                    </span>
                  )}
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Recomendado: Imagem quadrada em formato JPG ou PNG, máximo de 2MB.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Seus dados cadastrais básicos no sistema GGIM.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" defaultValue={user?.name} readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" defaultValue={user?.email} readOnly className="bg-muted/50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Cargo / Função</Label>
            <Input
              id="role"
              defaultValue="Administrador do Sistema"
              readOnly
              className="bg-muted/50"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
