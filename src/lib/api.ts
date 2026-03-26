import { supabase } from '@/lib/supabase/client'
import { ActivityRecord } from '@/lib/types'

function mapFromDB(item: any): ActivityRecord {
  if (!item) return item
  return {
    id: item.id,
    eventName: item.event_name,
    instance: item.instance,
    eventType: item.event_type,
    modality: item.modality,
    location: item.location,
    meetingStart: item.meeting_start,
    meetingEnd: item.meeting_end,
    hasAdditionalDays: item.has_additional_days,
    additionalDays: item.additional_days,
    hasAction: item.has_action,
    actionStart: item.action_start,
    actionEnd: item.action_end,
    actions: item.actions,
    participantsPF: item.participants_pf,
    participantsPJ: item.participants_pj,
    documents: item.documents,
    deliberations: item.deliberations,
    description: item.description,
    createdAt: item.created_at,
  }
}

function mapToDB(item: any) {
  const payload: any = {}

  if (item.eventName !== undefined) payload.event_name = item.eventName || null
  if (item.instance !== undefined) payload.instance = item.instance
  if (item.eventType !== undefined) payload.event_type = item.eventType
  if (item.modality !== undefined) payload.modality = item.modality
  if (item.location !== undefined) payload.location = item.location
  if (item.meetingStart !== undefined) payload.meeting_start = item.meetingStart
  if (item.meetingEnd !== undefined) payload.meeting_end = item.meetingEnd
  if (item.hasAdditionalDays !== undefined) payload.has_additional_days = item.hasAdditionalDays
  if (item.additionalDays !== undefined) payload.additional_days = item.additionalDays
  if (item.hasAction !== undefined) payload.has_action = item.hasAction
  if (item.actionStart !== undefined) payload.action_start = item.actionStart || null
  if (item.actionEnd !== undefined) payload.action_end = item.actionEnd || null
  if (item.actions !== undefined) payload.actions = item.actions
  if (item.participantsPF !== undefined) payload.participants_pf = item.participantsPF || ''
  if (item.participantsPJ !== undefined) payload.participants_pj = item.participantsPJ || ''
  if (item.documents !== undefined) payload.documents = item.documents
  if (item.deliberations !== undefined) payload.deliberations = item.deliberations || ''
  if (item.description !== undefined) payload.description = item.description || ''

  return payload
}

export const api = {
  activities: {
    list: async () => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        return (data || []).map(mapFromDB)
      } catch (error: any) {
        console.warn(
          'Erro ao buscar todas as atividades, tentando em lotes menores para contornar payload muito grande ou falhas de fetch...',
          error,
        )
        try {
          const allData: any[] = []
          const pageSize = 15 // Lote pequeno para mitigar "Unterminated string in JSON" ou "Failed to fetch"

          for (let i = 0; i < 50; i++) {
            // Limite de lotes para evitar loops infinitos
            try {
              const { data, error: chunkError } = await supabase
                .from('activities')
                .select('*')
                .order('created_at', { ascending: false })
                .range(i * pageSize, (i + 1) * pageSize - 1)

              if (chunkError) {
                console.error(`Erro ao buscar lote ${i}:`, chunkError)
                continue // Ignora o lote defeituoso e segue para tentar processar os demais
              }

              if (data) {
                allData.push(...data)
              }

              if (!data || data.length < pageSize) {
                break // Fim dos registros
              }
            } catch (chunkException) {
              console.error(`Exceção ao buscar lote ${i}:`, chunkException)
              // Continua para o próximo lote
            }
          }
          return allData.map(mapFromDB)
        } catch (fallbackError) {
          console.error('Falha total no fallback de busca em lotes:', fallbackError)
          throw fallbackError
        }
      }
    },
    create: async (activity: any) => {
      const { data, error } = await supabase
        .from('activities')
        .insert([mapToDB(activity)])
        .select()
        .single()
      if (error) throw error
      return mapFromDB(data)
    },
    update: async (id: string, activity: any) => {
      const { data, error } = await supabase
        .from('activities')
        .update(mapToDB(activity))
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return mapFromDB(data)
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('activities').delete().eq('id', id)
      if (error) throw error
    },
    bulkDelete: async (ids: string[]) => {
      const { error } = await supabase.from('activities').delete().in('id', ids)
      if (error) throw error
    },
  },
  users: {
    list: async () => {
      const { data, error } = await supabase.from('profiles').select('*')
      if (error) throw error
      return (data || []).map((p) => ({
        id: p.id,
        email: p.email,
        name: p.name,
        role: p.role,
        jobTitle: p.job_title,
        avatarUrl: p.avatar_url,
      }))
    },
    update: async (id: string, updates: any) => {
      const payload: any = {}
      if (updates.name) payload.name = updates.name
      if (updates.role) payload.role = updates.role
      if (updates.jobTitle) payload.job_title = updates.jobTitle
      if (updates.avatarUrl) payload.avatar_url = updates.avatarUrl

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    create: async (payload: any) => {
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: { action: 'create', payload },
      })
      if (error) throw error
      if (data.error) throw new Error(data.error)
      return data
    },
    delete: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: { action: 'delete', payload: { id } },
      })
      if (error) throw error
      if (data.error) throw new Error(data.error)
      return data
    },
  },
  video: {
    list: async () => {
      const { data, error } = await supabase.from('video_records').select('*')
      if (error) throw error
      return data
    },
    save: async (record: any) => {
      const { data: existing } = await supabase
        .from('video_records')
        .select('id')
        .eq('date', record.date)
        .maybeSingle()
      if (existing) {
        const { data, error } = await supabase
          .from('video_records')
          .update(record)
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('video_records')
          .insert([record])
          .select()
          .single()
        if (error) throw error
        return data
      }
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('video_records').delete().eq('id', id)
      if (error) throw error
    },
  },
  obs: {
    list: async () => {
      const { data, error } = await supabase.from('obs_records').select('*')
      if (error) throw error
      return (data || []).map((r: any) => ({
        id: r.id,
        date: r.date,
        sinistrosVitimas: r.sinistros_vitimas,
        sinistrosTotal: r.sinistros_total,
        autosInfracao: r.autos_infracao,
        homicidios: r.homicidios,
        violenciaDomestica: r.violencia_domestica,
        roubos: r.roubos,
      }))
    },
    save: async (record: any) => {
      const payload = {
        date: record.date,
        sinistros_vitimas: record.sinistrosVitimas,
        sinistros_total: record.sinistrosTotal,
        autos_infracao: record.autosInfracao,
        homicidios: record.homicidios,
        violencia_domestica: record.violenciaDomestica,
        roubos: record.roubos,
      }
      const { data: existing } = await supabase
        .from('obs_records')
        .select('id')
        .eq('date', record.date)
        .maybeSingle()
      if (existing) {
        const { data, error } = await supabase
          .from('obs_records')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('obs_records')
          .insert([payload])
          .select()
          .single()
        if (error) throw error
        return data
      }
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('obs_records').delete().eq('id', id)
      if (error) throw error
    },
  },
  audit: {
    list: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
      if (error) throw error
      return (data || []).map((l: any) => ({
        id: l.id,
        userName: l.user_name,
        userEmail: l.user_email,
        action: l.action,
        timestamp: l.timestamp,
      }))
    },
    add: async (log: any) => {
      const { error } = await supabase.from('audit_logs').insert([
        {
          user_name: log.userName,
          user_email: log.userEmail,
          action: log.action,
        },
      ])
      if (error) throw error
    },
    clear: async () => {
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
    },
  },
}
