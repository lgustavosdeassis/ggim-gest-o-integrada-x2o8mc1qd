import { db } from '@/lib/db/database-service'
import { ActivityRecord } from '@/lib/types'

function mapFromDB(item: any): ActivityRecord {
  if (!item) return item as any
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
    createdAt: item.created,
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
      const data = await db.collection('activities').getFullList({ sort: '-created' })
      return data.map(mapFromDB)
    },
    create: async (activity: any) => {
      const data = await db.collection('activities').create(mapToDB(activity))
      return mapFromDB(data)
    },
    update: async (id: string, activity: any) => {
      const data = await db.collection('activities').update(id, mapToDB(activity))
      return mapFromDB(data)
    },
    delete: async (id: string) => {
      await db.collection('activities').delete(id)
    },
    bulkDelete: async (ids: string[]) => {
      await Promise.all(ids.map((id) => db.collection('activities').delete(id)))
    },
  },
  users: {
    list: async () => {
      const data = await db.collection('users').getFullList()
      return data.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        jobTitle: u.job_title,
        avatarUrl: u.avatar_url,
      }))
    },
    update: async (id: string, updates: any) => {
      const payload: any = {}
      if (updates.name !== undefined) payload.name = updates.name
      if (updates.role !== undefined) payload.role = updates.role
      if (updates.jobTitle !== undefined) payload.job_title = updates.jobTitle
      if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl

      const data = await db.collection('users').update(id, payload)
      return data
    },
    create: async (payload: any) => {
      const data = await db.collection('users').create({
        email: payload.email,
        password: payload.password || 'Skip@Pass',
        passwordConfirm: payload.password || 'Skip@Pass',
        name: payload.name,
        role: payload.role || 'viewer',
        job_title: payload.jobTitle,
      })
      return data
    },
    delete: async (id: string) => {
      await db.collection('users').delete(id)
    },
  },
  video: {
    list: async () => {
      const data = await db.collection('video_records').getFullList({ sort: '-date' })
      return data
    },
    save: async (record: any) => {
      try {
        const res = await db
          .collection('video_records')
          .getList(1, 1, { filter: `date="${record.date}"` })
        if (res.items && res.items.length > 0) {
          return await db.collection('video_records').update(res.items[0].id, record)
        }
        return await db.collection('video_records').create(record)
      } catch {
        return await db.collection('video_records').create(record)
      }
    },
    delete: async (id: string) => {
      await db.collection('video_records').delete(id)
    },
  },
  obs: {
    list: async () => {
      const data = await db.collection('obs_records').getFullList({ sort: '-date' })
      return data.map((r: any) => ({
        id: r.id,
        date: r.date,
        sinistrosVitimas: r.sinistrosVitimas,
        sinistrosTotal: r.sinistrosTotal,
        autosInfracao: r.autosInfracao,
        homicidios: r.homicidios,
        violenciaDomestica: r.violenciaDomestica,
        roubos: r.roubos,
      }))
    },
    save: async (record: any) => {
      const payload = {
        date: record.date,
        sinistrosVitimas: record.sinistrosVitimas,
        sinistrosTotal: record.sinistrosTotal,
        autosInfracao: record.autosInfracao,
        homicidios: record.homicidios,
        violenciaDomestica: record.violenciaDomestica,
        roubos: record.roubos,
      }
      try {
        const res = await db
          .collection('obs_records')
          .getList(1, 1, { filter: `date="${record.date}"` })
        if (res.items && res.items.length > 0) {
          return await db.collection('obs_records').update(res.items[0].id, payload)
        }
        return await db.collection('obs_records').create(payload)
      } catch {
        return await db.collection('obs_records').create(payload)
      }
    },
    delete: async (id: string) => {
      await db.collection('obs_records').delete(id)
    },
  },
  audit: {
    list: async () => {
      const data = await db.collection('audit_logs').getFullList({ sort: '-timestamp' })
      return data.map((l: any) => ({
        id: l.id,
        userName: l.user_name,
        userEmail: l.user_email,
        action: l.action,
        timestamp: l.timestamp,
      }))
    },
    add: async (log: any) => {
      await db.collection('audit_logs').create({
        user_name: log.userName,
        user_email: log.userEmail,
        action: log.action,
        timestamp: new Date().toISOString(),
      })
    },
    clear: async () => {
      const data = await db.collection('audit_logs').getFullList({ fields: 'id' })
      await Promise.all(data.map((d) => db.collection('audit_logs').delete(d.id)))
    },
  },
}
