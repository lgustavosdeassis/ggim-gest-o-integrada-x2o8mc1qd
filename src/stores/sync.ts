import { create } from 'zustand'

type SyncStatus = 'idle' | 'syncing' | 'connected' | 'error'

interface SyncState {
  status: SyncStatus
  message: string
  setStatus: (status: SyncStatus, message: string) => void
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'idle',
  message: '',
  setStatus: (status, message) => set({ status, message }),
}))
