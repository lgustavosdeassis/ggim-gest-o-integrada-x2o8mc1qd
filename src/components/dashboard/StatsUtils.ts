import { ActivityRecord } from '@/lib/types'
import { calculateHoursDifference, parseSemicolonList } from '@/lib/utils'

export function calculateDashboardStats(records: ActivityRecord[]) {
  if (!records || records.length === 0) {
    return {
      totalEvents: 0,
      totalHours: 0,
      totalReunioes: 0,
      totalInstitucionais: 0,
      totalAcoesGeradas: 0,
      modalityData: [],
      eventTypeData: [],
      locations: { total: 0, unique: 0, ranking: { max: 0, names: [] } },
      engagement: {
        pfTotal: 0,
        pfUnique: 0,
        pjTotal: 0,
        pjUnique: 0,
        pfRanking: { max: 0, names: [] },
        pjRanking: { max: 0, names: [] },
        pfStats: { mean: 0, median: 0, mode: [] as number[] },
      },
      productivity: { deliberations: 0, totalDocs: 0, docsData: [] },
    }
  }

  let totalHours = 0
  let totalReunioes = 0
  let totalInstitucionais = 0
  let totalAcoesGeradas = 0
  let totalDeliberations = 0
  const modalityCount = { Presencial: 0, Remota: 0, Híbrida: 0 } as Record<string, number>
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
        totalAcoesGeradas++
      })
    } else if (r.hasAction && r.actionStart && r.actionEnd) {
      totalHours += calculateHoursDifference(r.actionStart, r.actionEnd)
      totalAcoesGeradas++
    }

    if (r.eventType.includes('Reunião Ordinária') || r.eventType.includes('Reunião Extraordinária'))
      totalReunioes++
    if (r.instance === 'Eventos Institucionais') totalInstitucionais++
    if (modalityCount[r.modality] !== undefined) modalityCount[r.modality]++
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

  return {
    totalEvents: records.length,
    totalHours,
    totalReunioes,
    totalInstitucionais,
    totalAcoesGeradas,
    modalityData: [
      { name: 'Presencial', value: modalityCount.Presencial || 0, fill: 'hsl(var(--chart-1))' },
      { name: 'Remota', value: modalityCount.Remota || 0, fill: 'hsl(var(--chart-2))' },
      { name: 'Híbrida', value: modalityCount.Híbrida || 0, fill: 'hsl(var(--chart-3))' },
    ].filter((d) => d.value > 0),
    locations: {
      total: Object.values(locationCount).reduce((a, b) => a + b, 0),
      unique: Object.keys(locationCount).length,
      ranking: getRanking(
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
      pfRanking: getRanking(allPf.map((n) => n.trim().toUpperCase())),
      pjRanking: getRanking(allPj.map((n) => n.trim().toUpperCase())),
      pfStats,
    },
    productivity: {
      deliberations: totalDeliberations,
      totalDocs: allDocs.length,
      docsData: Object.entries(
        allDocs.reduce(
          (acc, doc) => {
            acc[doc] = (acc[doc] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ),
      )
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    },
  }
}

function getRanking(items: string[]) {
  const counts: Record<string, number> = {}
  items.forEach((i) => (counts[i] = (counts[i] || 0) + 1))
  if (Object.keys(counts).length === 0) return { max: 0, names: [] }
  const max = Math.max(...Object.values(counts))
  const names = Object.keys(counts)
    .filter((k) => counts[k] === max)
    .sort()
  return { max, names }
}
