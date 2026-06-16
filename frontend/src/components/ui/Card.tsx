import { type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  accent?: string
}

export function Card({ children, className = '', accent }: Props) {
  return (
    <div
      className={`bg-card border border-border rounded-xl p-5 relative overflow-hidden ${className}`}
      style={accent ? { borderTopColor: accent, borderTopWidth: 2 } : undefined}
    >
      {children}
    </div>
  )
}
