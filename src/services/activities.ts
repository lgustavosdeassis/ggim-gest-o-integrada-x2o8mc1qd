import pb from '@/lib/pocketbase/client'

export const getActivities = () => pb.collection('activities').getFullList()
export const getActivity = (id: string) => pb.collection('activities').getOne(id)
export const createActivity = (data: any) => pb.collection('activities').create(data)
export const updateActivity = (id: string, data: any) =>
  pb.collection('activities').update(id, data)
export const deleteActivity = (id: string) => pb.collection('activities').delete(id)
