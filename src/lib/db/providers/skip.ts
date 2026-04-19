import pb from '@/lib/pocketbase/client'

/**
 * Skip Provider
 * Updated to point to the active Skip Cloud backend endpoint (PocketBase URL)
 * instead of the hardcoded api.goskip.dev, preventing 404 network errors.
 */
export const skipProvider = {
  name: 'skip',
  client: pb,
  init: async () => {
    // Sentry init and incorrect endpoint configurations removed
    console.log(
      'Skip Cloud Provider initialized successfully with',
      import.meta.env.VITE_POCKETBASE_URL,
    )
    return true
  },
  sync: async () => {
    return true
  },
}
