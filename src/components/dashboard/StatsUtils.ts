import { ActivityRecord } from '@/lib/types'
import { calculateHoursDifference, parseSemicolonList } from '@/lib/utils'
import useReportsStore from '@/stores/reports'

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
    topLocations: { name: string; count: number }[]
  }
  engagement: {
    pfTotal: number
    pfUnique: number
    pjTotal: number
    pjUnique: number
    topPf: { name: string; count: number }[]
    topPj: { name: string; count: number }[]
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

function getPluralName(word: string, count: number): string {
  if (count === 1) return word

  const plurals: Record<string, string> = {
    Ata: 'Atas',
    Ofício: 'Ofícios',
    Relatório: 'Relatórios',
    Transcrição: 'Transcrições',
    'E-mail': 'E-mails',
    SID: 'SIDs',
    Formulário: 'Formulários',
    Foto: 'Fotos',
    Áudio: 'Áudios',
    Vídeo: 'Vídeos',
    'Lista de Presença': 'Listas de Presença',
    Link: 'Links',
    Outros: 'Outros',
    'Reunião Ordinária': 'Reuniões Ordinárias',
    'Reunião Extraordinária': 'Reuniões Extraordinárias',
    'Evento Institucional': 'Eventos Institucionais',
    Capacitação: 'Capacitações',
    Operação: 'Operações',
    'Ação Operacional': 'Ações Operacionais',
    'Visita Técnica': 'Visitas Técnicas',
    Palestra: 'Palestras',
    Workshop: 'Workshops',
    Treinamento: 'Treinamentos',
    Seminário: 'Seminários',
    Congresso: 'Congressos',
    Fórum: 'Fóruns',
    'Audiência Pública': 'Audiências Públicas',
    Solenidade: 'Solenidades',
  }

  return plurals[word] || word + 's'
}

export function calculateDashboardStats(
  records: ActivityRecord[],
  ggimReportsCount: number = 0,
): DashboardStats {
  let eventHours = 0
  let actionHours = 0
  let formalMeetings = 0
  let institutionalEvents = 0
  let actionsGenerated = 0
  let totalDeliberations = 0

  let ggimDocsCount = 0
  let ggimVideosCount = 0

  try {
    const reports = useReportsStore.getState().reports || []
    if (reports.length > 0) {
      reports.forEach((r: any) => {
        const fileType = r.file_type?.toLowerCase() || ''
        const reportType = r.report_type?.toLowerCase() || ''
        const name = r.name?.toLowerCase() || ''

        const isVideo =
          fileType === 'vídeo' ||
          fileType === 'video' ||
          fileType.startsWith('video/') ||
          reportType === 'vídeo' ||
          reportType === 'video' ||
          name.endsWith('.mp4') ||
          name.endsWith('.webm') ||
          name.endsWith('.mov')

        if (isVideo) {
          ggimVideosCount++
        } else {
          ggimDocsCount++
        }
      })
    } else {
      ggimDocsCount = ggimReportsCount
    }
  } catch (e) {
    ggimDocsCount = ggimReportsCount
  }

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

    const pfs = parseSemicolonList(r.participantsPF).filter(Boolean)
    const pjs = parseSemicolonList(r.participantsPJ).filter(Boolean)
    allPf.push(...pfs)
    allPj.push(...pjs)
    if (pfs.length > 0) pfCountsPerEvent.push(pfs.length)
    if (pjs.length > 0) pjCountsPerEvent.push(pjs.length)

    if (r.documents) {
      r.documents.forEach((d) => {
        if (d.type) allDocs.push(d.type)
        else if ((d as any).categories) allDocs.push(...(d as any).categories)
      })
    }
    totalDeliberations += parseSemicolonList(r.deliberations).filter(Boolean).length
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
    .map(([name, value]) => ({ name: getPluralName(name, value), value }))
    .sort((a, b) => b.value - a.value)

  const DOC_TYPES_CHART = [
    'Ata',
    'Ofício',
    'Relatório',
    'Transcrição',
    'E-mail',
    'SID',
    'Formulário',
    'Foto',
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
    else if (upper === 'IMAGENS' || upper === 'FOTO' || upper === 'FOTOS') mapped = 'Foto'
    else if (upper === 'ÁUDIO') mapped = 'Áudio'
    else if (upper === 'VÍDEO' || upper === 'VIDEO') mapped = 'Vídeo'
    else if (upper === 'LISTA DE PRESENÇA') mapped = 'Lista de Presença'
    else if (upper === 'LINK') mapped = 'Link'
    else if (upper === 'OUTROS') mapped = 'Outros'
    else if (docsByType[t] !== undefined) mapped = t

    if (docsByType[mapped] !== undefined) {
      docsByType[mapped]++
    } else {
      docsByType['Outros']++
    }
  })

  if (ggimDocsCount > 0) {
    docsByType['Relatório'] = (docsByType['Relatório'] || 0) + ggimDocsCount
  }

  if (ggimVideosCount > 0) {
    docsByType['Vídeo'] = (docsByType['Vídeo'] || 0) + ggimVideosCount
  }

  const pluralizedDocsByType: Record<string, number> = {}
  Object.entries(docsByType).forEach(([k, v]) => {
    if (v > 0) {
      pluralizedDocsByType[getPluralName(k, v)] = v
    }
  })

  const docsData = Object.entries(pluralizedDocsByType)
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
      topLocations: getTopN(
        Object.keys(locationCount).flatMap((k) =>
          Array(locationCount[k]).fill(k.trim().toUpperCase()),
        ),
        3,
      ),
    },
    engagement: {
      pfTotal: allPf.length,
      pfUnique: new Set(allPf.map((n) => n.toLowerCase())).size,
      pjTotal: allPj.length,
      pjUnique: new Set(allPj.map((n) => n.toLowerCase())).size,
      topPf: getTopN(
        allPf.map((n) => n.trim().toUpperCase()),
        5,
      ),
      topPj: getTopN(
        allPj.map((n) => n.trim().toUpperCase()),
        3,
      ),
      pfStats,
      pjStats,
    },
    productivity: {
      totalDeliberations,
      totalDocs: allDocs.length + ggimDocsCount + ggimVideosCount,
      docsData,
      docsByType: pluralizedDocsByType,
    },
  }
}

function getTopN(items: string[], n: number) {
  const counts: Record<string, number> = {}
  items.forEach((i) => {
    if (i) counts[i] = (counts[i] || 0) + 1
  })
  if (Object.keys(counts).length === 0) return []
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }))
}
