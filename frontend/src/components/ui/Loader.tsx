export function Loader({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" stroke="oklch(25% 0.03 260)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="oklch(62% 0.22 195)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader size={40} />
    </div>
  )
}
