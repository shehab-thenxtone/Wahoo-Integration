import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ChartInfo } from '@/components/ui/ChartInfo'
import { type HeartRateDailySummary } from '@/lib/api'
import { shortDate } from '@/lib/utils'

interface Props {
  today?: HeartRateDailySummary
  history: HeartRateDailySummary[]
}

const COLOR = 'oklch(70% 0.18 295)'

const INFO = {
  title: 'Heart Rate Variability (HRV)',
  description:
    'RMSSD measures millisecond variation between consecutive heartbeats — your autonomic nervous system\'s stress indicator. Higher values mean better recovery readiness. Watch the dashed average line: consistently above it means your body is adapting well to training load.',
}

function hrvStatus(rmssd: number): { label: string; color: string } {
  if (rmssd >= 45) return { label: 'Balanced', color: '#4ade80' }
  if (rmssd >= 35) return { label: 'Normal', color: '#60a5fa' }
  return { label: 'Elevated Stress', color: '#f87171' }
}

export function HRVWidget({ today, history }: Props) {
  const chartData = history.map(d => ({
    date: shortDate(d.date),
    hrv: d.heart_rate_variability_rmssd,
  }))

  const avg = history.length
    ? Math.round(history.reduce((s, d) => s + d.heart_rate_variability_rmssd, 0) / history.length)
    : 0

  const current = today?.heart_rate_variability_rmssd ?? 0
  const status = hrvStatus(current)

  return (
    <Card accent={COLOR}>
      <div className="flex items-center gap-2 mb-0">
        <p className="metric-label" style={{ color: COLOR }}>HRV (RMSSD)</p>
        <ChartInfo color={COLOR} title={INFO.title} description={INFO.description} />
      </div>
      <div className="flex items-end justify-between mt-1 mb-4">
        <div className="flex items-end gap-2">
          <span className="font-mono text-5xl font-medium tabular-nums text-white">{current}</span>
          <span className="text-muted pb-1.5 text-sm">ms</span>
        </div>
        <Badge label={status.label} color={status.color} />
      </div>

      <div className="h-28 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 4, bottom: 0, left: -20 }}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: 'oklch(16% 0.02 260)', border: '1px solid oklch(25% 0.03 260)', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <ReferenceLine y={avg} stroke={COLOR} strokeDasharray="4 2" strokeOpacity={0.5} label={{ value: `avg ${avg}`, fill: '#94a3b8', fontSize: 10 }} />
            <Line
              type="monotone" dataKey="hrv"
              stroke={COLOR} strokeWidth={2}
              dot={false} activeDot={{ r: 4 }}
              name="HRV ms"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted mt-2">30-day avg: <span className="text-white">{avg} ms</span></p>
    </Card>
  )
}
