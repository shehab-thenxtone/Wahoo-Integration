import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-border mt-12 py-6 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="w-5 h-5 opacity-40" aria-hidden />
          <span className="text-xs text-muted">Wahoo Dashboard</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
          <span className="opacity-30">·</span>
          <a
            href="https://developers.wahooligan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Wahoo API
          </a>
          <span className="opacity-30">·</span>
          <span>Data fetched live · Nothing stored on disk</span>
        </div>
      </div>
    </footer>
  )
}
