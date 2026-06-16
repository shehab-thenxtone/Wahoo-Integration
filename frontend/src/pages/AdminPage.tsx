import { useState, useEffect } from 'react'
import { adminApi, type AdminStats } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { RateLimitGauge } from '@/components/admin/RateLimitGauge'
import { RateLimitHistory } from '@/components/admin/RateLimitHistory'
import { PageLoader } from '@/components/ui/Loader'

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshed, setRefreshed] = useState(new Date())

  function load() {
    setLoading(true)
    adminApi.stats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => {
      adminApi.stats().then(setStats).catch(() => {}).then(() => setRefreshed(new Date()))
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  if (loading) return <PageLoader />

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger mb-3">{error}</p>
          <button onClick={load} className="text-sm text-primary hover:underline">Retry</button>
        </div>
      </main>
    )
  }

  if (!stats) return null

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-sm border-b border-border px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="" className="w-6 h-6 opacity-60" />
            <span className="font-semibold text-white">Admin · Rate Limits</span>
            {stats.demo_mode && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning border border-warning/30">
                Demo Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">
              Updated {refreshed.toLocaleTimeString()}
            </span>
            <button
              onClick={load}
              className="text-xs border border-border rounded-lg px-3 py-1.5 text-muted hover:text-white transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Remaining', value: stats.current_rate_limit.remaining, color: stats.current_rate_limit.remaining < 20 ? '#f87171' : '#4ade80', unit: '/ hr' },
            { label: 'Requests Today', value: stats.total_requests_today, color: 'oklch(62% 0.22 195)', unit: 'calls' },
            { label: 'Connected Users', value: stats.connected_users, color: 'oklch(70% 0.18 295)', unit: 'sessions' },
          ].map(k => (
            <Card key={k.label}>
              <p className="text-xs uppercase tracking-wider text-muted">{k.label}</p>
              <p className="font-mono text-4xl font-medium tabular-nums mt-1" style={{ color: k.color }}>{k.value}</p>
              <p className="text-xs text-muted mt-0.5">{k.unit}</p>
            </Card>
          ))}
        </div>

        {/* Gauge + info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card accent="oklch(62% 0.22 195)">
            <h3 className="text-xs uppercase tracking-wider text-muted mb-4">Current Window</h3>
            <RateLimitGauge status={stats.current_rate_limit} />
          </Card>

          <Card accent="oklch(70% 0.18 295)">
            <h3 className="text-xs uppercase tracking-wider text-muted mb-4">Usage Summary</h3>
            <div className="space-y-3 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Limit per hour</span>
                <span className="font-mono text-white">{stats.current_rate_limit.limit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Used this window</span>
                <span className="font-mono text-white">{stats.current_rate_limit.used}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">% consumed</span>
                <span className="font-mono" style={{ color: stats.current_rate_limit.percent_used > 80 ? '#f87171' : stats.current_rate_limit.percent_used > 50 ? '#fbbf24' : '#4ade80' }}>
                  {stats.current_rate_limit.percent_used.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Total calls today</span>
                <span className="font-mono text-white">{stats.total_requests_today}</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(stats.current_rate_limit.percent_used, 100)}%`,
                    background: stats.current_rate_limit.percent_used > 80 ? '#f87171' : stats.current_rate_limit.percent_used > 50 ? '#fbbf24' : '#4ade80',
                  }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* History charts */}
        <Card>
          <RateLimitHistory entries={stats.rate_limit_history} />
        </Card>
      </main>
    </div>
  )
}
