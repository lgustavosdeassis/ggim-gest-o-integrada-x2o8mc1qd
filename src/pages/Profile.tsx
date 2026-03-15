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
    <div className="max-w-4xl mx-auto space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">
          Configurações da Conta
        </h1>
        <p className="text-muted-foreground text-base">
          Gerencie seus dados de acesso e a personalização do seu perfil.
        </p>
      </div>

      <Card className="shadow-2xl border-border/20 bg-card rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/10 pb-6">
          <CardTitle className="text-xl font-bold text-white">Fotografia de Perfil</CardTitle>
          <CardDescription className="text-sm font-medium">
            Personalize a imagem que aparece no canto superior do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 flex flex-col sm:flex-row gap-8 items-start sm:items-center">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar className="h-32 w-32 border-4 border-background shadow-2xl transition-all duration-300 group-hover:opacity-80">
              <AvatarImage src={previewUrl || ''} className="object-cover" />
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-3xl">
                {user?.name?.charAt(0) || <User className="h-12 w-12" />}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="space-y-5 flex-1">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="flex flex-wrap gap-4">
              <Button
                variant={hasAvatarChanges ? 'outline' : 'secondary'}
                onClick={() => fileInputRef.current?.click()}
                className={`h-12 px-6 rounded-xl font-bold transition-all ${
                  hasAvatarChanges
                    ? 'border-border/40 text-white hover:bg-muted/50'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                <Upload className="mr-2 h-4 w-4" /> Alterar Fotografia
              </Button>
              {hasAvatarChanges && (
                <Button
                  onClick={handleSaveAvatar}
                  disabled={isSavingAvatar}
                  className="h-12 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all"
                >
                  {isSavingAvatar ? (
                    'Salvando...'
                  ) : (
                    <>
                      <Check className="mr-2 h-5 w-5" /> Confirmar Nova Foto
                    </>
                  )}
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Utilize imagens JPG ou PNG de até 2MB. Dimensões quadradas (1:1) são recomendadas.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-2xl border-border/20 bg-card rounded-2xl overflow-hidden relative">
        <CardHeader className="bg-muted/10 border-b border-border/10 pb-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white">Dados Profissionais</CardTitle>
            <CardDescription className="text-sm font-medium">
              Informações de identificação institucional.
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="h-11 px-5 rounded-xl border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground font-bold transition-all"
            >
              <Pencil className="h-4 w-4 mr-2" /> Editar Dados
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2.5">
              <Label
                htmlFor="name"
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
              >
                Nome Completo
              </Label>
              <Input
                id="name"
                value={isEditing ? formData.name : user?.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                readOnly={!isEditing}
                className={`h-12 rounded-xl text-white transition-all ${
                  !isEditing
                    ? 'bg-muted/20 border-transparent font-medium shadow-inner'
                    : 'bg-background border-primary/50 focus-visible:ring-primary shadow-sm'
                }`}
              />
            </div>
            <div className="space-y-2.5">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
              >
                E-mail de Acesso
              </Label>
              <Input
                id="email"
                type="email"
                value={isEditing ? formData.email : user?.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                readOnly={!isEditing}
                className={`h-12 rounded-xl text-white transition-all ${
                  !isEditing
                    ? 'bg-muted/20 border-transparent font-medium shadow-inner'
                    : 'bg-background border-primary/50 focus-visible:ring-primary shadow-sm'
                }`}
              />
            </div>
            <div className="space-y-2.5 md:col-span-2">
              <Label
                htmlFor="role"
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
              >
                Atribuição / Cargo
              </Label>
              <Input
                id="role"
                value={isEditing ? formData.role : user?.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                readOnly={!isEditing}
                className={`h-12 rounded-xl text-white transition-all ${
                  !isEditing
                    ? 'bg-muted/20 border-transparent font-medium shadow-inner'
                    : 'bg-background border-primary/50 focus-visible:ring-primary shadow-sm'
                }`}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-border/20">
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
                className="h-12 px-6 rounded-xl font-bold text-muted-foreground hover:text-white hover:bg-muted/50"
              >
                <X className="h-5 w-5 mr-2" /> Cancelar
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="h-12 px-8 rounded-xl font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all"
              >
                <Save className="h-5 w-5 mr-2" /> Efetivar Alterações
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
