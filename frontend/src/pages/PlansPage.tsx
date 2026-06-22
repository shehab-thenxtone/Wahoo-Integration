import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { plansApi, type Plan } from '@/lib/api'
import { Footer } from '@/components/ui/Footer'

const FAMILY_LABEL: Record<number, string> = {
  1: 'Running',
  2: 'Cycling',
  3: 'Swimming',
  4: 'Triathlon',
}

export function PlansPage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    plansApi.list()
      .then(data => setPlans(data.filter(p => !p.deleted)))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-muted hover:text-white transition-colors text-sm">
            ← Dashboard
          </button>
          <h1 className="text-lg font-semibold text-white">Training Plans</h1>
          <span className="ml-auto text-xs text-muted">{loading ? '' : `${plans.length} plans`}</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        {loading ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : plans.length === 0 ? (
          <p className="text-muted text-sm">No training plans found. Subscribe to a Wahoo plan to see it here.</p>
        ) : (
          <div className="space-y-3">
            {plans.map(p => {
              const sport = p.workout_type_family_id ? (FAMILY_LABEL[p.workout_type_family_id] ?? 'Workout') : null
              return (
                <div key={p.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold text-white">{p.name ?? 'Unnamed Plan'}</h2>
                    {sport && (
                      <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full border border-border text-muted">
                        {sport}
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <p className="text-sm text-muted leading-relaxed">{p.description}</p>
                  )}
                  {p.created_at && (
                    <p className="text-xs text-muted">
                      Added {new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
