import pb from '@/lib/pocketbase/client'
import { supabaseProvider } from '@/lib/db/providers/supabase'

export const DatabaseService = {
  async detectarBanco(): Promise<'skip' | 'supabase'> {
    try {
      await pb.health.check()
      return 'skip'
    } catch (err: any) {
      if (err?.status && err.status > 0) {
        return 'skip'
      }
    }

    try {
      const isSupa = await supabaseProvider.connect()
      if (isSupa) return 'supabase'
    } catch (e) {
      // Falha silenciosa, lançará erro padrão abaixo
    }

    throw new Error('Nenhum banco de dados conectado')
  },

  async salvarAtividade(dados: any, id?: string | null) {
    const banco = await DatabaseService.detectarBanco()

    if (banco === 'skip') {
      if (id) {
        return await pb.collection('activities').update(id, dados)
      } else {
        return await pb.collection('activities').create(dados)
      }
    } else if (banco === 'supabase') {
      if (id) {
        return await supabaseProvider.update('activities', id, dados)
      } else {
        return await supabaseProvider.create('activities', dados)
      }
    }
  },

  async buscarAtividades() {
    const banco = await DatabaseService.detectarBanco()

    if (banco === 'skip') {
      return await pb.collection('activities').getFullList()
    } else if (banco === 'supabase') {
      return await supabaseProvider.getFullList('activities')
    }

    return []
  },
}
