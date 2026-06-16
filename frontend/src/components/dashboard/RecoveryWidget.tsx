import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ChartInfo } from '@/components/ui/ChartInfo'
import { type RecoveryData } from '@/lib/api'
import { recoveryColor, shortDate } from '@/lib/utils'

interface Props {
  today?: RecoveryData
  history: RecoveryData[]
}

const DRIVER_COLORS = ['#60a5fa', '#a78bfa', '#34d399']

const INFO = {
  title: 'Recovery Score',
  description:
    'Wahoo\'s 0–100% readiness score blending sleep quality, HRV, and resting heart rate. Green (≥67%) = go hard. Yellow (34–67%) = moderate effort only. Red (<34%) = rest or active recovery. The pie shows how each driver contributed today.',
}

function recoveryStatus(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 67) return 'Well'
  if (score >= 34) return 'Partial'
  return 'Limited'
}

export function RecoveryWidget({ today, history }: Props) {
  const score = today?.recovery_score ?? 0
  const color = recoveryColor(score)
  const status = recoveryStatus(score)

  const driversData = today
    ? [
        { name: 'Sleep', value: Math.round(today.sleep * 100) },
        { name: 'HRV', value: Math.round(today.hrv * 100) },
        { name: 'RHR', value: Math.round(today.rhr * 100) },
      ]
    : []

  const chartData = history.map(d => ({
    date: shortDate(d.date),
    score: d.recovery_score,
  }))

  return (
    <Card accent={color}>
      <div className="flex items-center gap-2 mb-0">
        <p className="metric-label" style={{ color }}>Recovery</p>
        <ChartInfo color={color} title={INFO.title} description={INFO.description} />
      </div>
      <div className="flex items-end justify-between mt-1 mb-4">
        <div className="flex items-end gap-2">
          <span className="font-mono text-5xl font-medium tabular-nums text-white">{score}</span>
          <span className="text-muted pb-1.5">%</span>
        </div>
        <Badge label={status} color={color} />
      </div>

      {today && driversData.length > 0 && (
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 flex-shrink-0">
            <PieChart width={80} height={80}>
              <Pie data={driversData} cx={35} cy={35} innerRadius={22} outerRadius={36} dataKey="value" strokeWidth={0}>
                {driversData.map((_, i) => (
                  <Cell key={i} fill={DRIVER_COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="flex flex-col gap-1">
            {driversData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DRIVER_COLORS[i] }} />
                <span className="text-muted">{d.name}</span>
                <span className="font-mono text-white ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-24 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 4, bottom: 0, left: -20 }}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: 'oklch(16% 0.02 260)', border: '1px solid oklch(25% 0.03 260)', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Bar dataKey="score" name="Recovery %" radius={[2, 2, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={recoveryColor(d.score)} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
