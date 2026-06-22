import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { powerZonesApi, type PowerZone } from '@/lib/api'
import { Footer } from '@/components/ui/Footer'

const ZONE_LABELS = ['Active Recovery', 'Endurance', 'Tempo', 'Threshold', 'VO₂ Max', 'Anaerobic', 'Neuromuscular']
const ZONE_COLORS = [
  'oklch(65% 0.20 250)',
  'oklch(70% 0.18 140)',
  'oklch(72% 0.21 60)',
  'oklch(65% 0.21 22)',
  'oklch(62% 0.22 195)',
  'oklch(70% 0.18 295)',
  'oklch(60% 0.22 15)',
]

function zoneRange(pz: PowerZone, index: number): { lo: number; hi: number | null } {
  const vals = [pz.zone_1, pz.zone_2, pz.zone_3, pz.zone_4, pz.zone_5, pz.zone_6, pz.zone_7]
  const lo = index === 0 ? 0 : (vals[index - 1] ?? 0)
  const hi = vals[index] ?? null
  return { lo, hi }
}

export function PowerZonesPage() {
  const navigate = useNavigate()
  const [zones, setZones] = useState<PowerZone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    powerZonesApi.list()
      .then(setZones)
      .catch(() => setZones([]))
      .finally(() => setLoading(false))
  }, [])

  const pz = zones[0] ?? null
  const count = pz?.zone_count ?? 7
  const maxWatts = pz ? (pz.zone_6 ?? pz.ftp ?? 400) : 400

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-muted hover:text-white transition-colors text-sm">
            ← Dashboard
          </button>
          <h1 className="text-lg font-semibold text-white">Power Zones</h1>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 space-y-8">
        {loading ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : !pz ? (
          <p className="text-muted text-sm">No power zone data available. Connect a power meter and complete a test.</p>
        ) : (
          <>
            {/* FTP & Critical Power cards */}
            <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-card border border-border rounded-xl p-5" style={{ borderTopColor: 'oklch(62% 0.22 195)', borderTopWidth: 2 }}>
                <p className="text-xs uppercase tracking-wider text-muted mb-1">FTP</p>
                <p className="font-mono text-3xl font-semibold text-white">{pz.ftp ?? '—'}</p>
                <p className="text-xs text-muted mt-0.5">watts</p>
              </div>
              {pz.critical_power && (
                <div className="bg-card border border-border rounded-xl p-5" style={{ borderTopColor: 'oklch(65% 0.21 22)', borderTopWidth: 2 }}>
                  <p className="text-xs uppercase tracking-wider text-muted mb-1">Critical Power</p>
                  <p className="font-mono text-3xl font-semibold text-white">{pz.critical_power}</p>
                  <p className="text-xs text-muted mt-0.5">watts</p>
                </div>
              )}
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs uppercase tracking-wider text-muted mb-1">Last updated</p>
                <p className="font-semibold text-white text-sm">
                  {pz.updated_at ? new Date(pz.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </p>
                <p className="text-xs text-muted mt-0.5">{count} zones</p>
              </div>
            </section>

            {/* Zone bars */}
            <section className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-xs uppercase tracking-widest text-muted">Training Zones</h2>
              {Array.from({ length: count }, (_, i) => {
                const { lo, hi } = zoneRange(pz, i)
                const label = ZONE_LABELS[i] ?? `Zone ${i + 1}`
                const color = ZONE_COLORS[i] ?? ZONE_COLORS[ZONE_COLORS.length - 1]
                const barPct = hi === null ? 100 : Math.min(100, Math.round((hi / maxWatts) * 100))
                const loBarPct = Math.min(100, Math.round((lo / maxWatts) * 100))
                const width = Math.max(4, barPct - loBarPct)
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                          style={{ background: color, color: 'oklch(15% 0 0)' }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-white font-medium">{label}</span>
                      </div>
                      <span className="font-mono text-muted">
                        {lo}–{hi === null || hi >= 900 ? '∞' : hi} W
                      </span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          marginLeft: `${loBarPct}%`,
                          width: `${width}%`,
                          background: color,
                          opacity: 0.85,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </section>

            <p className="text-xs text-muted text-center">
              Power zones are set from your Functional Threshold Power (FTP). Re-test every 6–8 weeks or after a significant fitness change.
            </p>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
