import React from 'react'
import Icon from '../components/Icon'

export default function ProfilePage() {
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
            S
          </div>
          
          <h3 className="m-0 text-[22px] font-black text-gray-900 tracking-tight mb-1">Super Admin</h3>
          <p className="m-0 text-[14px] font-semibold text-gray-500 mb-5">admin@geotree.com</p>
          
          <div className="inline-flex items-center gap-2 h-9 px-4 bg-blue-50 text-blue-700 rounded-full text-[12px] font-black tracking-wide">
            <Icon name="shield" size={14} /> Super Admin
          </div>
          
          <hr className="w-[85%] border-t border-gray-100 my-8" />
          
          <div className="w-[85%] h-[48px] bg-gray-50 rounded-[14px] flex items-center gap-3 px-5 text-gray-600">
            <Icon name="mail" size={16} className="text-gray-400" />
            <span className="text-[13px] font-semibold">admin@geotree.com</span>
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
                Super Admin
              </div>
            </div>
          </section>

          {/* Access & Permissions */}
          <section className="bg-white p-8 rounded-[24px] shadow-[0_10px_40px_rgba(20,30,50,0.03)] border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-blue-50 text-blue-600 grid place-items-center">
                  <Icon name="shield" size={18} />
                </div>
                <h3 className="m-0 text-[18px] font-black text-gray-900 tracking-tight">Access & Permissions</h3>
              </div>
              <span className="inline-flex h-8 px-3 items-center bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                0 ACTIVE PERMISSIONS
              </span>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}
