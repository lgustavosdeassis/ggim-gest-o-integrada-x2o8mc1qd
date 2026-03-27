import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

const customFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  // Timeout ampliado para 60 segundos para suportar "cold starts" de instâncias pausadas
  const timeoutLimit = 60000

  const executeFetch = async (retryCount = 0): Promise<Response> => {
    const controller = new AbortController()

    const timeoutId = setTimeout(() => {
      try {
        const err = new Error('Request timeout')
        err.name = 'TimeoutError'
        controller.abort(err)
      } catch (e) {
        controller.abort()
      }
    }, timeoutLimit)

    if (options?.signal) {
      if (options.signal.aborted) {
        try {
          controller.abort(options.signal.reason || new Error('Aborted by client'))
        } catch (e) {
          // ignore error
        }
      } else {
        options.signal.addEventListener('abort', () => {
          try {
            controller.abort(options.signal?.reason || new Error('Aborted by client'))
          } catch (e) {
            // ignore error
          }
        })
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      // Tratamento para Cold Start do banco: intercepts 502, 503 e 504 e tenta novamente
      if (
        !response.ok &&
        [502, 503, 504].includes(response.status) &&
        retryCount < 3 &&
        !options?.signal?.aborted
      ) {
        const delay = Math.pow(2, retryCount) * 1000 // Backoff: 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delay))
        return executeFetch(retryCount + 1)
      }

      return response
    } catch (error: any) {
      clearTimeout(timeoutId)

      const isAbort =
        error?.name === 'AbortError' ||
        error?.message?.toLowerCase().includes('abort') ||
        error?.message?.toLowerCase().includes('signal')

      const isTimeout =
        error?.name === 'TimeoutError' ||
        error?.message?.toLowerCase().includes('timeout') ||
        error?.message?.toLowerCase().includes('network') ||
        error?.message?.toLowerCase().includes('fetch')

      // Sem restrição de rotas: em caso de erro 5xx ou timeout, tenta novamente até 3x
      const maxRetries = 3

      if ((isTimeout || !isAbort) && retryCount < maxRetries && !options?.signal?.aborted) {
        const delay = Math.pow(2, retryCount) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
        return executeFetch(retryCount + 1)
      }

      throw error
    }
  }

  return executeFetch()
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
