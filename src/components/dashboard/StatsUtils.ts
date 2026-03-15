import { ActivityRecord } from '@/lib/types'
import { calculateHoursDifference, parseSemicolonList } from '@/lib/utils'

export function calculateDashboardStats(records: ActivityRecord[]) {
  let totalMeetingHours = 0
  let totalActionHours = 0
  let totalReunioes = 0
  let totalInstitucionais = 0
  let totalAcoesGeradas = 0

  const modalityCount = { Presencial: 0, Remota: 0, Híbrida: 0 }
  const locationCount: Record<string, number> = {}
  const eventTypeCount: Record<string, number> = {}

  const allPf = []
  const allPj = []
  const allDocs = []

  let totalDeliberations = 0

  records.forEach((r) => {
    // Time
    totalMeetingHours += calculateHoursDifference(r.meetingStart, r.meetingEnd)
    if (r.hasAction && r.actionStart && r.actionEnd) {
      totalActionHours += calculateHoursDifference(r.actionStart, r.actionEnd)
      totalAcoesGeradas++
    }

    // Types
    if (r.eventType.includes('Reunião')) totalReunioes++
    if (r.instance === 'Eventos Institucionais') totalInstitucionais++
    eventTypeCount[r.eventType] = (eventTypeCount[r.eventType] || 0) + 1

    // Modality & Location
    modalityCount[r.modality]++
    locationCount[r.location] = (locationCount[r.location] || 0) + 1

    // Participants
    const pfs = parseSemicolonList(r.participantsPF)
    const pjs = parseSemicolonList(r.participantsPJ)
    allPf.push(...pfs)
    allPj.push(...pjs)

    // Docs
    allDocs.push(...r.documentCategories)
    totalDeliberations += parseSemicolonList(r.deliberations).length
  })

  const uniquePf = new Set(allPf)
  const uniquePj = new Set(allPj)

  const pfRanking = getRanking(allPf)
  const pjRanking = getRanking(allPj)
  const locRanking = getRanking(
    Object.keys(locationCount).flatMap((k) => Array(locationCount[k]).fill(k)),
  )

  return {
    totalEvents: records.length,
    totalHours: totalMeetingHours + totalActionHours,
    totalReunioes,
    totalInstitucionais,
    totalAcoesGeradas,
    modalityData: [
      { name: 'Presencial', value: modalityCount.Presencial, fill: 'var(--color-presencial)' },
      { name: 'Remota', value: modalityCount.Remota, fill: 'var(--color-remota)' },
      { name: 'Híbrida', value: modalityCount.Híbrida, fill: 'var(--color-hibrida)' },
    ],
    eventTypeData: Object.entries(eventTypeCount).map(([name, value]) => ({ name, value })),
    locations: {
      total: Object.values(locationCount).reduce((a, b) => a + b, 0),
      unique: Object.keys(locationCount).length,
      ranking: locRanking,
    },
    engagement: {
      pfTotal: allPf.length,
      pfUnique: uniquePf.size,
      pjTotal: allPj.length,
      pjUnique: uniquePj.size,
      pfRanking,
      pjRanking,
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
      ).map(([name, value]) => ({ name, value })),
    },
  }
}

function getRanking(items: string[]) {
  const counts: Record<string, number> = {}
  items.forEach((i) => (counts[i] = (counts[i] || 0) + 1))

  if (Object.keys(counts).length === 0) return { max: 0, names: [] }

  const max = Math.max(...Object.values(counts))
  const names = Object.keys(counts).filter((k) => counts[k] === max)

  return { max, names }
}
