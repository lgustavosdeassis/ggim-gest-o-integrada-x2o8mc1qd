import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const isAuthenticating = useRef(false)

  useEffect(() => {
    let mounted = true

    const clearCorruptedSession = () => {
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
            localStorage.removeItem(key)
          }
        })
      } catch (e) {
        // Ignora erros de acesso ao localStorage
      }
    }

    const isAbortError = (err: any) => {
      const msg = err?.message?.toLowerCase() || ''
      return err?.name === 'AbortError' || msg.includes('abort') || msg.includes('signal')
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_OUT') {
        clearCorruptedSession()
      }

      setSession(session)
      // Mantém a mesma referência de objeto se o ID do usuário não mudou, evitando re-renders infinitos
      setUser((prevUser) =>
        prevUser?.id === session?.user?.id ? prevUser : (session?.user ?? null),
      )
      setLoading(false)
    })

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          if (isAbortError(error)) {
            console.warn('Busca de sessão interrompida (abort): ignorando silenciosamente.')
          } else {
            console.warn('Erro ao recuperar sessão:', error)
            // Não desloga o usuário por falha de rede/timeout, apenas por token inválido
            if (
              error.name === 'AuthSessionMissingError' ||
              error.message?.toLowerCase().includes('invalid') ||
              error.message?.toLowerCase().includes('expired') ||
              error.message?.toLowerCase().includes('corrupted')
            ) {
              console.warn('Limpando sessão devido a falha de validação de token.')
              clearCorruptedSession()
              if (mounted) {
                setSession(null)
                setUser(null)
              }
              return
            }
          }
        }

        if (mounted) {
          setSession(data?.session ?? null)
          setUser((prevUser) =>
            prevUser?.id === data?.session?.user?.id ? prevUser : (data?.session?.user ?? null),
          )
        }
      } catch (err: any) {
        if (!isAbortError(err)) {
          console.warn('Exceção ao recuperar sessão (possível falha de rede/CORS):', err)
        }
        // Em exceções puras de rede (ex: Failed to fetch), preservamos o estado para manter resiliência
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/` },
      })
      return { error }
    } catch (error: any) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    // Lock local de autenticação para não enfileirar requisições repetidas na UI
    if (isAuthenticating.current) {
      const err = new Error('AbortError')
      err.name = 'AbortError'
      return { error: err }
    }

    isAuthenticating.current = true
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error }
    } catch (error: any) {
      return { error }
    } finally {
      isAuthenticating.current = false
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error: any) {
      return { error }
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
