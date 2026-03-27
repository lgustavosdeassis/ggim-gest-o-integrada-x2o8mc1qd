import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

const customFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  let retryCount = 0
  const maxRetries = 3

  while (true) {
    try {
      const response = await fetch(url, options)

      // Tratamento para Cold Start do banco: intercepts 502, 503 e 504 e tenta novamente
      if (!response.ok && [502, 503, 504].includes(response.status) && retryCount < maxRetries) {
        if (options?.signal?.aborted) {
          return response
        }
        retryCount++
        const delay = Math.pow(2, retryCount) * 1000 // Backoff progressivo: 2s, 4s, 8s
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      return response
    } catch (error: any) {
      const isAbort =
        error?.name === 'AbortError' ||
        error?.message?.toLowerCase().includes('abort') ||
        error?.message?.toLowerCase().includes('signal')

      if (!isAbort && retryCount < maxRetries && !options?.signal?.aborted) {
        retryCount++
        const delay = Math.pow(2, retryCount) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      throw error
    }
  }
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: customFetch,
  },
})
