import { useMemo } from 'react'
import { useAppStore } from '@/stores/main'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { Loader2 } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { DashboardStats } from '@/components/dashboard/StatsUtils'

function computeStats(activities: any[]): DashboardStats['overview'] {
  let totalEvents = activities.length
  let formalMeetings = 0
  let institutionalEvents = 0
  let actionsGenerated = 0
  let eventHours = 0
  let actionHours = 0
  const eventsByTypeMap: Record<string, number> = {}
  const modalityMap: Record<string, number> = {}

  activities.forEach((a) => {
    if (a.eventType === 'Reunião Formal') formalMeetings++
    if (a.eventType === 'Evento Institucional') institutionalEvents++
    if (a.hasAction) actionsGenerated += a.actions?.length || 1

    if (a.meetingStart && a.meetingEnd) {
      const start = new Date(a.meetingStart)
      const end = new Date(a.meetingEnd)
      const diff = (end.getTime() - start.getTime()) / 3600000
      if (diff > 0) eventHours += diff
    }

    if (a.hasAction && a.actionStart && a.actionEnd) {
      const start = new Date(a.actionStart)
      const end = new Date(a.actionEnd)
      const diff = (end.getTime() - start.getTime()) / 3600000
      if (diff > 0) actionHours += diff
    }

    const eType = a.eventType || 'Outro'
    eventsByTypeMap[eType] = (eventsByTypeMap[eType] || 0) + 1

    const mod = a.modality || 'Presencial'
    modalityMap[mod] = (modalityMap[mod] || 0) + 1
  })

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return {
    totalEvents,
    formalMeetings,
    institutionalEvents,
    actionsGenerated,
    eventHours,
    actionHours,
    eventsByType: Object.entries(eventsByTypeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
    modalityData: Object.entries(modalityMap).map(([name, value], i) => ({
      name,
      value,
      fill: colors[i % colors.length],
    })),
  }
}

export default function Index() {
  const { activities, isFetching, fetchActivities } = useAppStore()

  useRealtime('activities', () => {
    fetchActivities()
  })

  const stats = useMemo(() => computeStats(activities), [activities])

  return (
    <div className="flex-1 space-y-8 max-w-[1200px] mx-auto min-h-[calc(100vh-80px)] pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground uppercase">
          Dashboard BI
        </h1>
        <p className="text-muted-foreground font-medium">
          Consolidação de dados do Gabinete de Gestão Integrada Municipal.
        </p>
      </div>

      {isFetching && activities.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DashboardOverview data={stats} />
      )}
    </div>
  )
}
