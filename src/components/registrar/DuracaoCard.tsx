import { useFormContext, useFieldArray } from 'react-hook-form'
import { useAuthStore } from '@/stores/auth'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Clock, Plus, Trash } from 'lucide-react'
import { FormValues } from './schema'

export function DuracaoCard() {
  const { control, watch } = useFormContext<FormValues>()
  const isViewer = useAuthStore((state) => state.user?.role === 'viewer')

  const hasAdditionalDays = watch('hasAdditionalDays')
  const hasAction = watch('hasAction')

  const {
    fields: additionalDaysFields,
    append: appendAdditionalDay,
    remove: removeAdditionalDay,
  } = useFieldArray({
    control,
    name: 'additionalDays',
  })

  const {
    fields: actionsFields,
    append: appendAction,
    remove: removeAction,
  } = useFieldArray({
    control,
    name: 'actions',
  })

  return (
    <Card className="border-2 border-[#0f172a]/10 shadow-sm bg-white rounded-2xl overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-[#0f172a]/10 flex items-center gap-3">
        <Clock className="h-5 w-5 text-[#0f172a]" />
        <h3 className="text-lg font-bold text-[#0f172a]">Logística e Dedicação de Horas</h3>
      </div>
      <CardContent className="p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="meetingStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-[#0f172a] uppercase tracking-widest">
                  Início do Evento (Base)
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    className="h-12 rounded-xl border-[#0f172a]/20 text-[#0f172a] bg-white focus-visible:ring-[#eab308]"
                    disabled={isViewer}
                    {...field}
                    value={field.value || ''}
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
                <FormLabel className="text-xs font-bold text-[#0f172a] uppercase tracking-widest">
                  Término do Evento (Base)
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    className="h-12 rounded-xl border-[#0f172a]/20 text-[#0f172a] bg-white focus-visible:ring-[#eab308]"
                    disabled={isViewer}
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={control}
            name="hasAdditionalDays"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-[#0f172a]/10 p-4 bg-slate-50">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isViewer}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-bold text-[#0f172a]">
                    Dias Adicionais de Evento
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Marque se o evento ocorreu em mais de um dia.
                  </p>
                </div>
              </FormItem>
            )}
          />

          {hasAdditionalDays && (
            <div className="space-y-4 pl-4 border-l-2 border-[#eab308]">
              {additionalDaysFields.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row items-end gap-4 bg-slate-50 p-4 rounded-xl border border-[#0f172a]/10"
                >
                  <FormField
                    control={control}
                    name={`additionalDays.${index}.start`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-[10px] font-bold text-[#0f172a] uppercase tracking-widest">
                          Início (Dia {index + 1})
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            disabled={isViewer}
                            className="h-11 rounded-lg border-[#0f172a]/20"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`additionalDays.${index}.end`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-[10px] font-bold text-[#0f172a] uppercase tracking-widest">
                          Término (Dia {index + 1})
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            disabled={isViewer}
                            className="h-11 rounded-lg border-[#0f172a]/20"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {!isViewer && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeAdditionalDay(index)}
                      className="mb-0.5 rounded-xl h-11 w-11 shrink-0"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {!isViewer && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendAdditionalDay({ start: '', end: '' })}
                  className="font-bold border-[#eab308] text-[#eab308] hover:bg-[#eab308]/10 h-11 rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Dia
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-[#0f172a]/10">
          <FormField
            control={control}
            name="hasAction"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-[#0f172a]/10 p-4 bg-slate-50">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isViewer}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-bold text-[#0f172a]">Ações Vinculadas</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Este evento gerou ou desdobrou uma ação vinculada.
                  </p>
                </div>
              </FormItem>
            )}
          />

          {hasAction && (
            <div className="space-y-4 pl-4 border-l-2 border-[#eab308]">
              {actionsFields.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row items-end gap-4 bg-slate-50 p-4 rounded-xl border border-[#0f172a]/10"
                >
                  <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
                    <FormField
                      control={control}
                      name={`actions.${index}.periods.0.start`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-[10px] font-bold text-[#0f172a] uppercase tracking-widest">
                            Início (Ação {index + 1})
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              disabled={isViewer}
                              className="h-11 rounded-lg border-[#0f172a]/20"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`actions.${index}.periods.0.end`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-[10px] font-bold text-[#0f172a] uppercase tracking-widest">
                            Término (Ação {index + 1})
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              disabled={isViewer}
                              className="h-11 rounded-lg border-[#0f172a]/20"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  {!isViewer && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeAction(index)}
                      className="mb-0.5 rounded-xl h-11 w-11 shrink-0 mt-4 md:mt-0"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {!isViewer && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendAction({ periods: [{ start: '', end: '' }] })}
                  className="font-bold border-[#eab308] text-[#eab308] hover:bg-[#eab308]/10 h-11 rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Ação
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
