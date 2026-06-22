import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routesApi, type Route } from '@/lib/api'
import { Footer } from '@/components/ui/Footer'

function formatDistance(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`
}

export function RoutesPage() {
  const navigate = useNavigate()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    routesApi.list()
      .then(data => setRoutes(data.filter(r => !r.deleted)))
      .catch(() => setRoutes([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-muted hover:text-white transition-colors text-sm">
            ← Dashboard
          </button>
          <h1 className="text-lg font-semibold text-white">Routes</h1>
          <span className="ml-auto text-xs text-muted">{loading ? '' : `${routes.length} saved`}</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        {loading ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : routes.length === 0 ? (
          <p className="text-muted text-sm">No routes found. Save routes from your Wahoo device to see them here.</p>
        ) : (
          <div className="space-y-3">
            {routes.map(r => (
              <div key={r.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                <div>
                  <h2 className="font-semibold text-white">{r.name ?? 'Unnamed Route'}</h2>
                  {r.description && (
                    <p className="text-sm text-muted mt-1">{r.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-4">
                  {r.distance !== undefined && r.distance !== null && (
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider">Distance</p>
                      <p className="font-mono font-semibold text-white text-sm">{formatDistance(r.distance)}</p>
                    </div>
                  )}
                  {r.ascent !== undefined && r.ascent !== null && (
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider">Ascent</p>
                      <p className="font-mono font-semibold text-white text-sm">↑ {Math.round(r.ascent)} m</p>
                    </div>
                  )}
                  {r.descent !== undefined && r.descent !== null && (
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider">Descent</p>
                      <p className="font-mono font-semibold text-white text-sm">↓ {Math.round(r.descent)} m</p>
                    </div>
                  )}
                  {r.created_at && (
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider">Saved</p>
                      <p className="font-semibold text-white text-sm">
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
