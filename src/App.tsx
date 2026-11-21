import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { useAuthToken } from './lib/auth-token'
import { ActivitiesPage } from './pages/ActivitiesPage'
import { AvailabilityPage } from './pages/AvailabilityPage'
import { BookingsPage } from './pages/BookingsPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PatientRecordPage } from './pages/PatientRecordPage'
import { PatientsPage } from './pages/PatientsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { ProfilePage } from './pages/ProfilePage'
import { toasterOptions } from './lib/toast'
import { ROUTES, getPageTitle } from './router/routes'

function DocumentTitleUpdater() {
  const location = useLocation()

  useEffect(() => {
    document.title = `${getPageTitle(location.pathname)} · MindBloom Specialist Portal`
    window.scrollTo(0, 0)
  }, [location.pathname])

  return null
}

function LoginRoute() {
  const token = useAuthToken()

  if (token) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return <LoginPage />
}

function ProtectedLayout() {
  const token = useAuthToken()

  if (!token) {
    return <Navigate to={ROUTES.login} replace />
  }

  return <AppShell />
}

function App() {
  return (
    <>
      <DocumentTitleUpdater />
      <Toaster
        position="top-right"
        gutter={8}
        containerStyle={{ top: 76, right: 16 }}
        toastOptions={toasterOptions}
      />
      <Routes>
        <Route path={ROUTES.login} element={<LoginRoute />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.profile} element={<ProfilePage />} />
          <Route path={ROUTES.availability} element={<AvailabilityPage />} />
          <Route path={ROUTES.bookings} element={<BookingsPage />} />
          <Route path={ROUTES.patients} element={<PatientsPage />} />
          <Route path={ROUTES.patientRecord} element={<PatientRecordPage />} />
          <Route path={ROUTES.activities} element={<ActivitiesPage />} />
          <Route path={ROUTES.privacy} element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
