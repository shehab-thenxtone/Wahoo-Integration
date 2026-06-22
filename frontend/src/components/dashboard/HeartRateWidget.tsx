import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { ChartInfo } from '@/components/ui/ChartInfo'
import { type HeartRateDailySummary } from '@/lib/api'
import { shortDate } from '@/lib/utils'

interface Props {
  today?: HeartRateDailySummary
  history: HeartRateDailySummary[]
}

const ZONE_COLORS = ['#4ade80', '#60a5fa', '#fbbf24', '#f87171']
const ZONE_LABELS = ['Resting', 'Aerobic', 'Threshold', 'Max']
const COLOR = 'oklch(65% 0.21 22)'

const INFO = {
  title: 'Heart Rate Trends',
  description:
    'Tracks your daily resting, average, and max heart rate over time. A declining resting HR trend signals improving cardiovascular fitness. A spike in resting HR often precedes fatigue or illness — watch it alongside HRV.',
}

export function HeartRateWidget({ today, history }: Props) {
  const chartData = history.map(d => ({
    date: shortDate(d.date),
    resting: d.resting_hr,
    avg: d.avg_hr,
    max: d.max_hr,
    hrv: d.heart_rate_variability_rmssd,
  }))

  const zones = today
    ? [
        today.heart_rate_zones.resting_below_60.percentage,
        today.heart_rate_zones.aerobic_60_100.percentage,
        today.heart_rate_zones.threshold_100_140.percentage,
        today.heart_rate_zones.max_effort_above_140.percentage,
      ]
    : [0, 0, 0, 0]

  return (
    <Card accent={COLOR} className="col-span-2">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="metric-label" style={{ color: COLOR }}>Heart Rate</p>
            <ChartInfo color={COLOR} title={INFO.title} description={INFO.description} />
          </div>
          {today && (
            <div className="flex items-end gap-3 mt-1">
              <span className="font-mono text-5xl font-medium tabular-nums text-white">
                {today.resting_hr}
              </span>
              <span className="text-muted pb-1.5 text-sm">resting BPM</span>
              <span className="ml-2 font-mono text-2xl tabular-nums" style={{ color: COLOR }}>
                {today.max_hr}
              </span>
              <span className="text-muted pb-1 text-xs">max</span>
            </div>
          )}
        </div>
        {today && (
          <div className="text-right">
            <p className="text-xs text-muted">HRV (RMSSD)</p>
            <p className="font-mono text-2xl tabular-nums" style={{ color: 'oklch(70% 0.18 295)' }}>
              {today.heart_rate_variability_rmssd} <span className="text-sm font-sans text-muted">ms</span>
            </p>
          </div>
        )}
      </div>

      {/* Trend chart */}
      <div className="h-36 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="hrMax" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="hrAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: 'oklch(16% 0.02 260)', border: '1px solid oklch(25% 0.03 260)', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Area type="monotone" dataKey="max" stroke="#f87171" strokeWidth={1.5} fill="url(#hrMax)" name="Max HR" isAnimationActive={false} />
            <Area type="monotone" dataKey="avg" stroke="#60a5fa" strokeWidth={2} fill="url(#hrAvg)" name="Avg HR" isAnimationActive={false} />
            <Area type="monotone" dataKey="resting" stroke="#4ade80" strokeWidth={1.5} fill="none" name="Resting HR" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Zone bars */}
      {today && (
        <div className="mt-4">
          <p className="text-xs text-muted mb-2">Time in zone</p>
          <div className="flex gap-1 h-2 rounded-full overflow-hidden">
            {zones.map((pct, i) => (
              <div
                key={i}
                style={{ width: `${pct}%`, backgroundColor: ZONE_COLORS[i] }}
                title={`${ZONE_LABELS[i]}: ${pct.toFixed(1)}%`}
              />
            ))}
          </div>
          <div className="flex gap-3 mt-1.5">
            {ZONE_LABELS.map((label, i) => (
              <span key={label} className="flex items-center gap-1 text-xs text-muted">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ZONE_COLORS[i] }} />
                {label} {zones[i].toFixed(0)}%
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
