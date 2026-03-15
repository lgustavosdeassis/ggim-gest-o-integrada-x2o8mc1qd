import { useFormContext, useFieldArray } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, FileUp, Trash } from 'lucide-react'
import { parseSemicolonList } from '@/lib/utils'
import { DOC_TYPES, FormValues } from './schema'

export function ProdutividadeCard() {
  const { control } = useFormContext<FormValues>()
  const {
    fields: docsFields,
    append: appendDoc,
    remove: removeDoc,
  } = useFieldArray({ control, name: 'documents' })

  return (
    <Card className="border-2 border-[#0f172a]/10 shadow-sm bg-white rounded-2xl overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-[#0f172a]/10 flex items-center gap-3">
        <FileText className="h-5 w-5 text-[#0f172a]" />
        <h3 className="text-lg font-bold text-[#0f172a]">Produtividade e Documentação</h3>
      </div>
      <CardContent className="p-6 md:p-8 space-y-8">
        <FormField
          control={control}
          name="deliberations"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-1">
                <FormLabel className="text-[#0f172a] font-bold text-xs uppercase tracking-widest">
                  Registro de Deliberações (separadas por ponto e vírgula)
                </FormLabel>
                <span className="text-[10px] font-black bg-[#eab308]/20 text-[#0f172a] px-3 py-1 rounded-full uppercase tracking-widest border border-[#eab308]/50 w-fit">
                  Total Deliberações: {parseSemicolonList(field.value || '').length}
                </span>
              </div>
              <FormControl>
                <Textarea
                  className="min-h-[120px] resize-y bg-white border-[#0f172a]/20 shadow-sm rounded-xl text-[#0f172a] p-4 placeholder:text-[#0f172a]/40 text-base leading-relaxed focus-visible:ring-[#eab308]"
                  placeholder="Ex: Aprovada diretriz de ação x; Pauta de segurança discutida;"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="border-t-2 border-[#0f172a]/10 pt-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 p-6 rounded-2xl border-2 border-dashed border-[#0f172a]/20 gap-6">
            <div>
              <h4 className="font-bold text-lg text-[#0f172a]">Gestão de Anexos</h4>
              <p className="text-sm text-[#0f172a]/60 mt-2 max-w-lg leading-relaxed font-medium">
                Obrigatório classificar o{' '}
                <span className="text-[#0f172a] font-bold">Tipo de Documento</span> para cada
                arquivo, o que alimenta diretamente o Dashboard.
              </p>
            </div>
            <div className="flex flex-col items-end gap-4 w-full md:w-auto">
              <div className="text-sm font-black bg-[#eab308]/20 text-[#0f172a] px-5 py-2.5 rounded-xl border border-[#eab308]/50 whitespace-nowrap w-full md:w-auto text-center">
                DOCUMENTOS TOTAIS: {docsFields.length}
              </div>
              <Input
                type="file"
                className="hidden"
                id="file-upload"
                multiple
                accept=".pdf,.docx,.txt,.jpg,.png,.jpeg,.mp3,.wav"
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  files.forEach((file) => appendDoc({ name: file.name, type: '' }))
                  e.target.value = ''
                }}
              />
              <Label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex w-full md:w-auto items-center justify-center gap-3 whitespace-nowrap rounded-xl text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-[#eab308] bg-white text-[#0f172a] border-2 border-[#0f172a]/20 hover:bg-slate-100 h-12 px-6 shadow-md"
              >
                <FileUp className="w-5 h-5" /> Inserir Arquivos
              </Label>
            </div>
          </div>
          <div className="space-y-4">
            {docsFields.map((field, index) => (
              <div
                key={field.id}
                className="p-5 border-2 border-[#0f172a]/10 rounded-2xl bg-slate-50/50 shadow-sm relative grid grid-cols-1 lg:grid-cols-[1fr_240px_auto] gap-5 items-start group hover:border-[#0f172a]/30 transition-colors"
              >
                <FormField
                  control={control}
                  name={`documents.${index}.name`}
                  render={({ field: nameField }) => (
                    <FormItem className="flex-1 mt-1">
                      <FormLabel className="text-[10px] font-black text-[#0f172a]/60 uppercase tracking-widest">
                        Arquivo Recebido
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...nameField}
                          value={nameField.value || ''}
                          readOnly
                          className="bg-transparent border-0 border-b-2 border-[#0f172a]/20 rounded-none px-1 h-10 font-bold text-[#0f172a] focus-visible:ring-0 focus-visible:border-[#eab308] truncate"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`documents.${index}.type`}
                  render={({ field: typeField }) => (
                    <FormItem className="mt-1">
                      <FormLabel className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest">
                        Categoria Obrigatória *
                      </FormLabel>
                      <Select
                        onValueChange={typeField.onChange}
                        value={typeField.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white border-[#0f172a]/20 shadow-sm focus:ring-[#eab308] h-11 rounded-xl font-bold text-[#0f172a]">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-[#0f172a]/10 text-[#0f172a] rounded-xl shadow-lg">
                          {DOC_TYPES.map((t) => (
                            <SelectItem
                              key={t}
                              value={t}
                              className="font-bold cursor-pointer py-2 focus:bg-[#eab308]/20 focus:text-[#0f172a]"
                            >
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="lg:mt-7 text-red-500 hover:bg-red-500 hover:text-white rounded-xl h-11 w-11 p-0 shrink-0 border border-transparent transition-all opacity-70 group-hover:opacity-100"
                  onClick={() => removeDoc(index)}
                  title="Remover anexo"
                >
                  <Trash className="w-5 h-5" />
                </Button>
              </div>
            ))}
            {docsFields.length === 0 && (
              <div className="text-center p-8 border-2 border-dashed border-[#0f172a]/20 rounded-2xl text-[#0f172a]/60 font-medium text-sm bg-slate-50/50">
                Lista de documentos vazia.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
