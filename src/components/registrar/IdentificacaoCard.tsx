import { useFormContext } from 'react-hook-form'
import { useAuthStore } from '@/stores/auth'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ListPlus } from 'lucide-react'
import { INSTANCIAS, FormValues } from './schema'

const NOVOS_EVENTOS_TIPO = [
  'Apresentação',
  'Audiência',
  'Blitz',
  'Campanha',
  'Capacitação',
  'Colóquio',
  'Conferência',
  'Confraternização',
  'Congresso',
  'Convenção',
  'Curso',
  'Exposição',
  'Feira',
  'Fórum',
  'Mesa Redonda',
  'Networking',
  'Oficina',
  'Operação',
  'Painel',
  'Palestra',
  'Programa',
  'Projeto',
  'Reunião Extraordinária',
  'Reunião Ordinária',
  'Roadshow',
  'Seminário',
  'Treinamento',
  'Visita Técnica',
  'Webinário',
  'Workshop',
  'Outros',
]

export function IdentificacaoCard() {
  const { control } = useFormContext<FormValues>()
  const isViewer = useAuthStore((state) => state.user?.role === 'viewer')

  return (
    <Card className="border-2 border-[#0f172a]/10 shadow-sm bg-white rounded-2xl overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-[#0f172a]/10 flex items-center gap-3">
        <ListPlus className="h-5 w-5 text-[#0f172a]" />
        <h3 className="text-lg font-bold text-[#0f172a]">Identificação do Evento</h3>
      </div>
      <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <FormField
            control={control}
            name="eventName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#0f172a] font-bold uppercase tracking-widest text-xs block">
                  IDENTIFICAÇÃO DO EVENTO (OPCIONAL)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Nome do Seminário / Quarto Drone Policial"
                    {...field}
                    value={field.value || ''}
                    disabled={isViewer}
                    className="bg-white border-[#0f172a]/20 h-12 rounded-xl text-[#0f172a] placeholder:text-[#0f172a]/40 focus-visible:ring-[#eab308]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="instance"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#0f172a] font-bold uppercase tracking-widest text-xs block">
                INSTÂNCIA
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''} disabled={isViewer}>
                <FormControl>
                  <SelectTrigger className="bg-white border-[#0f172a]/20 h-12 rounded-xl text-[#0f172a] focus:ring-[#eab308]">
                    <SelectValue placeholder="Selecione a instância" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border-[#0f172a]/10 text-[#0f172a] rounded-xl shadow-lg">
                  {INSTANCIAS.map((i) => (
                    <SelectItem
                      key={i}
                      value={i}
                      className="focus:bg-[#eab308]/20 focus:text-[#0f172a] cursor-pointer py-2.5 font-medium"
                    >
                      {i}
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
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#0f172a] font-bold uppercase tracking-widest text-xs block">
                TIPO DO EVENTO
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''} disabled={isViewer}>
                <FormControl>
                  <SelectTrigger className="bg-white border-[#0f172a]/20 h-12 rounded-xl text-[#0f172a] focus:ring-[#eab308]">
                    <SelectValue placeholder="Selecione a tipologia" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border-[#0f172a]/10 text-[#0f172a] rounded-xl shadow-lg">
                  {NOVOS_EVENTOS_TIPO.map((i) => (
                    <SelectItem
                      key={i}
                      value={i}
                      className="focus:bg-[#eab308]/20 focus:text-[#0f172a] cursor-pointer py-2.5 font-medium"
                    >
                      {i}
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
          name="modality"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#0f172a] font-bold uppercase tracking-widest text-xs block">
                MODALIDADE
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''} disabled={isViewer}>
                <FormControl>
                  <SelectTrigger className="bg-white border-[#0f172a]/20 h-12 rounded-xl text-[#0f172a] focus:ring-[#eab308]">
                    <SelectValue placeholder="Como ocorreu?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border-[#0f172a]/10 text-[#0f172a] rounded-xl shadow-lg">
                  <SelectItem
                    value="Presencial"
                    className="py-2.5 font-medium focus:bg-[#eab308]/20 focus:text-[#0f172a]"
                  >
                    Presencial
                  </SelectItem>
                  <SelectItem
                    value="Remota"
                    className="py-2.5 font-medium focus:bg-[#eab308]/20 focus:text-[#0f172a]"
                  >
                    Remota
                  </SelectItem>
                  <SelectItem
                    value="Híbrida"
                    className="py-2.5 font-medium focus:bg-[#eab308]/20 focus:text-[#0f172a]"
                  >
                    Híbrida
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#0f172a] font-bold uppercase tracking-widest text-xs block">
                LOCAL
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Paço Municipal / Zoom"
                  {...field}
                  value={field.value || ''}
                  disabled={isViewer}
                  className="bg-white border-[#0f172a]/20 h-12 rounded-xl text-[#0f172a] placeholder:text-[#0f172a]/40 focus-visible:ring-[#eab308]"
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
