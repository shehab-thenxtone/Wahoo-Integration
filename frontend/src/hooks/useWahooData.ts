import { useState, useEffect, useCallback } from 'react'
import { metricsApi, type TodayMetrics, type HistoricalMetrics } from '@/lib/api'

export function useTodayMetrics() {
  const [data, setData] = useState<TodayMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setLoading(true)
    metricsApi.today()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, error, refresh }
}

export function useHistoricalMetrics(days: number) {
  const [data, setData] = useState<HistoricalMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    metricsApi.history(days)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [days])

  return { data, loading, error }
}
