import { Card } from '@/components/ui/Card'
import { ChartInfo } from '@/components/ui/ChartInfo'
import { clamp } from '@/lib/utils'
import type { WeeklySummary, FitnessMetrics, TrainingCapacityMetrics } from '@/lib/api'

const COLOR_WEEK = 'oklch(62% 0.22 195)'
const COLOR_FITNESS = 'oklch(70% 0.18 295)'
const COLOR_FATIGUED = 'oklch(65% 0.21 22)'
const COLOR_FRESH = 'oklch(62% 0.22 195)'

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function DeltaBadge({ value }: { value: number }) {
  const positive = value >= 0
  const color = positive ? COLOR_FRESH : COLOR_FATIGUED
  const sign = positive ? '+' : ''
  return (
    <span className="text-xs font-mono tabular-nums font-semibold" style={{ color }}>
      {sign}{value}
    </span>
  )
}

// ── My Week ───────────────────────────────────────────────────────────────────

export function MyWeekCard({ data }: { data?: WeeklySummary | null }) {
  const stats = [
    { label: 'Activities', value: data?.activities_count ?? '—' },
    { label: 'Duration', value: data ? formatDuration(data.duration_minutes) : '—' },
    { label: 'Distance', value: data ? `${data.distance_km.toFixed(1)} km` : '—' },
  ]

  return (
    <Card accent={COLOR_WEEK}>
      <p className="metric-label mb-3" style={{ color: COLOR_WEEK }}>My Week</p>
      <div className="grid grid-cols-3 gap-2">
        {stats.map(s => (
          <div key={s.label}>
            <p className="font-mono text-2xl font-medium tabular-nums text-white leading-tight">
              {s.value}
            </p>
            <p className="text-xs text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ── Fitness (CTL) ─────────────────────────────────────────────────────────────

export function FitnessCard({ data }: { data?: FitnessMetrics | null }) {
  return (
    <Card accent={COLOR_FITNESS}>
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <p className="metric-label" style={{ color: COLOR_FITNESS }}>Fitness</p>
          <ChartInfo
            color={COLOR_FITNESS}
            title="Fitness (CTL)"
            description="Chronic Training Load — 42-day exponential weighted average of daily Training Stress Score. Higher CTL means more aerobic fitness base. It declines when you rest and grows with consistent training. Calibrating = fewer than 14 days of TSS data available."
          />
        </div>
        {data?.calibrating && (
          <span
            className="text-xs px-1.5 py-0.5 rounded border"
            style={{
              color: COLOR_FITNESS,
              borderColor: 'oklch(70% 0.18 295 / 35%)',
              background: 'oklch(70% 0.18 295 / 10%)',
            }}
          >
            Calibrating
          </span>
        )}
      </div>

      <p className="font-mono text-5xl font-medium tabular-nums text-white mt-1 leading-none">
        {data ? data.ctl.toFixed(1) : '—'}
      </p>
      <p className="text-xs text-muted mt-0.5">CTL · chronic training load</p>

      {data && (
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted w-16">This week</span>
            <DeltaBadge value={data.week_change} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted w-16">Today</span>
            <DeltaBadge value={data.day_change} />
          </div>
        </div>
      )}
    </Card>
  )
}

// ── Training Capacity (TSB / Form) ────────────────────────────────────────────

export function TrainingCapacityCard({ data }: { data?: TrainingCapacityMetrics | null }) {
  const tsb = data?.value ?? 0
  const clamped = clamp(tsb, -100, 100)
  const tickPct = ((clamped + 100) / 200) * 100
  const isNegative = clamped < 0
  const accentColor = isNegative ? COLOR_FATIGUED : COLOR_FRESH

  const orangeWidth = isNegative ? tickPct : 50
  const blueWidth = isNegative ? 0 : tickPct - 50

  const statusLabel = tsb > 5
    ? 'Fresh — ready for intensity'
    : tsb < -5
    ? 'Fatigued — manage load'
    : 'Neutral'

  return (
    <Card accent={accentColor}>
      <div className="flex items-center gap-1.5 mb-1">
        <p className="metric-label" style={{ color: accentColor }}>Training Capacity</p>
        <ChartInfo
          color={accentColor}
          title="Training Capacity (Form / TSB)"
          description="Training Stress Balance = Fitness (CTL) minus Fatigue (ATL, 7-day load). Positive = fresh and ready for hard efforts. Negative = accumulated fatigue. Gauge spans -100 (overreached) to +100 (fully rested). Optimal performance typically occurs between -10 and +5."
        />
      </div>

      <div className="flex items-end gap-3 mt-1">
        <p className="font-mono text-5xl font-medium tabular-nums text-white leading-none">
          {data ? tsb.toFixed(1) : '—'}
        </p>
        {data && (
          <div className="pb-1.5">
            <DeltaBadge value={data.day_change} />
            <p className="text-xs text-muted">today</p>
          </div>
        )}
      </div>
      <p className="text-xs text-muted mt-0.5">{statusLabel}</p>

      {/* Gradient gauge */}
      <div className="mt-4">
        <div
          className="relative h-2 rounded-full overflow-hidden"
          style={{ background: 'oklch(22% 0.02 260)' }}
          role="img"
          aria-label={`Training capacity gauge: ${tsb.toFixed(1)}`}
        >
          {/* Orange fatigued fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-l-full"
            style={{
              width: `${orangeWidth}%`,
              background: COLOR_FATIGUED,
              opacity: isNegative ? 1 : 0.2,
              transition: 'width 0.5s ease',
            }}
          />
          {/* Blue fresh fill */}
          <div
            className="absolute inset-y-0"
            style={{
              left: '50%',
              width: `${blueWidth}%`,
              background: COLOR_FRESH,
              transition: 'width 0.5s ease',
            }}
          />
          {/* Zero line */}
          <div
            className="absolute inset-y-0 w-px"
            style={{ left: '50%', background: 'oklch(38% 0.03 260)' }}
          />
          {/* Value tick */}
          {data && (
            <div
              className="absolute inset-y-0 w-0.5 rounded-full"
              style={{
                left: `${tickPct}%`,
                transform: 'translateX(-50%)',
                background: 'oklch(92% 0 0)',
                transition: 'left 0.5s ease',
              }}
            />
          )}
        </div>

        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] font-mono tabular-nums" style={{ color: COLOR_FATIGUED }}>-100</span>
          <span className="text-[10px] font-mono tabular-nums text-muted">0</span>
          <span className="text-[10px] font-mono tabular-nums" style={{ color: COLOR_FRESH }}>100</span>
        </div>
      </div>
    </Card>
  )
}
