import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { rawApi } from '@/lib/api'
import { Footer } from '@/components/ui/Footer'
import { PageLoader } from '@/components/ui/Loader'

type RawPayload = Record<string, unknown>

const SECTION_LABELS: Record<string, string> = {
  user: 'User Profile',
  heart_rate_daily_summary: 'Heart Rate',
  recovery_data: 'Recovery',
  strain_data: 'Strain',
  workouts: 'Workouts',
  activities: 'Activities',
  power_zones: 'Power Zones',
  routes: 'Routes',
  plans: 'Plans',
  metadata: 'Metadata',
}

function sectionLabel(key: string): string {
  return SECTION_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function countItems(value: unknown): string {
  if (Array.isArray(value)) return `${value.length} item${value.length !== 1 ? 's' : ''}`
  if (value && typeof value === 'object') {
    const keys = Object.keys(value as object).length
    return `${keys} field${keys !== 1 ? 's' : ''}`
  }
  return ''
}

function tokenize(json: string): { type: string; value: string }[] {
  const tokens: { type: string; value: string }[] = []
  const re = /("(?:[^"\\]|\\.)*")\s*(:)?|(\btrue\b|\bfalse\b|\bnull\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],])/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(json)) !== null) {
    if (m.index > last) tokens.push({ type: 'ws', value: json.slice(last, m.index) })
    if (m[1] !== undefined) {
      tokens.push({ type: m[2] ? 'key' : 'string', value: m[1] })
      if (m[2]) tokens.push({ type: 'colon', value: m[2] })
    } else if (m[3] !== undefined) {
      tokens.push({ type: 'literal', value: m[3] })
    } else if (m[4] !== undefined) {
      tokens.push({ type: 'number', value: m[4] })
    } else if (m[5] !== undefined) {
      tokens.push({ type: 'punct', value: m[5] })
    }
    last = re.lastIndex
  }
  if (last < json.length) tokens.push({ type: 'ws', value: json.slice(last) })
  return tokens
}

const TOKEN_COLORS: Record<string, string> = {
  key: 'oklch(70% 0.18 295)',
  string: 'oklch(65% 0.20 140)',
  number: 'oklch(72% 0.21 60)',
  literal: 'oklch(65% 0.21 22)',
  punct: 'oklch(55% 0.0 0)',
  colon: 'oklch(55% 0.0 0)',
  ws: 'inherit',
}

function SyntaxJson({ value }: { value: unknown }) {
  const pretty = useMemo(() => JSON.stringify(value, null, 2), [value])
  const tokens = useMemo(() => tokenize(pretty), [pretty])
  return (
    <pre className="text-xs leading-relaxed font-mono overflow-x-auto p-4 whitespace-pre">
      {tokens.map((t, i) => (
        <span key={i} style={{ color: TOKEN_COLORS[t.type] ?? 'inherit' }}>
          {t.value}
        </span>
      ))}
    </pre>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2.5 py-1 rounded-md border border-border text-muted hover:text-white hover:border-primary/60 transition-colors"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export function RawDataPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<RawPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string>('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    rawApi.all()
      .then(d => {
        setData(d)
        const firstKey = Object.keys(d)[0] ?? ''
        setActiveSection(firstKey)
      })
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  const sections = useMemo(() => (data ? Object.keys(data) : []), [data])

  const filteredValue = useMemo(() => {
    if (!data || !activeSection) return null
    const raw = data[activeSection]
    if (!search.trim()) return raw
    const lower = search.toLowerCase()
    const str = JSON.stringify(raw, null, 2)
    if (!str.toLowerCase().includes(lower)) return null
    return raw
  }, [data, activeSection, search])

  const activeJson = useMemo(
    () => (filteredValue !== null ? JSON.stringify(filteredValue, null, 2) : ''),
    [filteredValue],
  )

  if (loading) return <PageLoader />

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-sm border-b border-border px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-muted hover:text-white transition-colors text-sm"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3L5 8l5 5" />
              </svg>
              Dashboard
            </button>
            <span className="text-border">/</span>
            <span className="font-semibold text-white">Raw API Data</span>
          </div>
          {error && (
            <span className="text-xs text-danger border border-danger/30 rounded-md px-2.5 py-1">{error}</span>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Sidebar — section list */}
        <aside className="w-44 flex-shrink-0 border-r border-border bg-surface/40 flex flex-col gap-0.5 py-3 px-2 overflow-y-auto">
          {sections.map(key => {
            const val = data![key]
            const count = countItems(val)
            return (
              <button
                key={key}
                onClick={() => { setActiveSection(key); setSearch('') }}
                className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors ${
                  activeSection === key
                    ? 'bg-primary/15 text-white border border-primary/30'
                    : 'text-muted hover:text-white hover:bg-card/60'
                }`}
              >
                <p className="text-xs font-medium truncate">{sectionLabel(key)}</p>
                {count && <p className="text-[10px] opacity-60 mt-0.5">{count}</p>}
              </button>
            )
          })}
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface/20">
            <h2 className="text-sm font-semibold text-white flex-shrink-0">
              {sectionLabel(activeSection)}
            </h2>
            <div className="flex-1 max-w-xs">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter…"
                className="w-full bg-card border border-border rounded-lg px-3 py-1 text-xs text-white placeholder-muted focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
            <div className="ml-auto">
              {activeJson && <CopyButton text={activeJson} />}
            </div>
          </div>

          {/* JSON output */}
          <div className="flex-1 overflow-auto bg-card/30">
            {filteredValue === null ? (
              <div className="flex items-center justify-center h-full text-muted text-sm">
                No matches for &ldquo;{search}&rdquo;
              </div>
            ) : (
              <SyntaxJson value={filteredValue} />
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
