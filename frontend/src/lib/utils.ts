export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function hrZoneColor(bpm: number): string {
  if (bpm < 60) return '#4ade80'   // green
  if (bpm < 100) return '#60a5fa'  // blue
  if (bpm < 140) return '#fbbf24'  // amber
  return '#f87171'                  // red
}

export function recoveryColor(score: number): string {
  if (score >= 67) return 'oklch(68% 0.19 150)'   // green
  if (score >= 34) return 'oklch(72% 0.21 85)'    // amber
  return 'oklch(65% 0.25 25)'                      // red
}

export function strainZoneColor(zone: string): string {
  const map: Record<string, string> = {
    Low: '#4ade80',
    Moderate: '#60a5fa',
    High: '#fbbf24',
    'Very High': '#f87171',
  }
  return map[zone] ?? '#94a3b8'
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

export function shortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
