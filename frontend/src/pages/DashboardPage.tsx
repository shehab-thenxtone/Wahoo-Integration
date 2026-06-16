import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTodayMetrics, useHistoricalMetrics } from '@/hooks/useWahooData'
import { useAuth } from '@/hooks/useAuth'
import { HeartRateWidget } from '@/components/dashboard/HeartRateWidget'
import { HRVWidget } from '@/components/dashboard/HRVWidget'
import { RecoveryWidget } from '@/components/dashboard/RecoveryWidget'
import { StrainWidget } from '@/components/dashboard/StrainWidget'
import { ActivityTable } from '@/components/dashboard/ActivityTable'
import { PageLoader } from '@/components/ui/Loader'

const RANGE_OPTIONS = [7, 14, 30] as const
type Range = typeof RANGE_OPTIONS[number]

export function DashboardPage() {
  const [days, setDays] = useState<Range>(30)
  const { status, disconnect } = useAuth()
  const { data: today, loading: todayLoading } = useTodayMetrics()
  const { data: history, loading: histLoading } = useHistoricalMetrics(days)
  const navigate = useNavigate()

  async function handleDisconnect() {
    await disconnect()
    navigate('/')
  }

  if (todayLoading || histLoading) return <PageLoader />

  const hr = history?.heart_rate_history ?? []
  const recovery = history?.recovery_history ?? []
  const strain = history?.strain_history ?? []
  const activities = history?.activities ?? []

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-sm border-b border-border px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="Wahoo" className="w-7 h-7" />
            <span className="font-semibold text-white">Wahoo Dashboard</span>
            {status?.demo_mode && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                Demo Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Date range */}
            <div className="flex gap-1 bg-card rounded-lg p-1 border border-border">
              {RANGE_OPTIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    days === d
                      ? 'bg-primary text-surface font-semibold'
                      : 'text-muted hover:text-white'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
            {status?.user_name && (
              <span className="text-sm text-muted hidden sm:block">{status.user_name}</span>
            )}
            {!status?.demo_mode && (
              <button
                onClick={handleDisconnect}
                className="text-xs text-muted hover:text-white border border-border hover:border-danger rounded-lg px-3 py-1.5 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Today summary row */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-muted mb-3">Today</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Resting HR', value: today?.heart_rate?.resting_hr, unit: 'bpm', color: 'oklch(65% 0.21 22)' },
              { label: 'HRV', value: today?.heart_rate?.heart_rate_variability_rmssd, unit: 'ms', color: 'oklch(70% 0.18 295)' },
              { label: 'Recovery', value: today?.recovery?.recovery_score, unit: '%', color: 'oklch(65% 0.20 250)' },
              { label: 'Strain', value: today?.strain?.strain, unit: `/ 100 · ${today?.strain?.zone ?? ''}`, color: 'oklch(72% 0.21 60)' },
            ].map(m => (
              <div key={m.label} className="bg-card border border-border rounded-xl p-4" style={{ borderTopColor: m.color, borderTopWidth: 2 }}>
                <p className="text-xs uppercase tracking-wider" style={{ color: m.color }}>{m.label}</p>
                <p className="font-mono text-3xl font-medium tabular-nums text-white mt-1">
                  {m.value ?? '—'}
                </p>
                <p className="text-xs text-muted mt-0.5">{m.unit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Main widget grid */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-muted mb-3">Last {days} Days</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <HeartRateWidget today={today?.heart_rate} history={hr} />
            <HRVWidget today={today?.heart_rate} history={hr} />
            <RecoveryWidget today={today?.recovery} history={recovery} />
            <StrainWidget today={today?.strain} history={strain} />
          </div>
        </section>

        {/* Activities */}
        <section>
          <div className="grid grid-cols-1 gap-4">
            <ActivityTable activities={activities} />
          </div>
        </section>
      </main>
    </div>
  )
}
