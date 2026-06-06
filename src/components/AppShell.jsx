import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell({ activeItem, onNavigate, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleBack = (activeItem.id === 'profile' || activeItem.id === 'settings') 
    ? () => navigate('/dashboard') 
    : undefined

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <Sidebar
        activeId={activeItem.id}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={onNavigate}
      />
      <div className="flex-1 lg:ml-[280px] flex flex-col min-h-[100vh]">
        <Topbar title={activeItem.label} onMenu={() => setSidebarOpen(true)} onLogout={onLogout} onBack={handleBack} />
        <main className="flex-1 px-[24px] md:px-[48px] py-[40px] max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
