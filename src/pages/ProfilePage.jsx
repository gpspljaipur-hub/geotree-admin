import React, { useState, useEffect } from 'react'
import Icon from '../components/Icon'
import { apiService } from '../config/apiService'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await apiService.getAdminProfile()
      setProfile(res?.data?.data || res?.data || null)
    } catch (err) {
      console.error("Error fetching profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const roleLabels = {
    'super_admin': 'Super Admin',
    'admin': 'Admin',
    'editor': 'Editor',
    'viewer': 'Viewer'
  }

  const formatRole = (roleStr) => {
    if (!roleStr) return 'User'
    return roleLabels[roleStr.toLowerCase()] || roleStr.toUpperCase()
  }

  if (loading) {
    return (
      <div className="max-w-[1000px] w-full pb-10 flex items-center justify-center min-h-[400px]">
        <span className="text-gray-400 font-bold tracking-widest text-[14px]">Loading Profile...</span>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-[1000px] w-full pb-10 flex items-center justify-center min-h-[400px]">
        <span className="text-red-400 font-bold tracking-widest text-[14px]">Failed to load profile</span>
      </div>
    )
  }

  const initial = profile?.name ? profile.name.charAt(0).toUpperCase() : '?'
  const roleDisplay = formatRole(profile?.role)
  const joinedDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown'

  return (
    <div className="max-w-[1000px] w-full pb-10">
      <div className="mb-10">
        <h2 className="m-0 text-[26px] font-black text-gray-900 tracking-tight">My Profile</h2>
        <p className="m-0 mt-1.5 text-[15px] font-medium text-gray-500">Manage your personal information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-[30px]">
        
        {/* Left Column - Profile Card */}
        <section className="bg-white rounded-[24px] shadow-[0_10px_40px_rgba(20,30,50,0.03)] border border-gray-100 overflow-hidden flex flex-col items-center pb-8 relative">
          {/* Gradient Header */}
          <div className="h-[140px] w-full bg-gradient-to-r from-blue to-pink mb-14" />
          
          {/* Avatar Area */}
          <div className="absolute top-[80px] w-[110px] h-[110px] rounded-full bg-blue text-white grid place-items-center text-[36px] font-black shadow-[0_0_0_8px_white]">
            {initial}
          </div>
          
          <h3 className="m-0 text-[22px] font-black text-gray-900 tracking-tight mb-1">{profile.name || 'Admin User'}</h3>
          <p className="m-0 text-[14px] font-semibold text-gray-500 mb-5">{profile.email}</p>
          
          <div className="inline-flex items-center gap-2 h-9 px-4 bg-blue-50 text-blue-700 rounded-full text-[12px] font-black tracking-wide">
            <Icon name="shield" size={14} /> {roleDisplay}
          </div>
          
          <hr className="w-[85%] border-t border-gray-100 my-8" />
          
          <div className="w-[85%] h-[48px] bg-gray-50 rounded-[14px] flex items-center gap-3 px-5 text-gray-600 mb-3">
            <Icon name="mail" size={16} className="text-gray-400" />
            <span className="text-[13px] font-semibold truncate">{profile.email}</span>
          </div>

          <div className="w-[85%] h-[48px] bg-gray-50 rounded-[14px] flex items-center gap-3 px-5 text-gray-600">
            <Icon name="calendar" size={16} className="text-gray-400" />
            <span className="text-[13px] font-semibold">Joined {joinedDate}</span>
          </div>
        </section>

        {/* Right Column - Forms/Info */}
        <div className="flex flex-col gap-[30px]">
          
          {/* Basic Information */}
          <section className="bg-white p-8 rounded-[24px] shadow-[0_10px_40px_rgba(20,30,50,0.03)] border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-[12px] bg-pink-50 text-pink-600 grid place-items-center">
                <Icon name="user" size={18} />
              </div>
              <h3 className="m-0 text-[18px] font-black text-gray-900 tracking-tight">Basic Information</h3>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wide">Full Name</label>
              <div className="h-[52px] bg-gray-50 rounded-[12px] border border-gray-100 px-4 flex items-center text-[14px] font-semibold text-gray-500 cursor-not-allowed">
                {profile.name || '—'}
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-6">
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wide">Email Address</label>
              <div className="h-[52px] bg-gray-50 rounded-[12px] border border-gray-100 px-4 flex items-center text-[14px] font-semibold text-gray-500 cursor-not-allowed">
                {profile.email || '—'}
              </div>
            </div>
          </section>

          {/* Access & Permissions */}
          <section className="bg-white p-8 rounded-[24px] shadow-[0_10px_40px_rgba(20,30,50,0.03)] border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-blue-50 text-blue-600 grid place-items-center">
                  <Icon name="shield" size={18} />
                </div>
                <h3 className="m-0 text-[18px] font-black text-gray-900 tracking-tight">Access & Permissions</h3>
              </div>
              <span className={`inline-flex h-8 px-3 items-center rounded-full text-[10px] font-black uppercase tracking-widest ${profile.status ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {profile.status ? 'ACCOUNT ACTIVE' : 'ACCOUNT INACTIVE'}
              </span>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-[16px] border border-gray-100">
              <p className="m-0 text-[13px] font-medium text-gray-600 leading-relaxed">
                Your account is currently assigned the <strong className="text-blue">{roleDisplay}</strong> role. This role dictates your read/write privileges across the administrative dashboard. 
                {profile.role === 'super_admin' ? ' You have full access to all modules.' : ' You have restricted access according to your assigned module clearances.'}
              </p>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}
