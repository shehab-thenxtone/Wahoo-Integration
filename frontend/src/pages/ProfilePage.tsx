import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, type WahooUser } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Footer } from '@/components/ui/Footer'

export function ProfilePage() {
  const { status, disconnect } = useAuth()
  const [user, setUser] = useState<WahooUser | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    authApi.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function handleDisconnect() {
    await disconnect()
    navigate('/')
  }

  const displayName = user?.name
    ?? (user?.first && user?.last ? `${user.first} ${user.last}` : undefined)
    ?? user?.first_name
    ?? status?.user_name
    ?? 'Wahoo Athlete'

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')

  const ageYears = user?.birth
    ? Math.floor((Date.now() - new Date(user.birth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null

  const memberSince = user?.created_at
    ? new Date(user.created_at).getFullYear()
    : null

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-muted hover:text-white transition-colors text-sm"
            aria-label="Back to dashboard"
          >
            ← Dashboard
          </button>
          <h1 className="text-lg font-semibold text-white">Profile</h1>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Avatar + name */}
        <section className="flex items-center gap-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, oklch(62% 0.22 195), oklch(65% 0.21 22))' }}
            aria-hidden
          >
            {loading ? '…' : initials}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {loading ? '—' : displayName}
            </h2>
            {user?.email && (
              <p className="text-muted text-sm mt-1">{user.email}</p>
            )}
            {status?.demo_mode && (
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                Demo Mode
              </span>
            )}
          </div>
        </section>

        {/* Bio stats */}
        {(user?.height || user?.weight || user?.birth || user?.gender !== undefined || memberSince) && (
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {user?.height && (
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-muted mb-1">Height</p>
                <p className="text-2xl font-mono font-semibold text-white">{Math.round(user.height * 100)}</p>
                <p className="text-xs text-muted">cm</p>
              </div>
            )}
            {user?.weight && (
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-muted mb-1">Weight</p>
                <p className="text-2xl font-mono font-semibold text-white">{user.weight.toFixed(1)}</p>
                <p className="text-xs text-muted">kg</p>
              </div>
            )}
            {ageYears !== null && (
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-muted mb-1">Age</p>
                <p className="text-2xl font-mono font-semibold text-white">{ageYears}</p>
                <p className="text-xs text-muted">years</p>
              </div>
            )}
            {memberSince !== null && (
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-muted mb-1">Member since</p>
                <p className="text-2xl font-mono font-semibold text-white">{memberSince}</p>
                <p className="text-xs text-muted">{user?.gender === 0 ? 'Male' : user?.gender === 1 ? 'Female' : ''}</p>
              </div>
            )}
          </section>
        )}

        {/* Info cards */}
        <section className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-muted">Account</h3>
            <dl className="space-y-2 text-sm">
              {user?.id && (
                <div className="flex justify-between">
                  <dt className="text-muted">Wahoo ID</dt>
                  <dd className="font-mono text-white">{user.id}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Connection</dt>
                <dd className={status?.connected ? 'text-green-400' : 'text-red-400'}>
                  {status?.connected ? 'Connected' : 'Disconnected'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Mode</dt>
                <dd className="text-white">{status?.demo_mode ? 'Demo' : 'Live'}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-muted">Data</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Health data stored</dt>
                <dd className="text-white">Never</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Session cookie</dt>
                <dd className="text-white">30 days · HttpOnly</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-muted">Privacy policy</dt>
                <dd>
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline transition-colors"
                    style={{ color: 'oklch(62% 0.22 195)' }}
                  >
                    View ↗
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Actions */}
        {!status?.demo_mode && (
          <section className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-xs uppercase tracking-widest text-muted mb-4">Actions</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 text-sm rounded-lg border transition-colors text-muted hover:text-white"
                style={{ borderColor: 'oklch(65% 0.25 25 / 0.4)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'oklch(65% 0.25 25)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'oklch(65% 0.25 25 / 0.4)')}
              >
                Disconnect Wahoo Account
              </button>
              <p className="text-xs text-muted self-center">
                Removes your OAuth tokens and ends the session.
              </p>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
