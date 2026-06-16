import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ConnectPage } from './pages/ConnectPage'
import { DashboardPage } from './pages/DashboardPage'
import { AdminPage } from './pages/AdminPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotFoundPage, ErrorPage, Error429Page, Error500Page } from './pages/ErrorPage'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ConnectPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Named error routes */}
          <Route path="/error/400" element={<ErrorPage code={400} />} />
          <Route path="/error/401" element={<ErrorPage code={401} />} />
          <Route path="/error/403" element={<ErrorPage code={403} />} />
          <Route path="/error/404" element={<NotFoundPage />} />
          <Route path="/error/429" element={<Error429Page />} />
          <Route path="/error/500" element={<Error500Page />} />
          <Route path="/error/503" element={<ErrorPage code={503} />} />

          {/* Catch-all → 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
