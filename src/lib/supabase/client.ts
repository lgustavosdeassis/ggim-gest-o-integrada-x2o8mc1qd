import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

// Configuração de timeout customizado e sincronização de sinais para resiliência
const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  const controller = new AbortController()

  const timeoutId = setTimeout(() => {
    try {
      // Passa uma razão para evitar o erro genérico "signal is aborted without reason"
      const err = new Error('Request timeout')
      err.name = 'TimeoutError'
      controller.abort(err)
    } catch (e) {
      controller.abort()
    }
  }, 60000) // Aumentado para 60 segundos para evitar abortos prematuros em conexões lentas ou requisições pesadas

  // Sincroniza o abort signal original enviado pelo Supabase (se houver)
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
    throw error
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
