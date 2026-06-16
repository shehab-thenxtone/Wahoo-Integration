import { useState, useEffect } from 'react'
import { authApi, type AuthStatus } from '@/lib/api'

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    authApi.status()
      .then(setStatus)
      .catch(() => setStatus({ connected: false, demo_mode: false }))
      .finally(() => setLoading(false))
  }, [])

  async function connect() {
    setConnecting(true)
    try {
      const res = await authApi.connect()
      if (res.demo_mode) {
        setConnecting(false)
        return
      }
      // Redirect to Wahoo OAuth — page will navigate away
      window.location.href = res.auth_url
    } catch {
      setConnecting(false)
    }
  }

  async function disconnect() {
    await authApi.disconnect()
    setStatus({ connected: false, demo_mode: false })
  }

  return { status, loading, connecting, connect, disconnect }
}
