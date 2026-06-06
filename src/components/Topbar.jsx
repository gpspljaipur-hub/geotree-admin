import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'

function ProfileMenu({ open, onLogout, onProfile, onSettings }) {
  if (!open) return null
  return (
    <div className="absolute top-[calc(100%+14px)] right-0 w-[240px] p-[18px] bg-white rounded-[22px] shadow-[0_12px_40px_rgba(20,30,50,0.15)] border border-gray-100 flex flex-col z-50">
      <div className="pb-4 mb-2 border-b border-gray-100 flex flex-col px-1">
        <strong className="text-[13px] font-[850] text-gray-900">Super Admin</strong>
        <span className="text-[11px] text-gray-400 font-semibold mt-0.5">admin@geotree.com</span>
      </div>
      <button className="flex items-center gap-3 h-[42px] px-3 bg-transparent border-0 rounded-[10px] text-[12px] font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors" onClick={onProfile} type="button"><Icon name="user" size={18} /> Profile</button>
      <button className="flex items-center gap-3 h-[42px] px-3 bg-transparent border-0 rounded-[10px] text-[12px] font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors" onClick={onSettings} type="button"><Icon name="settings" size={18} /> Settings</button>
      <button className="flex items-center gap-3 h-[42px] px-3 bg-transparent border-0 rounded-[10px] text-[12px] font-bold text-[#e11d48] hover:bg-[#e11d48]/5 cursor-pointer transition-colors mt-1" onClick={onLogout} type="button"><Icon name="logout" size={18} /> Log out</button>
    </div>
  )
}

function LogoutModal({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[100] p-4 md:p-8 grid place-items-center bg-slate-900/40 backdrop-blur-sm overflow-y-auto" role="presentation" onMouseDown={onClose}>
      <section className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between min-h-[60px] px-6 border-b border-gray-100">
          <h3 className="text-base font-extrabold text-gray-900 m-0">Logout Confirmation</h3>
          <button className="p-2 text-gray-400 hover:text-gray-700 bg-transparent border-0 cursor-pointer" onClick={onClose} aria-label="Close" type="button"><Icon name="x" size={20} /></button>
        </header>
        <div className="p-10 pb-6 text-center">
          <div className="w-[72px] h-[72px] mx-auto mb-6 grid place-items-center bg-blue/10 rounded-full text-blue shadow-[0_0_0_10px_rgba(40,71,157,0.05)]">
            <Icon name="logout" size={30} />
          </div>
          <h4 className="m-0 mb-3 text-base font-black text-gray-900 uppercase tracking-wide">LOGOUT CONFIRMATION</h4>
          <p className="m-0 text-[13px] leading-relaxed text-gray-600">Are you sure you want to sign out of your account? You will need to login again to access the admin panel.</p>
        </div>
        <footer className="flex gap-3 px-8 pb-8 justify-center">
          <button className="flex-1 min-h-[44px] bg-white border border-gray-200 text-gray-900 text-[11px] font-bold tracking-widest uppercase rounded-xl cursor-pointer hover:bg-gray-50 transition-colors" onClick={onClose} type="button">NO, STAY</button>
          <button className="flex-1 min-h-[44px] bg-indigo border border-indigo text-white text-[11px] font-bold tracking-widest uppercase rounded-xl cursor-pointer hover:bg-indigo/90 transition-colors shadow-md shadow-indigo/20" onClick={onConfirm} type="button">YES, LOG OUT</button>
        </footer>
      </section>
    </div>
  )
}

export default function Topbar({ title, onMenu, onLogout, onBack }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogoutClick = () => {
    setProfileOpen(false)
    setLogoutModalOpen(true)
  }

  const handleProfileClick = () => {
    setProfileOpen(false)
    navigate('/profile')
  }

  const handleSettingsClick = () => {
    setProfileOpen(false)
    navigate('/settings')
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between min-h-[80px] px-6 md:px-12 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button className="lg:hidden w-10 h-10 flex flex-col justify-center gap-[5px] bg-transparent border-0 cursor-pointer text-gray-900 p-2" onClick={onMenu} aria-label="Open navigation" type="button">
            <span className="h-[2px] bg-current rounded-full w-full" />
            <span className="h-[2px] bg-current rounded-full w-4/5" />
            <span className="h-[2px] bg-current rounded-full w-full" />
          </button>
          {onBack ? (
            <button className="p-2 -ml-2 text-gray-400 hover:text-blue bg-transparent border-0 cursor-pointer transition-colors" onClick={onBack} type="button">
              <Icon name="chevron-left" size={20} />
            </button>
          ) : (
            <Icon name="chevron-left" size={20} className="text-gray-400 hidden lg:block" />
          )}
          <h1 className="m-0 text-[20px] font-black tracking-tight text-blue">{title}</h1>
        </div>
        <div className="relative">
          <button className="flex items-center gap-3.5 h-[50px] px-2 bg-transparent border-0 cursor-pointer hover:bg-gray-50 rounded-full transition-all" onClick={() => setProfileOpen((value) => !value)} type="button">
            <span className="hidden sm:flex flex-col text-right">
              <strong className="text-[13px] font-black text-gray-900">Super Admin</strong>
              <small className="text-[9px] font-black text-blue uppercase tracking-widest mt-0.5">SUPER ADMIN</small>
            </span>
            <b className="w-10 h-10 grid place-items-center bg-pink text-white rounded-full text-[14px] font-black shadow-[0_4px_10px_rgba(223,59,145,0.3)]">S</b>
          </button>
          <ProfileMenu open={profileOpen} onLogout={handleLogoutClick} onProfile={handleProfileClick} onSettings={handleSettingsClick} />
        </div>
      </header>
      
      {logoutModalOpen && (
        <LogoutModal onClose={() => setLogoutModalOpen(false)} onConfirm={onLogout} />
      )}
    </>
  )
}
