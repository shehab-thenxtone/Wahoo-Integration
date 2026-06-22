import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workoutsApi, type Activity } from '@/lib/api'
import { Footer } from '@/components/ui/Footer'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const TYPE_COLORS: Record<string, string> = {
  Running: 'oklch(65% 0.21 22)',
  Cycling: 'oklch(62% 0.22 195)',
  Swimming: 'oklch(65% 0.20 250)',
  Hiking: 'oklch(70% 0.18 140)',
}
const DEFAULT_COLOR = 'oklch(72% 0.21 60)'

function typeColor(t: string) {
  return TYPE_COLORS[t] ?? DEFAULT_COLOR
}

function weekLabel(dateStr: string) {
  const d = new Date(dateStr)
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function buildWeeklyVolume(acts: Activity[]) {
  const map = new Map<string, { label: string; duration: number; distance: number; calories: number }>()
  for (const a of acts) {
    const lbl = weekLabel(a.date)
    const cur = map.get(lbl) ?? { label: lbl, duration: 0, distance: 0, calories: 0 }
    cur.duration += a.duration_minutes
    cur.distance += a.distance_km ?? 0
    cur.calories += a.calories_burned ?? 0
    map.set(lbl, cur)
  }
  return Array.from(map.values()).reverse()
}

function buildTypeBreakdown(acts: Activity[]) {
  const map = new Map<string, number>()
  for (const a of acts) map.set(a.type, (map.get(a.type) ?? 0) + 1)
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }))
}

