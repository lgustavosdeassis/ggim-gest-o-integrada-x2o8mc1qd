import { useState, useRef } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { useAuthStore } from '@/stores/auth'
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
import { FileText, FileUp, Trash, Eye, Download } from 'lucide-react'
import { parseSemicolonList, cn, openDocumentViewer, downloadDocument } from '@/lib/utils'
import { DOC_TYPES, FormValues } from './schema'

export function ProdutividadeCard() {
  const { control, watch } = useFormContext<FormValues>()
  const isViewer = useAuthStore((state) => state.user?.role === 'viewer')
  const {
    fields: docsFields,
    append: appendDoc,
    remove: removeDoc,
  } = useFieldArray({ control, name: 'documents' })

  const watchedDocs = watch('documents') || []

  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        appendDoc({ name: file.name, type: '', url: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

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
                  REGISTRO DE DELIBERAÇÕES (SEPARADAS POR PONTO E VÍRGULA)
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
                  disabled={isViewer}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="border-t-2 border-[#0f172a]/10 pt-8 space-y-6">
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h4 className="font-bold text-lg text-[#0f172a]">Gestão de Anexos</h4>
                <p className="text-sm text-[#0f172a]/60 mt-1 max-w-lg leading-relaxed font-medium">
                  {isViewer
                    ? 'Visualize ou baixe os documentos atrelados a este evento.'
                    : 'Arraste seus arquivos ou clique para selecionar. Obrigatório classificar o Tipo de Documento.'}
                </p>
              </div>
              <div className="text-sm font-black bg-[#eab308]/20 text-[#0f172a] px-5 py-2.5 rounded-xl border border-[#eab308]/50 whitespace-nowrap text-center shadow-sm">
                DOCUMENTOS TOTAIS: {docsFields.length}
              </div>
            </div>

            {!isViewer && (
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={cn(
                  'relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed gap-4 transition-all duration-300 overflow-hidden mb-6',
                  isDragging
                    ? 'border-[#eab308] bg-[#eab308]/10 scale-[1.02] shadow-inner'
                    : 'border-[#0f172a]/20 bg-slate-50/50 hover:border-[#0f172a]/40',
                )}
              >
                {isDragging && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none rounded-2xl">
                    <span className="bg-[#0f172a] text-white font-black px-6 py-3 rounded-xl shadow-xl animate-in zoom-in duration-200">
                      Solte para anexar arquivo
                    </span>
                  </div>
                )}

                <div
                  className={cn(
                    'p-4 rounded-full shadow-sm border transition-colors duration-300 relative z-0',
                    isDragging ? 'bg-[#eab308] border-[#eab308]' : 'bg-white border-[#0f172a]/10',
                  )}
                >
                  <FileUp className="w-8 h-8 text-[#0f172a]" />
                </div>
                <div className="text-center space-y-1 relative z-0 pointer-events-none">
                  <h4 className="font-black text-lg text-[#0f172a]">
                    Arraste e solte seus arquivos aqui
                  </h4>
                  <p className="text-sm text-[#0f172a]/60 font-medium">
                    ou utilize o botão abaixo para navegar no seu dispositivo
                  </p>
                </div>
                <div className="mt-2 relative z-20">
                  <Input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.png,.jpeg,.mp3,.wav"
                    onChange={(e) => {
                      if (e.target.files) handleFiles(Array.from(e.target.files))
                      e.target.value = ''
                    }}
                  />
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-xl text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-[#eab308] bg-[#0f172a] text-white hover:bg-[#1e293b] h-12 px-8 shadow-md"
                  >
                    Procurar Arquivos
                  </Label>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {docsFields.map((field, index) => (
              <div
                key={field.id}
                className="p-5 border-2 border-[#0f172a]/10 rounded-2xl bg-slate-50/50 shadow-sm relative grid grid-cols-1 lg:grid-cols-[1fr_200px_auto] gap-5 items-start group hover:border-[#0f172a]/30 transition-colors"
              >
                <FormField
                  control={control}
                  name={`documents.${index}.name`}
                  render={({ field: nameField }) => (
                    <FormItem className="flex-1 mt-1">
                      <FormLabel className="text-[10px] font-black text-[#0f172a]/60 uppercase tracking-widest">
                        ARQUIVO
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
                        CATEGORIA OBRIGATÓRIA *
                      </FormLabel>
                      <Select
                        onValueChange={typeField.onChange}
                        value={typeField.value || undefined}
                        disabled={isViewer}
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
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 lg:mt-7 shrink-0 w-full lg:w-auto justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 px-3 rounded-xl bg-white hover:bg-slate-100 border-[#0f172a]/20 text-[#0f172a] shadow-sm transition-all flex items-center gap-1.5"
                    onClick={() => openDocumentViewer(watchedDocs[index])}
                    title="Visualizar anexo em nova guia"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-xs font-bold">Visualizar</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 px-3 rounded-xl bg-white hover:bg-slate-100 border-[#0f172a]/20 text-[#0f172a] shadow-sm transition-all flex items-center gap-1.5"
                    onClick={() => downloadDocument(watchedDocs[index])}
                    title="Baixar arquivo original"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-xs font-bold">Baixar</span>
                  </Button>
                  {!isViewer && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-500 hover:bg-red-500 hover:text-white rounded-xl h-11 w-11 p-0 border border-transparent transition-all opacity-70 group-hover:opacity-100 shrink-0 ml-1"
                      onClick={() => removeDoc(index)}
                      title="Remover anexo do registro"
                    >
                      <Trash className="w-5 h-5" />
                    </Button>
                  )}
                </div>
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
