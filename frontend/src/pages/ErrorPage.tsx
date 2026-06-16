import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom'

// ── Error metadata ────────────────────────────────────────────────────────────

interface ErrorMeta {
  code: number
  title: string
  description: string
  hint: string
  color: string
  icon: string
}

const ERROR_MAP: Record<number, ErrorMeta> = {
  400: {
    code: 400,
    title: 'Bad Request',
    description: 'The request was malformed or contained invalid parameters.',
    hint: 'Check the URL or form input and try again.',
    color: 'oklch(72% 0.21 60)',
    icon: '⚠',
  },
  401: {
    code: 401,
    title: 'Unauthorized',
    description: 'You need to connect your Wahoo account to access this page.',
    hint: 'Connect your account from the home screen to continue.',
    color: 'oklch(65% 0.21 22)',
    icon: '🔒',
  },
  403: {
    code: 403,
    title: 'Forbidden',
    description: 'You do not have permission to access this resource.',
    hint: 'If you believe this is a mistake, try reconnecting your account.',
    color: 'oklch(65% 0.25 25)',
    icon: '🚫',
  },
  404: {
    code: 404,
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist or has been moved.',
    hint: 'Check the URL, or head back to the dashboard.',
    color: 'oklch(62% 0.22 195)',
    icon: '◎',
  },
  429: {
    code: 429,
    title: 'Too Many Requests',
    description: 'The Wahoo API rate limit has been reached (100 requests / hour on the free tier).',
    hint: 'Wait for the limit window to reset, then refresh. Check /admin for the exact reset time.',
    color: 'oklch(72% 0.21 85)',
    icon: '⏱',
  },
  500: {
    code: 500,
    title: 'Server Error',
    description: 'Something went wrong on our end. The backend may be unavailable.',
    hint: 'Try restarting the backend with ./start.sh, then refresh.',
    color: 'oklch(65% 0.25 25)',
    icon: '⚡',
  },
  503: {
    code: 503,
    title: 'Service Unavailable',
    description: 'The Wahoo API is temporarily unavailable or undergoing maintenance.',
    hint: 'This is usually short-lived. Wait a few minutes and try again.',
    color: 'oklch(65% 0.25 25)',
    icon: '🔌',
  },
}

const DEFAULT_META: ErrorMeta = {
  code: 0,
  title: 'Unexpected Error',
  description: 'An unexpected error occurred.',
  hint: 'Try refreshing the page. If the problem persists, check the browser console.',
  color: 'oklch(65% 0.25 25)',
  icon: '✕',
}

// ── ECG pulse SVG (decorative) ────────────────────────────────────────────────

function PulseDecoration({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 240 40"
      className="w-60 h-10 opacity-20"
      aria-hidden
    >
      <polyline
        points="0,20 40,20 50,8 60,32 70,12 80,28 90,20 240,20"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Shared layout ─────────────────────────────────────────────────────────────

interface ErrorLayoutProps {
  meta: ErrorMeta
  actions?: React.ReactNode
}

function ErrorLayout({ meta, actions }: ErrorLayoutProps) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      role="main"
      aria-labelledby="error-heading"
    >
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Decorative pulse */}
        <div className="flex justify-center">
          <PulseDecoration color={meta.color} />
        </div>

        {/* Code + icon */}
        <div className="relative">
          <p
            className="font-mono text-[7rem] font-bold leading-none select-none"
            style={{
              color: meta.color,
              opacity: 0.15,
              letterSpacing: '-0.05em',
            }}
            aria-hidden
          >
            {meta.code || '!'}
          </p>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="text-4xl" role="img" aria-hidden>{meta.icon}</span>
            <h1
              id="error-heading"
              className="text-2xl font-semibold text-white"
              style={{ textShadow: `0 0 40px ${meta.color}55` }}
            >
              {meta.title}
            </h1>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted text-sm leading-relaxed">{meta.description}</p>

        {/* Hint pill */}
        <div
          className="inline-block px-4 py-2 rounded-full text-xs border"
          style={{ borderColor: `${meta.color}44`, color: meta.color, background: `${meta.color}11` }}
        >
          {meta.hint}
        </div>

        {/* Rate-limit specific: link to admin */}
        {meta.code === 429 && (
          <p className="text-xs text-muted">
            View live rate-limit status at{' '}
            <a href="/admin" className="underline" style={{ color: meta.color }}>
              /admin
            </a>
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {actions}
        </div>
      </div>
    </main>
  )
}

// ── Reusable buttons ──────────────────────────────────────────────────────────

function BackButton() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(-1)}
      className="px-4 py-2 text-sm border border-border rounded-lg text-muted hover:text-white hover:border-muted transition-colors"
    >
      ← Go back
    </button>
  )
}

function HomeButton() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/dashboard')}
      className="px-4 py-2 text-sm rounded-lg font-medium text-surface transition-opacity hover:opacity-90"
      style={{ background: 'oklch(62% 0.22 195)' }}
    >
      Dashboard
    </button>
  )
}

function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 text-sm border border-border rounded-lg text-muted hover:text-white hover:border-muted transition-colors"
    >
      ↻ Retry
    </button>
  )
}

// ── Public page components ────────────────────────────────────────────────────

export function ErrorPage({ code }: { code: number }) {
  const meta = ERROR_MAP[code] ?? { ...DEFAULT_META, code }
  return (
    <ErrorLayout
      meta={meta}
      actions={
        <>
          {code === 401 ? (
            <button
              onClick={() => (window.location.href = '/')}
              className="px-4 py-2 text-sm rounded-lg font-medium text-surface transition-opacity hover:opacity-90"
              style={{ background: 'oklch(62% 0.22 195)' }}
            >
              Connect Wahoo
            </button>
          ) : (
            <>
              <BackButton />
              <HomeButton />
            </>
          )}
        </>
      }
    />
  )
}

export function Error429Page() {
  return (
    <ErrorLayout
      meta={ERROR_MAP[429]}
      actions={
        <>
          <RetryButton />
          <a
            href="/admin"
            className="px-4 py-2 text-sm rounded-lg font-medium text-surface transition-opacity hover:opacity-90"
            style={{ background: 'oklch(72% 0.21 85)' }}
          >
            View rate limits
          </a>
        </>
      }
    />
  )
}

export function Error500Page() {
  return (
    <ErrorLayout
      meta={ERROR_MAP[500]}
      actions={
        <>
          <RetryButton />
          <HomeButton />
        </>
      }
    />
  )
}

export function NotFoundPage() {
  return (
    <ErrorLayout
      meta={ERROR_MAP[404]}
      actions={
        <>
          <BackButton />
          <HomeButton />
        </>
      }
    />
  )
}

// ── React Router v6 error boundary page ──────────────────────────────────────

export function RouterErrorPage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    const meta = ERROR_MAP[error.status] ?? { ...DEFAULT_META, code: error.status, title: error.statusText }
    return (
      <ErrorLayout
        meta={meta}
        actions={
          <>
            <BackButton />
            <HomeButton />
          </>
        }
      />
    )
  }

  const msg =
    error instanceof Error
      ? error.message
      : 'An unexpected error occurred.'

  return (
    <ErrorLayout
      meta={{ ...ERROR_MAP[500], description: msg }}
      actions={
        <>
          <RetryButton />
          <HomeButton />
        </>
      }
    />
  )
}
