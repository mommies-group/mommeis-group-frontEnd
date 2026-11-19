import { useEffect } from 'react'
import { AppShell } from './components/layout/AppShell'
import { ActivitiesPage } from './pages/ActivitiesPage'
import { AvailabilityPage } from './pages/AvailabilityPage'
import { BookingsPage } from './pages/BookingsPage'
import { ClinicalNotesPage } from './pages/ClinicalNotesPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PatientRecordPage } from './pages/PatientRecordPage'
import { PatientsPage } from './pages/PatientsPage'
import { PrivacyConsentPage } from './pages/PrivacyConsentPage'
import { ProfilePage } from './pages/ProfilePage'
import { ROUTES, getPageTitle } from './router/routes'
import { useHashRoute } from './router/useHashRoute'

function getPage(path: string) {
  switch (path) {
    case ROUTES.dashboard:
      return <DashboardPage />
    case ROUTES.profile:
      return <ProfilePage />
    case ROUTES.availability:
      return <AvailabilityPage />
    case ROUTES.bookings:
      return <BookingsPage />
    case ROUTES.patients:
      return <PatientsPage />
    case ROUTES.patientRecord:
      return <PatientRecordPage />
    case ROUTES.clinicalNotes:
      return <ClinicalNotesPage />
    case ROUTES.activities:
      return <ActivitiesPage />
    case ROUTES.privacy:
      return <PrivacyConsentPage />
    default:
      return <NotFoundPage />
  }
}

function App() {
  const path = useHashRoute()

  useEffect(() => {
    document.title = `${getPageTitle(path)} · MindBloom Specialist Portal`
  }, [path])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  if (path === ROUTES.login) {
    return <LoginPage />
  }

  return (
    <AppShell path={path} title={getPageTitle(path)}>
      {getPage(path)}
    </AppShell>
  )
}

export default App
