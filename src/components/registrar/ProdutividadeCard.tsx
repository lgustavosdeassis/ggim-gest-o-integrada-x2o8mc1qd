import { useFormContext, useFieldArray } from 'react-hook-form'
import { useAuthStore } from '@/stores/auth'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Plus,
  Trash,
  UploadCloud,
  MoreVertical,
  Eye,
  Download,
  Printer,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { FormValues, DOC_TYPES } from './schema'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRef, useState } from 'react'
import { cn, openDocumentViewer, downloadDocument, printDocument } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ProdutividadeCard() {
  const { control } = useFormContext<FormValues>()
  const isViewer = useAuthStore((state) => state.user?.role === 'viewer')
  const [isDragging, setIsDragging] = useState(false)

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'documents',
  })

  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    processFiles(files)
    if (fileRef.current) fileRef.current.value = ''
  }

  const processFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext === 'url' || ext === 'webloc') {
        const reader = new FileReader()
        reader.onload = (event) => {
          const text = event.target?.result as string
          let urlStr = ''
          if (ext === 'url') {
            const match = text.match(/URL=(.+)/i)
            if (match && match[1]) urlStr = match[1].trim()
          } else if (ext === 'webloc') {
            const match = text.match(/<string>(.*?)<\/string>/i)
            if (match && match[1]) urlStr = match[1].trim()
          }

          append({
            name: file.name.replace(/\.(url|webloc)$/i, ''),
            type: 'Link',
            url: urlStr || text,
          })
        }
        reader.readAsText(file)
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        append({
          name: file.name,
          type: '',
          url: event.target?.result as string,
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!isViewer) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (isViewer) return
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  return (
    <Card className="border-2 border-[#0f172a]/10 shadow-sm bg-white rounded-2xl overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-[#0f172a]/10 flex items-center gap-3">
        <FileText className="h-5 w-5 text-[#0f172a]" />
        <h3 className="text-lg font-bold text-[#0f172a]">Produtividade e Acervo (Anexos)</h3>
      </div>
      <CardContent className="p-6 md:p-8 space-y-8">
        <FormField
          control={control}
          name="deliberations"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#0f172a] font-bold text-xs uppercase tracking-widest">
                Deliberações Firmadas (separadas por ponto e vírgula)
              </FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[100px] resize-y bg-white border-[#0f172a]/20 shadow-sm rounded-xl text-[#0f172a] p-4 placeholder:text-[#0f172a]/40 text-base focus-visible:ring-[#eab308]"
                  placeholder="Ex: Aprovação do orçamento; Agendamento da próxima pauta"
                  {...field}
                  value={field.value || ''}
                  disabled={isViewer}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h4 className="text-[#0f172a] font-bold text-xs uppercase tracking-widest">
                Gestão de Anexos e Links
              </h4>
              <p className="text-sm text-muted-foreground">
                Insira arquivos ou links que comprovem a realização do evento.
              </p>
            </div>
          </div>

          {!isViewer && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300',
                isDragging
                  ? 'border-[#eab308] bg-[#eab308]/10'
                  : 'border-[#0f172a]/20 hover:border-[#0f172a]/40 bg-slate-50/50',
              )}
            >
              <UploadCloud
                className={cn(
                  'w-10 h-10 mb-4 transition-colors',
                  isDragging ? 'text-[#eab308]' : 'text-[#0f172a]/40',
                )}
              />
              <h4 className="text-sm font-bold text-[#0f172a]">Arraste arquivos e solte aqui</h4>
              <p className="text-xs text-muted-foreground mt-1 mb-5 text-center max-w-sm">
                ou utilize o botão abaixo para selecionar do dispositivo ou adicionar um link web
              </p>
              <input
                type="file"
                ref={fileRef}
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.mp3,.mp4,.html,text/html,.url,.webloc"
                onChange={handleFileUpload}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl font-bold border-[#eab308] text-[#eab308] hover:bg-[#eab308]/10 bg-white"
                  >
                    Adicionar Anexo ou Link <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56 rounded-xl border-[#0f172a]/10">
                  <DropdownMenuItem
                    onClick={() => fileRef.current?.click()}
                    className="cursor-pointer font-medium py-2.5"
                  >
                    <UploadCloud className="w-4 h-4 mr-2 text-muted-foreground" />
                    Do Dispositivo (Arquivo)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => append({ name: '', type: 'Link', url: '' })}
                    className="cursor-pointer font-medium py-2.5"
                  >
                    <Plus className="w-4 h-4 mr-2 text-muted-foreground" />
                    Inserir Link Manualmente
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {fields.length > 0 && (
            <div className="space-y-4">
              {fields.map((fieldItem, index) => (
                <div
                  key={fieldItem.id}
                  className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-[#0f172a]/10"
                >
                  <FormField
                    control={control}
                    name={`documents.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-[10px] font-bold text-[#0f172a] uppercase tracking-widest">
                          Nome do Arquivo
                        </FormLabel>
                        <FormControl>
                          <Input className="h-11 bg-white" disabled={isViewer} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`documents.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="w-full sm:w-48">
                        <FormLabel className="text-[10px] font-bold text-[#0f172a] uppercase tracking-widest">
                          Categoria
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isViewer}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-white">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DOC_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`documents.${index}.url`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-[10px] font-bold text-[#0f172a] uppercase tracking-widest">
                          Conteúdo / URL
                        </FormLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input
                              className={cn(
                                'h-11 bg-white font-mono text-xs',
                                field.value &&
                                  (field.value.startsWith('http://') ||
                                    field.value.startsWith('https://')) &&
                                  'pr-12',
                              )}
                              placeholder="https:// ou base64 gerado"
                              disabled={isViewer}
                              {...field}
                              value={field.value || ''}
                            />
                            {field.value &&
                              (field.value.startsWith('http://') ||
                                field.value.startsWith('https://')) && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 h-9 w-9 text-muted-foreground hover:text-primary"
                                  onClick={() => window.open(field.value, '_blank')}
                                  title="Abrir Link Externo"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="mt-auto mb-0.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="rounded-xl h-11 w-11 shrink-0 bg-white border-[#0f172a]/20 hover:bg-slate-100"
                        >
                          <MoreVertical className="h-5 w-5 text-[#0f172a]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-xl p-2 shadow-xl border-[#0f172a]/10"
                      >
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-2 rounded-lg"
                          onClick={(e) => {
                            e.preventDefault()
                            openDocumentViewer(fieldItem as any)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2 text-muted-foreground" /> Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-2 rounded-lg"
                          onClick={(e) => {
                            e.preventDefault()
                            downloadDocument(fieldItem as any)
                          }}
                        >
                          <Download className="w-4 h-4 mr-2 text-muted-foreground" /> Baixar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-2 rounded-lg"
                          onClick={(e) => {
                            e.preventDefault()
                            printDocument(fieldItem as any)
                          }}
                        >
                          <Printer className="w-4 h-4 mr-2 text-muted-foreground" /> Imprimir
                        </DropdownMenuItem>
                        {!isViewer && (
                          <>
                            <div className="h-px bg-border my-1 mx-1" />
                            <DropdownMenuItem
                              className="cursor-pointer font-bold py-2 rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => remove(index)}
                            >
                              <Trash className="w-4 h-4 mr-2" /> Excluir Item
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
