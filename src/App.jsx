import { useState, useMemo } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import DashboardPage from './pages/DashboardPage'
import StateSelectionPage from './pages/StateSelectionPage'
import PlantationSitesPage from './pages/PlantationSitesPage'
import SpeciesPage from './pages/SpeciesPage'
import CategoriesPage from './pages/CategoriesPage'
import OccasionsPage from './pages/OccasionsPage'
import TournamentsPage from './pages/TournamentsPage'
import TeamsPage from './pages/TeamsPage'
import MatchesPage from './pages/MatchesPage'
import NurseriesPage from './pages/NurseriesPage'
import AdminsPage from './pages/AdminsPage'
import AppUsersPage from './pages/AppUsersPage'
import CarbonFootprintPage from './pages/CarbonFootprintPage'
import EmissionFactorsPage from './pages/EmissionFactorsPage'
import UserPlantationsPage from './pages/UserPlantationsPage'
import PaymentsPage from './pages/PaymentsPage'
import CertificatesPage from './pages/CertificatesPage'
import PlantationInventoryPage from './pages/PlantationInventoryPage'
import CertificateTemplatesPage from './pages/CertificateTemplatesPage'
import { navigation } from './data/portalData'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('geotree_auth') === 'true'
  })

  const location = useLocation()
  const navigate = useNavigate()

  // The activeItem is based on the current pathname
  const currentPath = location.pathname.replace(/^\//, '') || 'dashboard'
  const activeItem = useMemo(
    () => {
      if (currentPath === 'profile') return { id: 'profile', label: 'User Profile' }
      if (currentPath === 'settings') return { id: 'settings', label: 'System Settings' }
      return navigation.find((item) => item.id === currentPath) || navigation[0]
    },
    [currentPath]
  )

  const handleLogin = () => {
    localStorage.setItem('geotree_auth', 'true')
    setIsAuthenticated(true)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('geotree_auth')
    localStorage.removeItem('token')
    setIsAuthenticated(false)
  }

  const handleNavigate = (nextRoute) => {
    navigate(`/${nextRoute}`)
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
      </Routes>
    )
  }

  return (
    <AppShell activeItem={activeItem} onNavigate={handleNavigate} onLogout={handleLogout}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/states" element={<StateSelectionPage />} />
        <Route path="/plantation-sites" element={<PlantationSitesPage />} />
        <Route path="/species" element={<SpeciesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/occasions" element={<OccasionsPage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/nurseries" element={<NurseriesPage />} />
        <Route path="/admins" element={<AdminsPage />} />
        <Route path="/app-users" element={<AppUsersPage />} />
        <Route path="/carbon-footprint" element={<CarbonFootprintPage />} />
        <Route path="/emission-factors" element={<EmissionFactorsPage />} />
        <Route path="/user-plantations" element={<UserPlantationsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/plantation-inventory" element={<PlantationInventoryPage />} />
        <Route path="/certificate-templates" element={<CertificateTemplatesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  )
}

export default App
