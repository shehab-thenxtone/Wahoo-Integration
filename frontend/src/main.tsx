import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ConnectPage } from './pages/ConnectPage'
import { PageLoader } from './components/ui/Loader'
import './styles/global.css'

// Heavy routes lazy-loaded so recharts is not parsed on the connect/landing page
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })))
const WorkoutsPage = lazy(() => import('./pages/WorkoutsPage').then(m => ({ default: m.WorkoutsPage })))
const PowerZonesPage = lazy(() => import('./pages/PowerZonesPage').then(m => ({ default: m.PowerZonesPage })))
const RoutesPage = lazy(() => import('./pages/RoutesPage').then(m => ({ default: m.RoutesPage })))
const PlansPage = lazy(() => import('./pages/PlansPage').then(m => ({ default: m.PlansPage })))
const NotFoundPage = lazy(() => import('./pages/ErrorPage').then(m => ({ default: m.NotFoundPage })))
const ErrorPage = lazy(() => import('./pages/ErrorPage').then(m => ({ default: m.ErrorPage })))
const Error429Page = lazy(() => import('./pages/ErrorPage').then(m => ({ default: m.Error429Page })))
const Error500Page = lazy(() => import('./pages/ErrorPage').then(m => ({ default: m.Error500Page })))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<ConnectPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/power-zones" element={<PowerZonesPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/plans" element={<PlansPage />} />

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
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
