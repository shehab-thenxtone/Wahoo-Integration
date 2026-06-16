import { useNavigate } from 'react-router-dom'

const LAST_UPDATED = '2026-06-16'

interface SectionProps {
  id: string
  title: string
  children: React.ReactNode
}

function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="space-y-3" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="text-lg font-semibold text-white border-b border-border pb-2">
        {title}
      </h2>
      <div className="text-muted text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export function PrivacyPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-muted hover:text-white transition-colors text-sm"
            aria-label="Go back"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold text-white">Privacy Policy</h1>
          <span className="ml-auto text-xs text-muted">Last updated: {LAST_UPDATED}</span>
        </div>
      </header>

      {/* TOC */}
      <div className="max-w-3xl mx-auto px-6 py-8 grid md:grid-cols-[220px_1fr] gap-12">
        <nav aria-label="Table of contents" className="hidden md:block">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Contents</p>
          <ol className="space-y-1.5 text-sm">
            {[
              ['overview', 'Overview'],
              ['data-collected', 'Data We Collect'],
              ['data-use', 'How We Use Your Data'],
              ['data-storage', 'Data Storage'],
              ['third-parties', 'Third-Party Services'],
              ['your-rights', 'Your Rights'],
              ['cookies', 'Cookies & Sessions'],
              ['webhooks', 'Webhooks'],
              ['changes', 'Policy Changes'],
              ['contact', 'Contact'],
            ].map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="text-muted hover:text-white transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Body */}
        <main className="space-y-10" role="main">
          <Section id="overview" title="Overview">
            <p>
              Wahoo Dashboard ("the Application") is a personal fitness dashboard that connects to your
              Wahoo account and displays your training data. This policy explains what data is collected,
              how it is used, and what controls you have over it.
            </p>
            <p>
              The Application runs locally on your machine. No data is transmitted to any server other
              than Wahoo's official API.
            </p>
          </Section>

          <Section id="data-collected" title="Data We Collect">
            <p>The Application requests the following data from Wahoo's API on your behalf:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Heart rate measurements (daily summaries, zone distributions)</li>
              <li>Heart Rate Variability (HRV) readings</li>
              <li>Recovery scores and contributing factors (sleep, RHR, HRV)</li>
              <li>Strain scores and zone breakdowns</li>
              <li>Activity records (type, duration, distance, calories, effort)</li>
              <li>Basic profile information (user ID, display name) used to label your session</li>
            </ul>
            <p>
              The Application also records metadata about its own API calls to Wahoo (endpoint path,
              timestamp, HTTP status, rate-limit headers) to power the admin rate-limit dashboard.
              This metadata contains no personal health data.
            </p>
          </Section>

          <Section id="data-use" title="How We Use Your Data">
            <p>Your data is used exclusively to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Render the metrics dashboard visible only to you in your browser</li>
              <li>Generate historical charts from data fetched live from Wahoo</li>
              <li>Display daily training summaries and activity logs</li>
            </ul>
            <p>
              Your health data is never written to disk beyond what Wahoo's API returns in the active
              HTTP response. It lives only in browser memory for the duration of the page session.
            </p>
          </Section>

          <Section id="data-storage" title="Data Storage">
            <p>The Application stores the following files on your local machine:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong className="text-white">backend/data/sessions.json</strong> — Wahoo OAuth tokens
                (access token + refresh token) tied to your session cookie. This file is excluded from
                version control via <code>.gitignore</code>.
              </li>
              <li>
                <strong className="text-white">backend/data/rate_limits.json</strong> — API call log
                (endpoint, timestamp, status, rate-limit headers). Contains no health data. Capped at
                2,000 entries and excluded from version control.
              </li>
            </ul>
            <p>
              No health metrics, activity records, or personal profile data are written to disk. All
              dashboard data is fetched live from Wahoo on each page load.
            </p>
          </Section>

          <Section id="third-parties" title="Third-Party Services">
            <p>The Application communicates only with:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong className="text-white">Wahoo API</strong> (api.wahooligan.com) — to fetch your
                fitness data and handle OAuth authentication. Governed by{' '}
                <a
                  href="https://www.wahoofitness.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white transition-colors"
                  style={{ color: 'oklch(62% 0.22 195)' }}
                >
                  Wahoo's Privacy Policy
                </a>
                .
              </li>
            </ul>
            <p>
              No analytics services, advertising networks, or telemetry platforms are used. No data
              leaves your machine except through Wahoo API requests you explicitly trigger.
            </p>
          </Section>

          <Section id="your-rights" title="Your Rights">
            <p>You have full control over your data:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong className="text-white">Disconnect</strong> — Using the disconnect button removes
                your OAuth tokens from <code>sessions.json</code> and revokes the Application's access
                to your Wahoo account in that session.
              </li>
              <li>
                <strong className="text-white">Delete stored data</strong> — Delete
                <code>backend/data/sessions.json</code> and <code>backend/data/rate_limits.json</code>
                at any time to erase all locally persisted data.
              </li>
              <li>
                <strong className="text-white">Revoke third-party access</strong> — Visit your Wahoo
                account settings to revoke this Application's OAuth access entirely.
              </li>
            </ul>
          </Section>

          <Section id="cookies" title="Cookies &amp; Sessions">
            <p>
              The Application sets one HttpOnly, SameSite=Lax cookie named <code>session_id</code> to
              identify your local session. This cookie:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Does not track you across sites</li>
              <li>Contains no personal data — only a random session identifier</li>
              <li>Expires after 30 days or when you disconnect</li>
              <li>Is only sent to <code>localhost:8000</code></li>
            </ul>
          </Section>

          <Section id="webhooks" title="Webhooks">
            <p>
              When webhook integration is enabled, Wahoo may send push notifications to this Application
              when new workout data becomes available. Each incoming webhook request is verified using an
              HMAC-SHA256 signature before any data is processed. Webhook payloads are not persisted to
              disk.
            </p>
          </Section>

          <Section id="changes" title="Policy Changes">
            <p>
              This policy may be updated to reflect changes to the Application's features. The "Last
              updated" date at the top of this page reflects the most recent revision. Continued use of
              the Application after a policy update constitutes acceptance of the revised policy.
            </p>
          </Section>

          <Section id="contact" title="Contact">
            <p>
              This is a personal, locally-run application. For questions about Wahoo's data practices,
              contact Wahoo directly at{' '}
              <a
                href="https://www.wahoofitness.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white transition-colors"
                style={{ color: 'oklch(62% 0.22 195)' }}
              >
                wahoofitness.com/privacy
              </a>
              .
            </p>
          </Section>
        </main>
      </div>
    </div>
  )
}
