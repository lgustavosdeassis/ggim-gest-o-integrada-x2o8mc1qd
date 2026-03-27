import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

const customFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const urlString = url.toString()
  const isAuthRequest = urlString.includes('/auth/v1/')

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
        } catch (e) {}
      } else {
        options.signal.addEventListener('abort', () => {
          try {
            controller.abort(options.signal?.reason || new Error('Aborted by client'))
          } catch (e) {}
        })
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error: any) {
      clearTimeout(timeoutId)

      const isAbort =
        error?.name === 'AbortError' ||
        error?.message?.toLowerCase().includes('abort') ||
        error?.message?.toLowerCase().includes('signal')

      const isTimeout =
        error?.name === 'TimeoutError' || error?.message?.toLowerCase().includes('timeout')

      // Sem retentativas para requisições de autenticação para evitar race conditions do gotrue
      const maxRetries = isAuthRequest ? 0 : 2

      if ((isTimeout || !isAbort) && retryCount < maxRetries && !options?.signal?.aborted) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)))
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
