import pb from '@/lib/pocketbase/client'

/**
 * Database service using PocketBase Client.
 * Replaces the previous custom implementation that attempted to connect
 * to api.goskip.dev and included Sentry browser extension conflicts.
 * By re-exporting `pb` as `db`, we ensure all `api.ts` calls seamlessly
 * communicate with the active Skip Cloud backend endpoint.
 */
export const db = pb
export default db
