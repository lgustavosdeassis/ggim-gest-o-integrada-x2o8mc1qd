import { skipProvider } from './providers/skip'
import { supabaseProvider } from './providers/supabase'
import { localProvider } from './providers/local'

export const databaseConfig = {
  // Ordered by priority: Skip Cloud > Supabase > Local Cache
  providers: [skipProvider, supabaseProvider, localProvider],
  checkIntervalMs: 5000,
}
