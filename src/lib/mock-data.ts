import { ActivityRecord, INSTANCES, EVENT_TYPES } from './types'

const generateMockRecords = (): ActivityRecord[] => {
  const records: ActivityRecord[] = []
  const today = new Date()

  for (let i = 0; i < 45; i++) {
    const meetingStart = new Date(today)
    meetingStart.setDate(today.getDate() - Math.floor(Math.random() * 90))
    meetingStart.setHours(8 + Math.floor(Math.random() * 8), 0, 0)

    const meetingEnd = new Date(meetingStart)
    meetingEnd.setHours(meetingStart.getHours() + 1 + Math.floor(Math.random() * 3))

    const hasAction = Math.random() > 0.5
    const actionStart = hasAction ? new Date(meetingEnd) : undefined
    const actionEnd = hasAction ? new Date(meetingEnd) : undefined
    if (actionStart && actionEnd) {
      actionStart.setHours(actionStart.getHours() + 1)
      actionEnd.setHours(actionStart.getHours() + 2 + Math.floor(Math.random() * 4))
    }

    const modalities = ['Presencial', 'Remota', 'Híbrida'] as const
    const locations = [
      'Paço Municipal',
      'Sede GGIM',
      'Auditório PMFI',
      'Online (Teams)',
      'Secretaria de Segurança',
    ]

    const pfNames = [
      'João Silva',
      'Maria Souza',
      'Carlos Eduardo',
      'Ana Beatriz',
      'Pedro Paulo',
      'Lucas Lima',
      'Fernanda Costa',
    ]
    const pjNames = [
      'Polícia Militar',
      'Polícia Civil',
      'Guarda Municipal',
      'Foztrans',
      'Defesa Civil',
      'Receita Federal',
      'Polícia Federal',
    ]

    records.push({
      id: `mock-${i}`,
      instance: INSTANCES[Math.floor(Math.random() * INSTANCES.length)],
      eventType: EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)],
      modality: modalities[Math.floor(Math.random() * modalities.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      meetingStart: meetingStart.toISOString(),
      meetingEnd: meetingEnd.toISOString(),
      hasAction,
      actionStart: actionStart?.toISOString(),
      actionEnd: actionEnd?.toISOString(),
      participantsPF: Array.from({ length: 3 + Math.floor(Math.random() * 5) })
        .map(() => pfNames[Math.floor(Math.random() * pfNames.length)])
        .join('; '),
      participantsPJ: Array.from({ length: 2 + Math.floor(Math.random() * 3) })
        .map(() => pjNames[Math.floor(Math.random() * pjNames.length)])
        .join('; '),
      deliberations: 'Aprovação de pauta; Definição de cronograma',
      documentCategories: ['Ata', Math.random() > 0.5 ? 'Ofício' : 'Relatório'],
      documentDetails: 'Documentos gerados durante a sessão',
      files: ['ata_reuniao.pdf'],
      createdAt: today.toISOString(),
    })
  }

  return records
}

export const mockRecords = generateMockRecords()
