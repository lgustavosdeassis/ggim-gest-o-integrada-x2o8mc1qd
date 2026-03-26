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

async function fetchPaginated(table: string, orderColumn: string, stepSize: number = 100) {
  const allData: any[] = []
  let from = 0
  let hasMore = true
  let retryCount = 0

  while (hasMore) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order(orderColumn, { ascending: false })
        .range(from, from + stepSize - 1)

      if (error) throw error

      if (data && data.length > 0) {
        allData.push(...data)
        from += stepSize
        if (data.length < stepSize) hasMore = false
        retryCount = 0
      } else {
        hasMore = false
      }
    } catch (error) {
      console.warn(
        `Aviso: Erro ao buscar lote ${from}-${from + stepSize - 1} em ${table}. Retentando...`,
        error,
      )
      retryCount++
      if (retryCount > 3) {
        console.error(
          `Falha ao buscar ${table} após 3 tentativas. Interrompendo busca para este lote.`,
        )
        hasMore = false
      } else {
        await new Promise((r) => setTimeout(r, 2000 * retryCount))
      }
    }
  }
  return allData
}

export const api = {
  activities: {
    list: async () => {
      // Chunk de 25 registros para evitar erros de limite de memória no payload devido aos arquivos base64
      const data = await fetchPaginated('activities', 'created_at', 25)
      return data.map(mapFromDB)
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
      const data = await fetchPaginated('video_records', 'date', 200)
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
      const data = await fetchPaginated('obs_records', 'date', 200)
      return data.map((r: any) => ({
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
      const data = await fetchPaginated('audit_logs', 'timestamp', 500)
      return data.map((l: any) => ({
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
