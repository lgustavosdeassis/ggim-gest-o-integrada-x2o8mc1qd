import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

// Gerenciamento de concorrência e resiliência de requisições de autenticação
let authLock = Promise.resolve()
let activeRefreshPromise: Promise<{
  status: number
  statusText: string
  headers: Headers
  body: string
}> | null = null

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const customFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const urlString = url.toString()
  const isAuthRequest = urlString.includes('/auth/v1/')
  const isTokenRefresh = urlString.includes('grant_type=refresh_token')

  const executeFetch = async (retryCount = 0): Promise<Response> => {
    const controller = new AbortController()

    // Timeout estendido para 120s garantindo estabilidade em conexões intermitentes
    const timeoutId = setTimeout(() => {
      try {
        const err = new Error('Request timeout')
        err.name = 'TimeoutError'
        controller.abort(err)
      } catch (e) {
        controller.abort()
      }
    }, 120000)

    if (options?.signal) {
      if (options.signal.aborted) {
        try {
          controller.abort(options.signal.reason || new Error('Aborted by client'))
        } catch (e) {
          controller.abort()
        }
      } else {
        options.signal.addEventListener('abort', () => {
          try {
            controller.abort(options.signal?.reason || new Error('Aborted by client'))
          } catch (e) {
            controller.abort()
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
      return response
    } catch (error: any) {
      clearTimeout(timeoutId)

      const isAbort =
        error?.name === 'AbortError' ||
        error?.message?.toLowerCase().includes('abort') ||
        error?.message?.toLowerCase().includes('signal')

      const isTimeout =
        error?.name === 'TimeoutError' || error?.message?.toLowerCase().includes('timeout')

      // Estratégia de Retry: se for falha de rede/timeout (mas não cancelado ativamente) tenta de novo
      if ((isTimeout || !isAbort) && retryCount < 2 && !options?.signal?.aborted) {
        await sleep(1000 * (retryCount + 1)) // Backoff: 1s, 2s
        return executeFetch(retryCount + 1)
      }

      throw error
    }
  }

  // Controle estrito para endpoints de autenticação (Mutex e Debouncing)
  if (isAuthRequest) {
    // Desduplicação de chamadas de refresh token (ex: disparadas ao mudar de aba)
    if (isTokenRefresh) {
      if (activeRefreshPromise) {
        try {
          const cached = await activeRefreshPromise
          const headers = new Headers()
          cached.headers.forEach((value, key) => headers.append(key, value))

          return new Response(cached.body, {
            status: cached.status,
            statusText: cached.statusText,
            headers: headers,
          })
        } catch (e) {
          // Falhou, tentará na sequência normalmente
        }
      }

      const refreshTask = (async () => {
        const previousLock = authLock
        let releaseLock: () => void
        authLock = new Promise((resolve) => {
          releaseLock = resolve
        })
        try {
          // Aguarda requisições anteriores terminarem (limite de 5s para não travar a fila eternamente)
          await Promise.race([previousLock, sleep(5000)])
          const res = await executeFetch()
          const body = await res.text()

          const headers = new Headers()
          res.headers.forEach((value, key) => headers.append(key, value))

          return {
            status: res.status,
            statusText: res.statusText,
            headers,
            body,
          }
        } finally {
          releaseLock!()
          if (activeRefreshPromise === refreshTask) {
            activeRefreshPromise = null
          }
        }
      })()

      activeRefreshPromise = refreshTask

      try {
        const cached = await refreshTask
        const headers = new Headers()
        cached.headers.forEach((value, key) => headers.append(key, value))

        return new Response(cached.body, {
          status: cached.status,
          statusText: cached.statusText,
          headers,
        })
      } catch (e) {
        throw e
      }
    }

    // Para requisições comuns de auth (ex: signInWithPassword)
    const previousLock = authLock
    let releaseLock: () => void
    authLock = new Promise((resolve) => {
      releaseLock = resolve
    })

    try {
      await Promise.race([previousLock, sleep(5000)])
      return await executeFetch()
    } finally {
      releaseLock!()
    }
  }

  // Consultas não-auth (DB) vão direto para o executor (que já inclui retry)
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
