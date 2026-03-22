import { useFormContext, useFieldArray } from 'react-hook-form'
import { useAuthStore } from '@/stores/auth'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle2, Trash } from 'lucide-react'
import { calculateHoursDifference, formatHoursToHHMM } from '@/lib/utils'
import { FormValues } from './schema'

function ActionItem({
  actionIndex,
  isViewer,
  removeAction,
}: {
  actionIndex: number
  isViewer: boolean
  removeAction: (index: number) => void
}) {
  const { control, watch } = useFormContext<FormValues>()
  const {
    fields: periodFields,
    append: appendPeriod,
    remove: removePeriod,
  } = useFieldArray({ control, name: `actions.${actionIndex}.periods` })

  const periods = watch(`actions.${actionIndex}.periods`) || []
  const actionTotal = periods.reduce((acc, p) => acc + calculateHoursDifference(p.start, p.end), 0)

  return (
    <div className="p-6 border-2 border-[#0f172a]/10 rounded-2xl bg-slate-50/50 relative group">
      {!isViewer && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 text-red-500 hover:bg-red-500 hover:text-white rounded-xl h-9 w-9 opacity-50 group-hover:opacity-100 transition-all z-10"
          onClick={() => removeAction(actionIndex)}
          title="Remover Ação"
        >
          <Trash className="w-4 h-4" />
        </Button>
      )}
      <div className="flex items-center gap-3 mb-5 pr-12">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0f172a] text-white font-black text-xs">
          {actionIndex + 1}
        </span>
        <span className="text-xs font-black bg-[#eab308]/20 text-[#0f172a] px-3 py-1 rounded-full uppercase tracking-widest border border-[#eab308]/50">
          Duração: {formatHoursToHHMM(actionTotal)}
        </span>
      </div>
      <div className="space-y-4">
        {periodFields.map((field, periodIndex) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-5 items-start relative"
          >
            <FormField
              control={control}
              name={`actions.${actionIndex}.periods.${periodIndex}.start`}
              render={({ field: startField }) => (
                <FormItem>
                  <FormLabel className="text-[#0f172a] font-bold text-sm block">
                    Início {periodFields.length > 1 ? `(Dia ${periodIndex + 1})` : 'da Ação Extra'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...startField}
                      value={startField.value || ''}
                      disabled={isViewer}
                      className="bg-white border-[#0f172a]/20 h-11 rounded-xl text-[#0f172a] shadow-sm focus-visible:ring-[#eab308]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`actions.${actionIndex}.periods.${periodIndex}.end`}
              render={({ field: endField }) => (
                <FormItem>
                  <FormLabel className="text-[#0f172a] font-bold text-sm block">
                    Término {periodFields.length > 1 ? `(Dia ${periodIndex + 1})` : 'da Ação Extra'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...endField}
                      value={endField.value || ''}
                      disabled={isViewer}
                      className="bg-white border-[#0f172a]/20 h-11 rounded-xl text-[#0f172a] shadow-sm focus-visible:ring-[#eab308]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {!isViewer && periodFields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                className="mt-7 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl h-11 px-3 hidden md:flex"
                onClick={() => removePeriod(periodIndex)}
                title="Remover Dia"
              >
                <Trash className="w-4 h-4" />
              </Button>
            )}
            {!isViewer && periodFields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl h-11 md:hidden -mt-2 mb-2 border border-red-100"
                onClick={() => removePeriod(periodIndex)}
              >
                <Trash className="w-4 h-4 mr-2" /> Remover Dia
              </Button>
            )}
          </div>
        ))}
        {!isViewer && (
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto h-10 border-dashed border-2 border-[#0f172a]/20 text-[#0f172a]/60 hover:text-[#0f172a] hover:border-[#0f172a]/40 bg-transparent rounded-xl text-sm font-bold mt-2"
            onClick={() => appendPeriod({ start: '', end: '' })}
          >
            + Adicionar Outro Dia a esta Ação
          </Button>
        )}
      </div>
    </div>
  )
}

