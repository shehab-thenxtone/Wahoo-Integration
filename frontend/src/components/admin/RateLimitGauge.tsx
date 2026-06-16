import { type RateLimitStatus } from '@/lib/api'

interface Props {
  status: RateLimitStatus
}

export function RateLimitGauge({ status }: Props) {
  const pct = status.percent_used
  const color = pct < 50 ? '#4ade80' : pct < 80 ? '#fbbf24' : '#f87171'
  const circumference = 2 * Math.PI * 54
  const offset = circumference * (1 - pct / 100)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="oklch(25% 0.03 260)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-medium text-white">{status.remaining}</span>
          <span className="text-xs text-muted">remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full text-center">
        <div>
          <p className="font-mono text-lg text-white">{status.used}</p>
          <p className="text-xs text-muted">used</p>
        </div>
        <div>
          <p className="font-mono text-lg text-white">{status.limit}</p>
          <p className="text-xs text-muted">limit/hr</p>
        </div>
        <div>
          <p className="font-mono text-lg" style={{ color }}>{pct.toFixed(0)}%</p>
          <p className="text-xs text-muted">used</p>
        </div>
      </div>

      {status.reset_at && (
        <p className="text-xs text-muted">
          Resets: <span className="text-white">{new Date(status.reset_at).toLocaleTimeString()}</span>
        </p>
      )}
    </div>
  )
}