export function WorkoutsPage() {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    setLoading(true)
    workoutsApi.analytics(days)
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setLoading(false))
  }, [days])

  const totalDuration = activities.reduce((s, a) => s + a.duration_minutes, 0)
  const totalDistance = activities.reduce((s, a) => s + (a.distance_km ?? 0), 0)
  const totalCalories = activities.reduce((s, a) => s + (a.calories_burned ?? 0), 0)
  const avgHR = activities.filter(a => a.avg_heart_rate).length
    ? Math.round(activities.reduce((s, a) => s + (a.avg_heart_rate ?? 0), 0) / activities.filter(a => a.avg_heart_rate).length)
    : null

  const weeklyVolume = buildWeeklyVolume(activities)
  const typeBreakdown = buildTypeBreakdown(activities)

  const bestPower = activities.reduce<number | null>((best, a) => {
    const v = a.power_avg ?? a.normalized_power
    if (!v) return best
    return best === null || v > best ? v : best
  }, null)

  const bestDistance = activities.reduce<number | null>((best, a) => {
    if (!a.distance_km) return best
    return best === null || a.distance_km > best ? a.distance_km : best
  }, null)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-muted hover:text-white transition-colors text-sm">
              ← Dashboard
            </button>
            <h1 className="text-lg font-semibold text-white">Workout Analytics</h1>
          </div>
          <div className="flex gap-1 bg-card rounded-lg p-1 border border-border">
            {([7, 14, 30] as const).map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${days === d ? 'bg-primary text-surface font-semibold' : 'text-muted hover:text-white'}`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Summary stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Workouts', value: String(activities.length), unit: 'sessions', color: 'oklch(62% 0.22 195)' },
            { label: 'Total time', value: `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`, unit: 'duration', color: 'oklch(65% 0.21 22)' },
            { label: 'Distance', value: `${totalDistance.toFixed(1)}`, unit: 'km', color: 'oklch(72% 0.21 60)' },
            { label: 'Calories', value: totalCalories.toLocaleString(), unit: 'kcal', color: 'oklch(70% 0.18 295)' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4" style={{ borderTopColor: s.color, borderTopWidth: 2 }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: s.color }}>{s.label}</p>
              <p className="font-mono text-2xl font-semibold text-white">{loading ? '—' : s.value}</p>
              <p className="text-xs text-muted mt-0.5">{s.unit}</p>
            </div>
          ))}
        </section>

        {/* PRs row */}
        {(bestPower !== null || bestDistance !== null || avgHR !== null) && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-muted mb-3">Personal Bests · Last {days} days</h2>
            <div className="flex flex-wrap gap-3">
              {bestPower !== null && (
                <div className="bg-card border border-border rounded-xl px-5 py-3 flex items-center gap-3">
                  <span className="text-lg">⚡</span>
                  <div>
                    <p className="text-xs text-muted">Peak power avg</p>
                    <p className="font-mono font-semibold text-white">{bestPower} W</p>
                  </div>
                </div>
              )}
              {bestDistance !== null && (
                <div className="bg-card border border-border rounded-xl px-5 py-3 flex items-center gap-3">
                  <span className="text-lg">📍</span>
                  <div>
                    <p className="text-xs text-muted">Longest workout</p>
                    <p className="font-mono font-semibold text-white">{bestDistance.toFixed(1)} km</p>
                  </div>
                </div>
              )}
              {avgHR !== null && (
                <div className="bg-card border border-border rounded-xl px-5 py-3 flex items-center gap-3">
                  <span className="text-lg">❤️</span>
                  <div>
                    <p className="text-xs text-muted">Avg HR across sessions</p>
                    <p className="font-mono font-semibold text-white">{avgHR} bpm</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Weekly volume chart */}
          <section className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Weekly Volume (min)</h2>
            {loading ? (
              <div className="h-40 flex items-center justify-center text-muted text-sm">Loading…</div>
            ) : weeklyVolume.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weeklyVolume} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fill: 'oklch(60% 0 0)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'oklch(60% 0 0)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'oklch(18% 0 0)', border: '1px solid oklch(25% 0 0)', borderRadius: 8, color: '#fff', fontSize: 12 }}
                    formatter={(v: number) => [`${v} min`, 'Duration']}
                  />
                  <Bar dataKey="duration" radius={[4, 4, 0, 0]} fill="oklch(62% 0.22 195)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          {/* Activity type breakdown */}
          <section className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Activity Types</h2>
            {loading ? (
              <div className="h-40 flex items-center justify-center text-muted text-sm">Loading…</div>
            ) : typeBreakdown.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={typeBreakdown} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fill: 'oklch(60% 0 0)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="type" tick={{ fill: 'oklch(75% 0 0)', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip
                    contentStyle={{ background: 'oklch(18% 0 0)', border: '1px solid oklch(25% 0 0)', borderRadius: 8, color: '#fff', fontSize: 12 }}
                    formatter={(v: number) => [`${v} sessions`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {typeBreakdown.map(entry => (
                      <Cell key={entry.type} fill={typeColor(entry.type)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>
        </div>

        {/* Activity list */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-muted mb-3">Recent Activities</h2>
          <div className="space-y-2">
            {loading ? (
              <p className="text-muted text-sm">Loading…</p>
            ) : activities.length === 0 ? (
              <p className="text-muted text-sm">No activities in this period.</p>
            ) : activities.map(a => (
              <div key={a.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-4">
                <div
                  className="w-2 h-8 rounded-full flex-shrink-0"
                  style={{ background: typeColor(a.type) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm">{a.type}</span>
                    <span className="text-xs text-muted">{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-0.5">
                    <span className="text-xs text-muted">{a.duration_minutes} min</span>
                    {a.distance_km !== undefined && a.distance_km !== null && <span className="text-xs text-muted">{a.distance_km.toFixed(1)} km</span>}
                    {a.avg_heart_rate && <span className="text-xs text-muted">{a.avg_heart_rate} bpm avg</span>}
                    {a.power_avg && <span className="text-xs text-muted">{a.power_avg} W avg</span>}
                    {a.calories_burned && <span className="text-xs text-muted">{a.calories_burned} kcal</span>}
                  </div>
                </div>
                {a.training_stress_score && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted">TSS</p>
                    <p className="font-mono font-semibold text-white text-sm">{a.training_stress_score}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
