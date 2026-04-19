import { useEffect, useRef } from 'react'
import { db } from '@/lib/db/database-service'

/**
 * Hook for real-time subscriptions to a Unified Database collection.
 * Uses the per-listener pattern so multiple components safely subscribe.
 */
export function useRealtime(
  collectionName: string,
  callback: (data: any) => void,
  enabled: boolean = true,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return

    let unsubscribeFn: (() => void) | undefined
    let cancelled = false

    db.collection(collectionName)
      .subscribe((e: any) => {
        callbackRef.current(e)
      })
      .then((fn) => {
        if (cancelled) {
          if (fn) fn()
        } else {
          unsubscribeFn = fn
        }
      })

    return () => {
      cancelled = true
      if (unsubscribeFn) {
        unsubscribeFn()
      }
    }
  }, [collectionName, enabled])
}

export default useRealtime
