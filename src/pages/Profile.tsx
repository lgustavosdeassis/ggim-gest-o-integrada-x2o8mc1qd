import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth'
import { User, Upload, Check, Pencil, Save, X } from 'lucide-react'
import { toast } from 'sonner'

export default function Profile() {
  const { user, updateAvatar, updateProfile } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatarUrl || null)
  const [isSavingAvatar, setIsSavingAvatar] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Gestor Administrativo',
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSaveAvatar = () => {
    if (previewUrl) {
      setIsSavingAvatar(true)
      setTimeout(() => {
        updateAvatar(previewUrl)
        toast.success('Foto de perfil atualizada com sucesso!')
        setIsSavingAvatar(false)
      }, 600)
    }
  }

  const handleSaveProfile = () => {
    updateProfile({ name: formData.name, email: formData.email, role: formData.role })
    setIsEditing(false)
    toast.success('Informações atualizadas com sucesso!')
  }

  const hasAvatarChanges = previewUrl !== user?.avatarUrl && previewUrl !== null

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas informações de perfil e preferências do sistema.
        </p>
      </div>

      <Card className="shadow-sm border-muted/60">
        <CardHeader>
          <CardTitle>Foto do Perfil</CardTitle>
          <CardDescription>
            Atualize sua foto de perfil. Esta imagem será exibida na barra superior.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
          <Avatar className="h-28 w-28 border-4 border-background shadow-md">
            <AvatarImage src={previewUrl || ''} className="object-cover" />
            <AvatarFallback className="bg-primary/20 text-primary">
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
                variant={hasAvatarChanges ? 'outline' : 'default'}
                onClick={() => fileInputRef.current?.click()}
                className={hasAvatarChanges ? '' : 'font-semibold'}
              >
                <Upload className="mr-2 h-4 w-4" /> Escolher nova imagem
              </Button>
              {hasAvatarChanges && (
                <Button onClick={handleSaveAvatar} disabled={isSavingAvatar} className="font-bold">
                  {isSavingAvatar ? (
                    'Salvando...'
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Salvar foto
                    </>
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

      <Card className="shadow-sm border-muted/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Seus dados cadastrais básicos no sistema GGIM.</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" /> Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={isEditing ? formData.name : user?.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                readOnly={!isEditing}
                className={!isEditing ? 'bg-muted/30 font-medium' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Institucional</Label>
              <Input
                id="email"
                type="email"
                value={isEditing ? formData.email : user?.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                readOnly={!isEditing}
                className={!isEditing ? 'bg-muted/30 font-medium' : ''}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="role">Cargo / Função</Label>
              <Input
                id="role"
                value={isEditing ? formData.role : user?.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                readOnly={!isEditing}
                className={!isEditing ? 'bg-muted/30 font-medium' : ''}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                    role: user?.role || '',
                  })
                }}
              >
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
              <Button onClick={handleSaveProfile} className="font-bold">
                <Save className="h-4 w-4 mr-2" /> Salvar Alterações
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
