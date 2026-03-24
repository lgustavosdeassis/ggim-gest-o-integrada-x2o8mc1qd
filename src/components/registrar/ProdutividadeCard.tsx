import { useFormContext, useFieldArray } from 'react-hook-form'
import { useAuthStore } from '@/stores/auth'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Trash, UploadCloud } from 'lucide-react'
import { FormValues, DOC_TYPES } from './schema'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRef } from 'react'

export function ProdutividadeCard() {
  const { control } = useFormContext<FormValues>()
  const isViewer = useAuthStore((state) => state.user?.role === 'viewer')

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'documents',
  })

  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
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

    if (fileRef.current) fileRef.current.value = ''
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

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h4 className="text-[#0f172a] font-bold text-xs uppercase tracking-widest">
                Gestão de Anexos
              </h4>
              <p className="text-sm text-muted-foreground">
                Insira arquivos que comprovem a realização do evento.
              </p>
            </div>
            {!isViewer && (
              <>
                <input
                  type="file"
                  ref={fileRef}
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.mp3,.mp4,.html,text/html"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  className="h-11 rounded-xl font-bold border-[#eab308] text-[#eab308] hover:bg-[#eab308]/10"
                >
                  <UploadCloud className="h-4 w-4 mr-2" /> Upload de Arquivo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: '', type: '', url: '' })}
                  className="h-11 rounded-xl font-bold border-[#0f172a]/20 text-[#0f172a] hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Link Web
                </Button>
              </>
            )}
          </div>

          {fields.length > 0 && (
            <div className="space-y-4 mt-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-[#0f172a]/10"
                >
                  <FormField
                    control={control}
                    name={`documents.${index}.name`}
                    render={({ field: nameField }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-[10px] font-bold text-[#0f172a] uppercase tracking-widest">
                          Nome do Arquivo / Link
                        </FormLabel>
                        <FormControl>
                          <Input className="h-11 bg-white" disabled={isViewer} {...nameField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`documents.${index}.type`}
                    render={({ field: typeField }) => (
                      <FormItem className="w-full sm:w-48">
                        <FormLabel className="text-[10px] font-bold text-[#0f172a] uppercase tracking-widest">
                          Categoria
                        </FormLabel>
                        <Select
                          onValueChange={typeField.onChange}
                          value={typeField.value}
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
                    render={({ field: urlField }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-[10px] font-bold text-[#0f172a] uppercase tracking-widest">
                          Conteúdo (URL ou Base64)
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-11 bg-white"
                            placeholder="https://"
                            disabled={isViewer}
                            {...urlField}
                            value={urlField.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!isViewer && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                      className="mb-0.5 rounded-xl h-11 w-11 shrink-0 mt-auto"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
