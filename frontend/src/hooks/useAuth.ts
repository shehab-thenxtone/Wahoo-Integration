import { useState, useEffect } from 'react'
import { authApi, type AuthStatus } from '@/lib/api'

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authApi.status()
      .then(setStatus)
      .catch(() => setStatus({ connected: false, demo_mode: false }))
      .finally(() => setLoading(false))
  }, [])

  async function connect() {
    const res = await authApi.connect()
    if (res.demo_mode) return
    window.location.href = res.auth_url
  }

  async function disconnect() {
    await authApi.disconnect()
    setStatus({ connected: false, demo_mode: false })
  }

  return { status, loading, connect, disconnect }
}
