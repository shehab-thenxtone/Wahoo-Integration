interface Props {
  label: string
  color?: string
}

export function Badge({ label, color = '#60a5fa' }: Props) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {label}
    </span>
  )
}
