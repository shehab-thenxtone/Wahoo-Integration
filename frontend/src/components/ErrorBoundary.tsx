import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  override render() {
    if (!this.state.hasError) return this.props.children

    const msg = this.state.error?.message ?? 'Unknown error'

    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="relative">
            <p
              className="font-mono text-[7rem] font-bold leading-none select-none"
              style={{ color: 'oklch(65% 0.25 25)', opacity: 0.15, letterSpacing: '-0.05em' }}
              aria-hidden
            >
              500
            </p>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-4xl" aria-hidden>⚡</span>
              <h1 className="text-2xl font-semibold text-white">Render Error</h1>
            </div>
          </div>

          <p className="text-muted text-sm leading-relaxed">
            The application encountered an unexpected error during rendering.
          </p>

          <div
            className="inline-block px-4 py-2 rounded-full text-xs border font-mono break-all"
            style={{
              borderColor: 'oklch(65% 0.25 25 / 0.27)',
              color: 'oklch(65% 0.25 25)',
              background: 'oklch(65% 0.25 25 / 0.07)',
            }}
          >
            {msg}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm border border-border rounded-lg text-muted hover:text-white hover:border-muted transition-colors"
            >
              ↻ Reload
            </button>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
              className="px-4 py-2 text-sm rounded-lg font-medium text-surface transition-opacity hover:opacity-90"
              style={{ background: 'oklch(62% 0.22 195)' }}
            >
              Home
            </button>
          </div>
        </div>
      </main>
    )
  }
}
