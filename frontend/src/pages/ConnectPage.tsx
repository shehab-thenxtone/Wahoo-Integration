import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/ui/Loader'

export function ConnectPage() {
  const { status, loading, connect } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && status?.connected) {
      navigate('/dashboard', { replace: true })
    }
  }, [status, loading, navigate])

  const params = new URLSearchParams(window.location.search)
  const error = params.get('error')

  if (loading) return <PageLoader />

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* App icon + title */}
        <div className="flex flex-col items-center mb-10">
          <img src="/favicon.svg" alt="Wahoo Dashboard" className="w-16 h-16 mb-4" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Wahoo Dashboard</h1>
          <p className="mt-2 text-muted text-center">
            Connect your Wahoo account to visualize your performance metrics
          </p>
        </div>

        {/* Feature highlights */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-3">
          {[
            { icon: '❤️', label: 'Heart Rate', desc: 'Real-time BPM, zones & HRV trends' },
            { icon: '🔋', label: 'Recovery', desc: '0–100% score with sleep, HRV, RHR drivers' },
            { icon: '⚡', label: 'Daily Strain', desc: 'Exertion gauge with 30-day history' },
            { icon: '🏃', label: 'Activities', desc: 'Sortable table with CSV export' },
          ].map(f => (
            <div key={f.label} className="flex items-start gap-3">
              <span className="text-xl">{f.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{f.label}</p>
                <p className="text-xs text-muted">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
            Connection error: {error}. Please try again.
          </div>
        )}

        <button
          onClick={connect}
          className="w-full py-3 px-6 rounded-xl font-semibold text-surface text-base transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'oklch(62% 0.22 195)' }}
        >
          Connect Wahoo Account
        </button>

        <p className="mt-3 text-center text-xs text-muted">
          No credentials yet? App runs in{' '}
          <span className="text-primary">demo mode</span> automatically.
        </p>
      </div>
    </main>
  )
}
