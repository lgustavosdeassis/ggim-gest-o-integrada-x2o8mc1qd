import { ActivityRecord } from '@/lib/types'
import { calculateHoursDifference, parseSemicolonList } from '@/lib/utils'

export interface DashboardStats {
  overview: {
    totalEvents: number
    formalMeetings: number
    institutionalEvents: number
    actionsGenerated: number
    totalHours: number
    eventsByType: { name: string; value: number }[]
    modalityData: { name: string; value: number; fill: string }[]
  }
  logistics: {
    totalUsages: number
    uniqueLocations: number
    topLocation: { names: string[]; count: number }
  }
  engagement: {
    pfTotal: number
    pfUnique: number
    pjTotal: number
    pjUnique: number
    topPf: { names: string[]; count: number }
    topPj: { names: string[]; count: number }
    pfStats: { mean: number; median: number; mode: number[] }
  }
  productivity: {
    totalDeliberations: number
    totalDocs: number
    docsData: { name: string; value: number; fill: string }[]
  }
}

export function calculateDashboardStats(records: ActivityRecord[]): DashboardStats {
  let totalHours = 0
  let formalMeetings = 0
  let institutionalEvents = 0
  let actionsGenerated = 0
  let totalDeliberations = 0

  const modalityCount: Record<string, number> = { Presencial: 0, Remota: 0, Híbrida: 0 }
  const eventTypeCount: Record<string, number> = {}
  const locationCount: Record<string, number> = {}

  const allPf: string[] = []
  const allPj: string[] = []
  const allDocs: string[] = []
  const pfCountsPerEvent: number[] = []

  records.forEach((r) => {
    totalHours += calculateHoursDifference(r.meetingStart, r.meetingEnd)

    if (r.actions && r.actions.length > 0) {
      r.actions.forEach((a) => {
        totalHours += calculateHoursDifference(a.start, a.end)
        actionsGenerated++
      })
    } else if (r.hasAction && r.actionStart && r.actionEnd) {
      totalHours += calculateHoursDifference(r.actionStart, r.actionEnd)
      actionsGenerated++
    }

    if (r.eventType.includes('Reunião Ordinária') || r.eventType.includes('Reunião Extraordinária'))
      formalMeetings++
    if (r.instance === 'Eventos Institucionais') institutionalEvents++

    if (modalityCount[r.modality] !== undefined) modalityCount[r.modality]++
    eventTypeCount[r.eventType] = (eventTypeCount[r.eventType] || 0) + 1

    if (r.location) locationCount[r.location] = (locationCount[r.location] || 0) + 1

    const pfs = parseSemicolonList(r.participantsPF)
    const pjs = parseSemicolonList(r.participantsPJ)
    allPf.push(...pfs)
    allPj.push(...pjs)
    pfCountsPerEvent.push(pfs.length)

    if (r.documents) r.documents.forEach((d) => allDocs.push(...d.categories))
    totalDeliberations += parseSemicolonList(r.deliberations).length
  })

  const pfStats = { mean: 0, median: 0, mode: [] as number[] }
  if (pfCountsPerEvent.length > 0) {
    pfStats.mean = pfCountsPerEvent.reduce((a, b) => a + b, 0) / pfCountsPerEvent.length
    const sorted = [...pfCountsPerEvent].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    pfStats.median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
    const countsMap = sorted.reduce(
      (acc, val) => {
        acc[val] = (acc[val] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )
    const maxCount = Math.max(...Object.values(countsMap))
    pfStats.mode = Object.keys(countsMap)
      .filter((k) => countsMap[Number(k)] === maxCount)
      .map(Number)
  }

  const eventsByType = Object.entries(eventTypeCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const docsData = Object.entries(
    allDocs.reduce(
      (acc, doc) => {
        acc[doc] = (acc[doc] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  )
    .map(([name, value], i) => ({
      name,
      value,
      fill: `hsl(var(--chart-${(i % 5) + 1}))`,
    }))
    .sort((a, b) => b.value - a.value)

  return {
    overview: {
      totalEvents: records.length,
      formalMeetings,
      institutionalEvents,
      actionsGenerated,
      totalHours,
      eventsByType,
      modalityData: [
        { name: 'Presencial', value: modalityCount.Presencial || 0, fill: 'hsl(var(--chart-1))' },
        { name: 'Remota', value: modalityCount.Remota || 0, fill: 'hsl(var(--chart-2))' },
        { name: 'Híbrida', value: modalityCount.Híbrida || 0, fill: 'hsl(var(--chart-3))' },
      ].filter((d) => d.value > 0),
    },
    logistics: {
      totalUsages: Object.values(locationCount).reduce((a, b) => a + b, 0),
      uniqueLocations: Object.keys(locationCount).length,
      topLocation: getRanking(
        Object.keys(locationCount).flatMap((k) =>
          Array(locationCount[k]).fill(k.trim().toUpperCase()),
        ),
      ),
    },
    engagement: {
      pfTotal: allPf.length,
      pfUnique: new Set(allPf.map((n) => n.toLowerCase())).size,
      pjTotal: allPj.length,
      pjUnique: new Set(allPj.map((n) => n.toLowerCase())).size,
      topPf: getRanking(allPf.map((n) => n.trim().toUpperCase())),
      topPj: getRanking(allPj.map((n) => n.trim().toUpperCase())),
      pfStats,
    },
    productivity: {
      totalDeliberations,
      totalDocs: allDocs.length,
      docsData,
    },
  }
}

function getRanking(items: string[]) {
  const counts: Record<string, number> = {}
  items.forEach((i) => (counts[i] = (counts[i] || 0) + 1))
  if (Object.keys(counts).length === 0) return { count: 0, names: [] }
  const max = Math.max(...Object.values(counts))
  const names = Object.keys(counts)
    .filter((k) => counts[k] === max)
    .sort()
  return { count: max, names }
}
