import { useFormContext } from 'react-hook-form'
import { useAuthStore } from '@/stores/auth'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { parseSemicolonList } from '@/lib/utils'
import { FormValues } from './schema'

export function EngajamentoCard() {
  const { control } = useFormContext<FormValues>()
  const isViewer = useAuthStore((state) => state.user?.role === 'viewer')

  return (
    <Card className="border-2 border-[#0f172a]/10 shadow-sm bg-white rounded-2xl overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-[#0f172a]/10 flex items-center gap-3">
        <Users className="h-5 w-5 text-[#0f172a]" />
        <h3 className="text-lg font-bold text-[#0f172a]">Engajamento / Presenças</h3>
      </div>
      <CardContent className="p-6 md:p-8 space-y-8">
        <FormField
          control={control}
          name="participantsPF"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-1">
                <FormLabel className="text-[#0f172a] font-bold text-xs uppercase tracking-widest">
                  Pessoas Físicas (separadas por ponto e vírgula)
                </FormLabel>
                <span className="text-[10px] font-black bg-[#eab308]/20 text-[#0f172a] px-3 py-1 rounded-full uppercase tracking-widest border border-[#eab308]/50 w-fit">
                  Total Pessoas: {parseSemicolonList(field.value || '').length}
                </span>
              </div>
              <FormControl>
                <Textarea
                  className="min-h-[120px] resize-y bg-white border-[#0f172a]/20 shadow-sm rounded-xl text-[#0f172a] p-4 placeholder:text-[#0f172a]/40 text-base focus-visible:ring-[#eab308]"
                  placeholder="Ex: João Silva; Maria Oliveira"
                  {...field}
                  value={field.value || ''}
                  disabled={isViewer}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="participantsPJ"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-1">
                <FormLabel className="text-[#0f172a] font-bold text-xs uppercase tracking-widest">
                  Instituições PJ (separadas por ponto e vírgula)
                </FormLabel>
                <span className="text-[10px] font-black bg-[#0f172a]/10 text-[#0f172a] px-3 py-1 rounded-full uppercase tracking-widest border border-[#0f172a]/20 w-fit">
                  Total Instituições: {parseSemicolonList(field.value || '').length}
                </span>
              </div>
              <FormControl>
                <Textarea
                  className="min-h-[100px] resize-y bg-white border-[#0f172a]/20 shadow-sm rounded-xl text-[#0f172a] p-4 placeholder:text-[#0f172a]/40 text-base focus-visible:ring-[#eab308]"
                  placeholder="Ex: Prefeitura Municipal; Polícia Federal; Bombeiros"
                  {...field}
                  value={field.value || ''}
                  disabled={isViewer}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
