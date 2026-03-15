import { useFormContext, useFieldArray } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle2, Trash } from 'lucide-react'
import { calculateHoursDifference } from '@/lib/utils'
import { FormValues } from './schema'

export function DuracaoCard() {
  const { control, watch } = useFormContext<FormValues>()
  const {
    fields: actionsFields,
    append: appendAction,
    remove: removeAction,
  } = useFieldArray({ control, name: 'actions' })

  const wMeetingStart = watch('meetingStart')
  const wMeetingEnd = watch('meetingEnd')
  const wActions = watch('actions') || []
  const wHasAction = watch('hasAction')

  const tMeeting = calculateHoursDifference(wMeetingStart, wMeetingEnd)
  const tAction = wHasAction
    ? wActions.reduce((acc, a) => acc + calculateHoursDifference(a.start, a.end), 0)
    : 0

  return (
    <Card className="border-2 border-[#0f172a]/10 shadow-sm bg-white rounded-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 pt-5 pr-6 hidden sm:block">
        <div className="text-xs font-black bg-[#eab308] text-[#0f172a] px-4 py-2 rounded-xl shadow-sm uppercase tracking-widest border border-[#0f172a]/10">
          Total de Horas: <span className="text-lg ml-1">{(tMeeting + tAction).toFixed(1)}h</span>
        </div>
      </div>
      <div className="bg-slate-50 px-6 py-4 border-b border-[#0f172a]/10 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-[#0f172a]" />
        <h3 className="text-lg font-bold text-[#0f172a]">Logística e Dedicação de Horas</h3>
      </div>
      <CardContent className="p-6 md:p-8">
        <div className="sm:hidden mb-6 text-center text-xs font-black bg-[#eab308] text-[#0f172a] px-4 py-3 rounded-xl shadow-sm uppercase tracking-widest border border-[#0f172a]/10">
          Total Dedicado: <span className="text-base ml-1">{(tMeeting + tAction).toFixed(1)}h</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-2 border-[#0f172a]/10 p-6 rounded-2xl mb-8 bg-slate-50/50 relative">
          <div className="absolute -top-3 left-6 bg-[#0f172a] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
            Reunião Principal ({tMeeting.toFixed(1)}h)
          </div>
          <FormField
            control={control}
            name="meetingStart"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormLabel className="text-[#0f172a] font-bold text-xs uppercase tracking-widest">
                  Início da Reunião
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value || ''}
                    className="bg-white border-[#0f172a]/20 h-12 rounded-xl text-[#0f172a] shadow-sm focus-visible:ring-[#eab308]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="meetingEnd"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormLabel className="text-[#0f172a] font-bold text-xs uppercase tracking-widest">
                  Término da Reunião
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value || ''}
                    className="bg-white border-[#0f172a]/20 h-12 rounded-xl text-[#0f172a] shadow-sm focus-visible:ring-[#eab308]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="hasAction"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-4 space-y-0 rounded-2xl border-2 border-[#0f172a]/10 p-5 bg-slate-50/50 shadow-sm mb-4 cursor-pointer hover:border-[#0f172a]/30 transition-colors">
              <FormControl>
                <Checkbox
                  className="mt-1 h-5 w-5 border-2 rounded text-[#0f172a] border-[#0f172a] bg-white data-[state=checked]:bg-[#eab308] data-[state=checked]:text-[#0f172a] data-[state=checked]:border-[#eab308]"
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    if (checked && actionsFields.length === 0) appendAction({ start: '', end: '' })
                  }}
                />
              </FormControl>
              <div className="space-y-2 leading-none cursor-pointer flex-1">
                <FormLabel className="text-base font-bold text-[#0f172a] cursor-pointer">
                  Esta reunião gerou ou desdobrou em uma Ação Vinculada?
                </FormLabel>
                <p className="text-sm text-[#0f172a]/60 leading-relaxed font-medium">
                  Exemplo: Desdobramentos operacionais, fiscalizações conjuntas ou tempo adicional
                  dedicado pós-reunião.
                </p>
              </div>
            </FormItem>
          )}
        />
        {wHasAction && (
          <div className="border-t-2 border-[#0f172a]/10 pt-8 mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h4 className="font-bold text-base text-[#0f172a]">
                Cronograma das Ações Vinculadas
              </h4>
              <Button
                type="button"
                className="bg-white text-[#0f172a] hover:bg-slate-100 border-2 border-[#0f172a]/20 font-bold rounded-xl h-10 px-4 shadow-sm w-full sm:w-auto"
                onClick={() => appendAction({ start: '', end: '' })}
              >
                + Nova Ação Extra
              </Button>
            </div>
            <div className="space-y-5">
              {actionsFields.map((field, index) => {
                const duration = calculateHoursDifference(
                  watch(`actions.${index}.start`),
                  watch(`actions.${index}.end`),
                )
                return (
                  <div
                    key={field.id}
                    className="p-6 border-2 border-[#0f172a]/10 rounded-2xl bg-slate-50/50 relative group"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 text-red-500 hover:bg-red-500 hover:text-white rounded-xl h-9 w-9 opacity-50 group-hover:opacity-100 transition-all"
                      onClick={() => removeAction(index)}
                      title="Remover Ação"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-3 mb-5 pr-12">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0f172a] text-white font-black text-xs">
                        {index + 1}
                      </span>
                      <span className="text-xs font-black bg-[#eab308]/20 text-[#0f172a] px-3 py-1 rounded-full uppercase tracking-widest border border-[#eab308]/50">
                        Duração: {duration.toFixed(1)}h
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mr-0 md:mr-8">
                      <FormField
                        control={control}
                        name={`actions.${index}.start`}
                        render={({ field: startField }) => (
                          <FormItem>
                            <FormLabel className="text-[#0f172a] font-bold text-xs uppercase tracking-widest">
                              Início da Ação Extra
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                {...startField}
                                value={startField.value || ''}
                                className="bg-white border-[#0f172a]/20 h-11 rounded-xl text-[#0f172a] shadow-sm focus-visible:ring-[#eab308]"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`actions.${index}.end`}
                        render={({ field: endField }) => (
                          <FormItem>
                            <FormLabel className="text-[#0f172a] font-bold text-xs uppercase tracking-widest">
                              Término da Ação Extra
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                {...endField}
                                value={endField.value || ''}
                                className="bg-white border-[#0f172a]/20 h-11 rounded-xl text-[#0f172a] shadow-sm focus-visible:ring-[#eab308]"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )
              })}
              {actionsFields.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed border-[#0f172a]/20 rounded-2xl text-[#0f172a]/60 font-medium text-sm bg-slate-50/50">
                  Nenhuma ação temporal informada. Clique no botão acima para computar horas extras.
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
