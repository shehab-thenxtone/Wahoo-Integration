import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, BarChart, Bar
} from 'recharts'
import { type RateLimitEntry } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'

interface Props {
  entries: RateLimitEntry[]
}

export function RateLimitHistory({ entries }: Props) {
  const timelineData = entries.slice(-100).map(e => ({
    time: new Date(e.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    remaining: e.remaining,
    used: e.limit - e.remaining,
    limit: e.limit,
  }))

  // Requests per endpoint
  const endpointMap: Record<string, number> = {}
  entries.forEach(e => {
    endpointMap[e.endpoint] = (endpointMap[e.endpoint] ?? 0) + 1
  })
  const endpointData = Object.entries(endpointMap)
    .map(([endpoint, count]) => ({ endpoint: endpoint.split('/').slice(-2).join('/'), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Remaining over time */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-muted mb-3">Rate Limit Remaining (last 100 calls)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ top: 5, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(25% 0.03 260)" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: 'oklch(16% 0.02 260)', border: '1px solid oklch(25% 0.03 260)', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <ReferenceLine y={20} stroke="#f87171" strokeDasharray="4 2" label={{ value: 'Low', fill: '#f87171', fontSize: 10 }} />
              <Line
                type="stepAfter" dataKey="remaining"
                stroke="oklch(62% 0.22 195)" strokeWidth={2}
                dot={false} activeDot={{ r: 3 }}
                name="Remaining"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Requests per endpoint */}
      {endpointData.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-muted mb-3">Requests by Endpoint</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={endpointData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 80 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="endpoint" tick={{ fontSize: 10 }} width={80} />
                <Tooltip
                  contentStyle={{ background: 'oklch(16% 0.02 260)', border: '1px solid oklch(25% 0.03 260)', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="count" fill="oklch(62% 0.22 195)" radius={[0, 4, 4, 0]} name="Calls" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent calls log */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-muted mb-3">Recent API Calls</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted uppercase tracking-wider">
                <th className="text-left py-2 px-2">Time</th>
                <th className="text-left py-2 px-2">Endpoint</th>
                <th className="text-left py-2 px-2">User</th>
                <th className="text-right py-2 px-2">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {[...entries].reverse().slice(0, 15).map((e, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-1.5 px-2 text-muted font-mono">{formatDateTime(e.timestamp)}</td>
                  <td className="py-1.5 px-2 font-mono" style={{ color: 'oklch(62% 0.22 195)' }}>{e.endpoint}</td>
                  <td className="py-1.5 px-2 text-muted">{e.user_id}</td>
                  <td className="py-1.5 px-2 text-right font-mono">
                    <span style={{ color: e.remaining < 20 ? '#f87171' : e.remaining < 50 ? '#fbbf24' : '#4ade80' }}>
                      {e.remaining}/{e.limit}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
