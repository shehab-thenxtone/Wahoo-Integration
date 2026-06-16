import { useState, useRef, useEffect } from 'react'

interface Props {
  title: string
  description: string
  color?: string
}

export function ChartInfo({ title, description, color = 'oklch(62% 0.22 195)' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  return (
    <div ref={ref} className="relative inline-flex" style={{ zIndex: 20 }}>
      <button
        aria-label={`Info: ${title}`}
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="flex items-center justify-center w-5 h-5 rounded-full text-xs transition-opacity opacity-50 hover:opacity-100"
        style={{
          border: `1.5px solid ${color}`,
          color,
          lineHeight: 1,
          fontStyle: 'italic',
          fontWeight: 700,
          fontFamily: 'serif',
        }}
        tabIndex={0}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        i
      </button>

      {open && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 mb-2 w-64 rounded-xl text-xs leading-relaxed shadow-2xl"
          style={{
            transform: 'translateX(-50%)',
            background: 'oklch(14% 0.025 260)',
            border: `1px solid ${color}44`,
            padding: '10px 12px',
            color: 'oklch(72% 0.02 260)',
            pointerEvents: 'none',
          }}
        >
          <p className="font-semibold mb-1" style={{ color: 'white' }}>{title}</p>
          <p>{description}</p>
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              bottom: -5,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 8,
              height: 8,
              background: 'oklch(14% 0.025 260)',
              border: `1px solid ${color}44`,
              borderTop: 'none',
              borderLeft: 'none',
              rotate: '45deg',
            }}
          />
        </div>
      )}
    </div>
  )
}
