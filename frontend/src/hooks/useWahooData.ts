import { useState, useEffect, useCallback } from 'react'
import { metricsApi, trainingStatusApi, type TodayMetrics, type HistoricalMetrics, type TrainingStatus } from '@/lib/api'

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

  const refresh = useCallback(() => {
    setLoading(true)
    metricsApi.history(days)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [days])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, error, refresh }
}

export function useTrainingStatus() {
  const [data, setData] = useState<TrainingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setLoading(true)
    trainingStatusApi.get()
      .then(setData)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, error, refresh }
}
