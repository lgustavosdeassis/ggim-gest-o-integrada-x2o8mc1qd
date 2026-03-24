import { ActivityRecord } from '@/lib/types'
import { calculateHoursDifference, parseSemicolonList } from '@/lib/utils'

export interface DashboardStats {
  overview: {
    totalEvents: number
    formalMeetings: number
    institutionalEvents: number
    actionsGenerated: number
    eventHours: number
    actionHours: number
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
    pjStats: { mean: number; median: number; mode: number[] }
  }
  productivity: {
    totalDeliberations: number
    totalDocs: number
    docsData: { name: string; value: number; fill: string }[]
    docsByType: Record<string, number>
  }
}

export function calculateDashboardStats(records: ActivityRecord[]): DashboardStats {
  let eventHours = 0
  let actionHours = 0
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
  const pjCountsPerEvent: number[] = []

  records.forEach((r) => {
    let currentEventHours = calculateHoursDifference(r.meetingStart, r.meetingEnd)
    if (r.hasAdditionalDays && r.additionalDays) {
      currentEventHours += r.additionalDays.reduce(
        (acc, d) => acc + calculateHoursDifference(d.start, d.end),
        0,
      )
    }
    eventHours += currentEventHours

    let currentActionHours = 0
    if (r.actions && r.actions.length > 0) {
      actionsGenerated += r.actions.length
      r.actions.forEach((a) => {
        if (a.periods && a.periods.length > 0) {
          currentActionHours += a.periods.reduce(
            (pAcc, p) => pAcc + calculateHoursDifference(p.start, p.end),
            0,
          )
        } else {
          currentActionHours += calculateHoursDifference(a.start || '', a.end || '')
        }
      })
    } else if (r.hasAction && r.actionStart && r.actionEnd) {
      actionsGenerated++
      currentActionHours += calculateHoursDifference(r.actionStart, r.actionEnd)
    }
    actionHours += currentActionHours

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
    pjCountsPerEvent.push(pjs.length)

    if (r.documents) {
      r.documents.forEach((d) => {
        if (d.type) allDocs.push(d.type)
        else if ((d as any).categories) allDocs.push(...(d as any).categories)
      })
    }
    totalDeliberations += parseSemicolonList(r.deliberations).length
  })

  function getStats(countsArray: number[]) {
    const stats = { mean: 0, median: 0, mode: [] as number[] }
    if (countsArray.length > 0) {
      stats.mean = countsArray.reduce((a, b) => a + b, 0) / countsArray.length
      const sorted = [...countsArray].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      stats.median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2

      const countsMap = sorted.reduce(
        (acc, val) => {
          acc[val] = (acc[val] || 0) + 1
          return acc
        },
        {} as Record<number, number>,
      )
      const maxCount = Math.max(...Object.values(countsMap))
      const allCountsSame = Object.values(countsMap).every((c) => c === maxCount)

      if (allCountsSame && Object.keys(countsMap).length > 1) {
        stats.mode = []
      } else {
        stats.mode = Object.keys(countsMap)
          .filter((k) => countsMap[Number(k)] === maxCount)
          .map(Number)
      }
    }
    return stats
  }

  const pfStats = getStats(pfCountsPerEvent)
  const pjStats = getStats(pjCountsPerEvent)

  const eventsByType = Object.entries(eventTypeCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const DOC_TYPES_CHART = [
    'Ata',
    'Ofício',
    'Relatório',
    'Transcrição',
    'E-mail',
    'SID',
    'Formulário',
    'Imagens',
    'Áudio',
    'Vídeo',
    'Lista de Presença',
    'Link',
    'Outros',
  ]
  const docsByType = DOC_TYPES_CHART.reduce(
    (acc, t) => {
      acc[t] = 0
      return acc
    },
    {} as Record<string, number>,
  )

  allDocs.forEach((t) => {
    const upper = t.toUpperCase()
    let mapped = 'Outros'
    if (upper === 'ATO' || upper === 'ATA') mapped = 'Ata'
    else if (upper === 'OFÍCIO') mapped = 'Ofício'
    else if (upper === 'RELATÓRIO') mapped = 'Relatório'
    else if (upper === 'TRANSCRIÇÃO') mapped = 'Transcrição'
    else if (upper === 'E-MAIL' || upper === 'EMAIL') mapped = 'E-mail'
    else if (upper === 'SID') mapped = 'SID'
    else if (upper === 'FORMULÁRIO') mapped = 'Formulário'
    else if (upper === 'IMAGENS' || upper === 'FOTO' || upper === 'FOTOS') mapped = 'Imagens'
    else if (upper === 'ÁUDIO') mapped = 'Áudio'
    else if (upper === 'VÍDEO' || upper === 'VIDEO') mapped = 'Vídeo'
    else if (upper === 'LISTA DE PRESENÇA') mapped = 'Lista de Presença'
    else if (upper === 'LINK') mapped = 'Link'
    else if (upper === 'OUTROS') mapped = 'Outros'
    else if (docsByType[t]) mapped = t

    if (docsByType[mapped] !== undefined) {
      docsByType[mapped]++
    } else {
      docsByType['Outros']++
    }
  })

  const docsData = Object.entries(docsByType)
    .filter(([_, value]) => value > 0)
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
      eventHours,
      actionHours,
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
      pjStats,
    },
    productivity: {
      totalDeliberations,
      totalDocs: allDocs.length,
      docsData,
      docsByType,
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
