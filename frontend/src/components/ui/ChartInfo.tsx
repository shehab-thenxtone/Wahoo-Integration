import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  title: string
  description: string
  color?: string
}

export function ChartInfo({ title, description, color = 'oklch(62% 0.22 195)' }: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  const show = () => {
    const r = btnRef.current?.getBoundingClientRect()
    if (r) setPos({ x: r.left + r.width / 2, y: r.top })
    setOpen(true)
  }
  const hide = () => setOpen(false)

  return (
    <span className="relative inline-flex items-center">
      <button
        ref={btnRef}
        aria-label={`Info: ${title}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="flex items-center justify-center w-[18px] h-[18px] rounded-full transition-opacity opacity-50 hover:opacity-100 flex-shrink-0"
        style={{
          border: `1.5px solid ${color}`,
          color,
          fontStyle: 'italic',
          fontWeight: 700,
          fontFamily: 'Georgia, serif',
          fontSize: '11px',
          lineHeight: 1,
          cursor: 'default',
        }}
      >
        i
      </button>

      {open && pos && createPortal(
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            top: pos.y - 10,
            left: pos.x,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
            width: 272,
            background: 'oklch(13% 0.025 260)',
            border: `1px solid ${color}55`,
            borderRadius: 12,
            padding: '10px 14px',
            boxShadow: `0 8px 32px oklch(0% 0 0 / 0.6), 0 0 0 1px ${color}22`,
            pointerEvents: 'none',
          }}
        >
          <p style={{ color: 'white', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{title}</p>
          <p style={{ color: 'oklch(68% 0.02 260)', fontSize: 12, lineHeight: 1.55 }}>{description}</p>
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            bottom: -5,
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 8,
            height: 8,
            background: 'oklch(13% 0.025 260)',
            borderRight: `1px solid ${color}55`,
            borderBottom: `1px solid ${color}55`,
          }} />
        </div>,
        document.body
      )}
    </span>
  )
}
