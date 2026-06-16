import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { type StrainData } from '@/lib/api'
import { strainZoneColor, shortDate } from '@/lib/utils'

interface Props {
  today?: StrainData
  history: StrainData[]
}

export function StrainWidget({ today, history }: Props) {
  const score = today?.strain ?? 0
  const zone = today?.zone ?? '—'
  const color = strainZoneColor(zone)

  const chartData = history.map(d => ({
    date: shortDate(d.date),
    strain: d.strain,
    zone: d.zone,
  }))

  const gaugeAngle = (score / 100) * 180 - 90

  return (
    <Card accent={color}>
      <p className="metric-label" style={{ color }}>Daily Strain</p>
      <div className="flex items-end justify-between mt-1 mb-4">
        <div className="flex items-end gap-2">
          <span className="font-mono text-5xl font-medium tabular-nums text-white">{score}</span>
          <span className="text-muted pb-1.5 text-sm">/ 100</span>
        </div>
        <Badge label={zone} color={color} />
      </div>

      {/* Gauge arc */}
      <div className="flex justify-center mb-4">
        <svg viewBox="0 0 120 65" className="w-36 h-20">
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="oklch(25% 0.03 260)" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 157} 157`}
            opacity={0.9}
          />
          <text x="60" y="58" textAnchor="middle" fill="white" fontSize="18" fontFamily="monospace" fontWeight="600">
            {score}
          </text>
          <text x="60" y="70" textAnchor="middle" fill="oklch(55% 0.02 260)" fontSize="9">
            {zone}
          </text>
        </svg>
      </div>

      <div className="h-24 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 4, bottom: 0, left: -20 }}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: 'oklch(16% 0.02 260)', border: '1px solid oklch(25% 0.03 260)', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Bar dataKey="strain" name="Strain" radius={[2, 2, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={strainZoneColor(d.zone)} opacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