export function DuracaoCard() {
  const { control, watch } = useFormContext<FormValues>()
  const isViewer = useAuthStore((state) => state.user?.role === 'viewer')

  const {
    fields: additionalDaysFields,
    append: appendAdditionalDay,
    remove: removeAdditionalDay,
  } = useFieldArray({ control, name: 'additionalDays' })

  const {
    fields: actionsFields,
    append: appendAction,
    remove: removeAction,
  } = useFieldArray({ control, name: 'actions' })

  const wMeetingStart = watch('meetingStart')
  const wMeetingEnd = watch('meetingEnd')
  const wHasAdditionalDays = watch('hasAdditionalDays')
  const wAdditionalDays = watch('additionalDays') || []
  const wHasAction = watch('hasAction')
  const wActions = watch('actions') || []

  const tMeeting = calculateHoursDifference(wMeetingStart, wMeetingEnd)
  const tAdditional = wHasAdditionalDays
    ? wAdditionalDays.reduce((acc, d) => acc + calculateHoursDifference(d.start, d.end), 0)
    : 0
  const tAction = wHasAction
    ? wActions.reduce(
        (acc, a) =>
          acc +
          (a.periods || []).reduce((pAcc, p) => pAcc + calculateHoursDifference(p.start, p.end), 0),
        0,
      )
    : 0

  const totalHours = tMeeting + tAdditional + tAction

  return (
    <Card className="border-2 border-[#0f172a]/10 shadow-sm bg-white rounded-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 pt-5 pr-6 hidden sm:block">
        <div className="text-xs font-black bg-[#eab308] text-[#0f172a] px-4 py-2 rounded-xl shadow-sm uppercase tracking-widest border border-[#0f172a]/10">
          Total de Horas: <span className="text-lg ml-1">{formatHoursToHHMM(totalHours)}</span>
        </div>
      </div>
      <div className="bg-slate-50 px-6 py-4 border-b border-[#0f172a]/10 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-[#0f172a]" />
        <h3 className="text-lg font-bold text-[#0f172a]">Logística e Dedicação de Horas</h3>
      </div>
      <CardContent className="p-6 md:p-8">
        <div className="sm:hidden mb-6 text-center text-xs font-black bg-[#eab308] text-[#0f172a] px-4 py-3 rounded-xl shadow-sm uppercase tracking-widest border border-[#0f172a]/10">
          Total Dedicado: <span className="text-base ml-1">{formatHoursToHHMM(totalHours)}</span>
        </div>

        <div className="border-2 border-[#0f172a]/10 rounded-2xl mb-8 bg-slate-50/50 relative mt-4">
          <div className="absolute -top-3 left-6 bg-[#0f172a] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-10">
            Evento Principal
          </div>
          <div className="p-6 pt-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={control}
                name="meetingStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0f172a] font-bold text-sm block">
                      Início do Evento
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value || ''}
                        disabled={isViewer}
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
                  <FormItem>
                    <FormLabel className="text-[#0f172a] font-bold text-sm block">
                      Término do Evento
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value || ''}
                        disabled={isViewer}
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
              name="hasAdditionalDays"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-4 space-y-0 rounded-xl border border-[#0f172a]/10 p-4 bg-white shadow-sm mt-6 cursor-pointer hover:border-[#0f172a]/30 transition-colors">
                  <FormControl>
                    <Checkbox
                      className="mt-0.5 h-5 w-5 border-2 rounded text-[#0f172a] border-[#0f172a] bg-white data-[state=checked]:bg-[#eab308] data-[state=checked]:text-[#0f172a] data-[state=checked]:border-[#eab308]"
                      checked={field.value}
                      disabled={isViewer}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        if (checked && additionalDaysFields.length === 0 && !isViewer)
                          appendAdditionalDay({ start: '', end: '' })
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 flex-1 leading-none">
                    <FormLabel className="text-sm font-bold text-[#0f172a] cursor-pointer block">
                      Este evento gerou dias adicionais?
                    </FormLabel>
                    <p className="text-xs text-[#0f172a]/60 font-medium">
                      Adicione outros dias que compõem este mesmo evento contínuo.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {wHasAdditionalDays && (
              <div className="space-y-4 mt-5 pt-5 border-t border-[#0f172a]/10 animate-in fade-in slide-in-from-top-2">
                {additionalDaysFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-5 items-start bg-white p-5 rounded-xl border border-[#0f172a]/10 relative group shadow-sm"
                  >
                    <FormField
                      control={control}
                      name={`additionalDays.${index}.start`}
                      render={({ field: startField }) => (
                        <FormItem>
                          <FormLabel className="text-[#0f172a] font-bold text-sm block">
                            Início do Dia Adicional {index + 1}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...startField}
                              value={startField.value || ''}
                              disabled={isViewer}
                              className="bg-white border-[#0f172a]/20 h-11 rounded-xl text-[#0f172a] shadow-sm focus-visible:ring-[#eab308]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`additionalDays.${index}.end`}
                      render={({ field: endField }) => (
                        <FormItem>
                          <FormLabel className="text-[#0f172a] font-bold text-sm block">
                            Término do Dia Adicional {index + 1}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...endField}
                              value={endField.value || ''}
                              disabled={isViewer}
                              className="bg-white border-[#0f172a]/20 h-11 rounded-xl text-[#0f172a] shadow-sm focus-visible:ring-[#eab308]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {!isViewer && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="mt-7 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl h-11 px-3 hidden md:flex"
                        onClick={() => removeAdditionalDay(index)}
                        title="Remover Dia"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                    {!isViewer && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl h-11 md:hidden -mt-2 mb-2 border border-red-100"
                        onClick={() => removeAdditionalDay(index)}
                      >
                        <Trash className="w-4 h-4 mr-2" /> Remover Dia
                      </Button>
                    )}
                  </div>
                ))}
                {!isViewer && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto h-10 border-dashed border-2 border-[#0f172a]/20 text-[#0f172a]/60 hover:text-[#0f172a] hover:border-[#0f172a]/40 bg-transparent rounded-xl text-sm font-bold"
                    onClick={() => appendAdditionalDay({ start: '', end: '' })}
                  >
                    + Adicionar Outro Dia ao Evento
                  </Button>
                )}
              </div>
            )}
          </div>
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
                  disabled={isViewer}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    if (checked && actionsFields.length === 0 && !isViewer)
                      appendAction({ periods: [{ start: '', end: '' }] })
                  }}
                />
              </FormControl>
              <div className="space-y-2 leading-none cursor-pointer flex-1">
                <FormLabel className="text-base font-bold text-[#0f172a] cursor-pointer block">
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
              {!isViewer && (
                <Button
                  type="button"
                  className="bg-white text-[#0f172a] hover:bg-slate-100 border-2 border-[#0f172a]/20 font-bold rounded-xl h-10 px-4 shadow-sm w-full sm:w-auto"
                  onClick={() => appendAction({ periods: [{ start: '', end: '' }] })}
                >
                  + Nova Ação Extra
                </Button>
              )}
            </div>
            <div className="space-y-5">
              {actionsFields.map((field, index) => (
                <ActionItem
                  key={field.id}
                  actionIndex={index}
                  isViewer={isViewer}
                  removeAction={removeAction}
                />
              ))}
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
