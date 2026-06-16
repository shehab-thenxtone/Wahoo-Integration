import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { type Activity } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface Props {
  activities: Activity[]
}

const TYPE_COLORS: Record<string, string> = {
  Running: '#f87171',
  Cycling: '#60a5fa',
  Strength: '#a78bfa',
  Recovery: '#4ade80',
  'Rest Day': '#94a3b8',
}

function exportCSV(activities: Activity[]) {
  const header = 'Date,Type,Duration(min),Avg HR,Max HR,Calories,Distance(km),Notes'
  const rows = activities.map(a =>
    [a.date, a.type, a.duration_minutes, a.avg_heart_rate, a.max_heart_rate,
     a.calories_burned, a.distance_km ?? '', a.notes ?? ''].join(',')
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'wahoo_activities.csv'
  link.click()
  URL.revokeObjectURL(url)
}

type SortKey = 'date' | 'type' | 'duration_minutes' | 'avg_heart_rate' | 'calories_burned' | 'distance_km'

export function ActivityTable({ activities }: Props) {
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortAsc, setSortAsc] = useState(false)
  const PAGE_SIZE = 8

  const filtered = activities
    .filter(a => !filter || a.type.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      return sortAsc ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1)
    })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(v => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  const COLUMNS: [SortKey, string][] = [
    ['date', 'Date'], ['type', 'Type'], ['duration_minutes', 'Duration'],
    ['avg_heart_rate', 'Avg HR'], ['calories_burned', 'Calories'], ['distance_km', 'Distance'],
  ]

  return (
    <Card className="col-span-full">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Activities</h3>
        <div className="flex gap-2 items-center">
          <select
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(0) }}
            className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-white"
          >
            <option value="">All types</option>
            {[...new Set(activities.map(a => a.type))].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={() => exportCSV(filtered)}
            className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted hover:text-white hover:border-primary transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted text-xs uppercase tracking-wider">
              {COLUMNS.map(([key, label]) => (
                <th
                  key={key}
                  className="text-left py-2 px-3 cursor-pointer hover:text-white select-none"
                  onClick={() => toggleSort(key)}
                >
                  {label}{sortKey === key && <span className="ml-1">{sortAsc ? '↑' : '↓'}</span>}
                </th>
              ))}
              <th className="text-left py-2 px-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map(a => (
              <tr key={a.id} className="border-b border-border/50 hover:bg-card-hover transition-colors">
                <td className="py-2.5 px-3 text-muted">{formatDate(a.date)}</td>
                <td className="py-2.5 px-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[a.type] ?? '#94a3b8' }} />
                    {a.type}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono">{a.duration_minutes} min</td>
                <td className="py-2.5 px-3 font-mono">{a.avg_heart_rate} bpm</td>
                <td className="py-2.5 px-3 font-mono">{a.calories_burned} kcal</td>
                <td className="py-2.5 px-3 font-mono">{a.distance_km != null ? `${a.distance_km} km` : '—'}</td>
                <td className="py-2.5 px-3 text-muted text-xs max-w-xs overflow-hidden whitespace-nowrap" style={{textOverflow:'ellipsis'}}>{a.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted">{filtered.length} activities</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs rounded border border-border disabled:opacity-30 hover:border-primary transition-colors">← Prev</button>
            <span className="px-3 py-1 text-xs text-muted">{page + 1} / {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs rounded border border-border disabled:opacity-30 hover:border-primary transition-colors">Next →</button>
          </div>
        </div>
      )}
    </Card>
  )
}
