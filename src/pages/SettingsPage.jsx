import React, { useState } from 'react'
import Icon from '../components/Icon'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('data_backup')

  const tabs = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'security', label: 'Security', icon: 'shield' },
    { id: 'business_rules', label: 'Business Rules', icon: 'dollar-sign' },
    { id: 'integrations', label: 'Integrations', icon: 'globe' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'data_backup', label: 'Data & Backup', icon: 'database' },
  ]

  return (
    <div className="w-full pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="m-0 text-[26px] font-black text-gray-900 tracking-tight">System Settings</h2>
          <p className="m-0 mt-1.5 text-[15px] font-medium text-gray-500">Configure global application preferences and rules.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#28479d] hover:bg-[#1f377a] text-white rounded-[10px] text-[13px] font-bold cursor-pointer transition-colors shadow-md shadow-blue/20 border-0" type="button">
          <Icon name="edit-3" size={16} /> Enable Editing
        </button>
      </div>

      <div className="bg-white rounded-[24px] shadow-[0_10px_40px_rgba(20,30,50,0.03)] border border-gray-100 flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        
        {/* Settings Sidebar */}
        <aside className="w-full md:w-[260px] border-b md:border-b-0 md:border-r border-gray-100 p-6 flex flex-col gap-2 shrink-0">
          {tabs.map((tab) => {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-[12px] text-[14px] font-bold transition-colors border-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#28479d] text-white'
                    : 'bg-transparent text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                }`}
                type="button"
              >
                <Icon name={tab.icon} size={18} className={activeTab === tab.id ? 'opacity-100' : 'opacity-60'} />
                {tab.label}
              </button>
            )
          })}
        </aside>

        {/* Settings Content */}
        <main className="flex-1 p-8 lg:p-12">
          {activeTab === 'general' && (
            <div className="max-w-[700px]">
              <h3 className="m-0 text-[20px] font-black text-gray-900 tracking-tight mb-6">General Settings</h3>
              
              <div className="flex flex-col gap-8">
                
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-gray-700">Application Name</label>
                  <div className="h-[52px] bg-gray-50/80 rounded-[12px] border border-gray-100 px-4 flex items-center text-[15px] font-medium text-gray-600 cursor-not-allowed">
                    GeoTree Portal
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-gray-700">Support Email</label>
                  <div className="h-[52px] bg-gray-50/80 rounded-[12px] border border-gray-100 px-4 flex items-center text-[15px] font-medium text-gray-600 cursor-not-allowed">
                    support@geotree.com
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-gray-700">Language</label>
                  <div className="h-[52px] bg-gray-50/80 rounded-[12px] border border-gray-100 px-4 flex items-center justify-between text-[15px] font-medium text-gray-600 cursor-not-allowed">
                    <span>English</span>
                    <Icon name="chevron-down" size={16} className="text-gray-400" />
                  </div>
                </div>

                <hr className="border-t border-gray-100 my-2" />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="m-0 text-[14px] font-bold text-gray-700 mb-1">Maintenance Mode</h4>
                    <p className="m-0 text-[13px] text-gray-500">Prevent users from accessing the system during updates.</p>
                  </div>
                  {/* Fake Toggle Switch */}
                  <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-not-allowed opacity-80">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-[700px]">
              <h3 className="m-0 text-[20px] font-black text-gray-900 tracking-tight mb-8">Security Configuration</h3>
              
              <div className="flex flex-col">
                
                <div className="flex items-center justify-between pb-8 mb-8 border-b border-gray-100">
                  <div>
                    <h4 className="m-0 text-[14px] font-bold text-gray-700 mb-1">Two-Factor Authentication (2FA)</h4>
                    <p className="m-0 text-[13px] text-gray-500">Enforce 2FA for all admin accounts.</p>
                  </div>
                  {/* Active Toggle Switch */}
                  <div className="w-11 h-6 bg-[#8095d3] rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pb-8 border-b border-gray-100">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold text-gray-700">Password Expiry (Days)</label>
                    <div className="h-[48px] bg-gray-50 rounded-[12px] border border-gray-100 px-4 flex items-center justify-between text-[14px] font-medium text-gray-600 cursor-not-allowed">
                      <span>90 Days</span>
                      <Icon name="chevron-down" size={16} className="text-gray-400" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold text-gray-700">Session Timeout (Minutes)</label>
                    <div className="h-[48px] bg-gray-50 rounded-[12px] border border-gray-100 px-4 flex items-center text-[14px] font-medium text-gray-600 cursor-not-allowed">
                      30
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
          
          {activeTab === 'business_rules' && (
            <div className="max-w-[700px]">
              <h3 className="m-0 text-[20px] font-black text-gray-900 tracking-tight mb-8">Business Logic</h3>
              
              <div className="flex flex-col gap-6">
                
                <div className="px-5 py-4 bg-pink-50/50 rounded-[12px] border border-pink-100 text-[13px] font-semibold text-[#db2777]">
                  Use caution when changing these values. They affect calculations across the entire platform.
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-[12px] font-bold text-gray-700">Base Carbon Price ($/Ton)</label>
                  <div className="h-[48px] bg-gray-50/80 rounded-[12px] border border-gray-100 px-4 flex items-center text-[14px] font-medium text-gray-600 cursor-not-allowed">
                    15.50
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-gray-700">Certificate Prefix</label>
                  <div className="h-[48px] bg-gray-50/80 rounded-[12px] border border-gray-100 px-4 flex items-center text-[14px] font-medium text-gray-600 cursor-not-allowed">
                    GT-CERT-
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-gray-700">Default Area Unit</label>
                  <div className="h-[48px] bg-gray-50/80 rounded-[12px] border border-gray-100 px-4 flex items-center justify-between text-[14px] font-medium text-gray-600 cursor-not-allowed">
                    <span>Hectares</span>
                    <Icon name="chevron-down" size={16} className="text-gray-400" />
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="max-w-[700px]">
              <h3 className="m-0 text-[20px] font-black text-gray-900 tracking-tight mb-8">External Integrations</h3>
              
              <div className="flex flex-col gap-6">
                
                {/* Map Service Block */}
                <div className="bg-gray-50/50 border border-gray-100 rounded-[16px] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Icon name="globe" size={20} className="text-gray-500" />
                    <h4 className="m-0 text-[15px] font-bold text-gray-900">Map Service (Google Maps)</h4>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold text-gray-700">API Key</label>
                    <div className="h-[48px] bg-gray-50/80 rounded-[12px] border border-gray-100 px-4 flex items-center text-[14px] font-medium text-gray-400 cursor-not-allowed">
                      AIzaSyD... (Hidden)
                    </div>
                  </div>
                </div>

                {/* Payment Gateway Block */}
                <div className="bg-gray-50/50 border border-gray-100 rounded-[16px] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Icon name="dollar-sign" size={20} className="text-gray-500" />
                    <h4 className="m-0 text-[15px] font-bold text-gray-900">Payment Gateway</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-bold text-gray-700">Provider</label>
                      <div className="h-[48px] bg-gray-50/80 rounded-[12px] border border-gray-100 px-4 flex items-center justify-between text-[14px] font-medium text-gray-600 cursor-not-allowed">
                        <span>Stripe</span>
                        <Icon name="chevron-down" size={16} className="text-gray-400" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-bold text-gray-700">Mode</label>
                      <div className="h-[48px] bg-gray-50/80 rounded-[12px] border border-gray-100 px-4 flex items-center justify-between text-[14px] font-medium text-gray-600 cursor-not-allowed">
                        <span>Test (Sandbox)</span>
                        <Icon name="chevron-down" size={16} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-[700px]">
              <h3 className="m-0 text-[20px] font-black text-gray-900 tracking-tight mb-6">Notification Preferences</h3>
              <hr className="border-t border-gray-100 mb-8" />
              
              <div className="flex flex-col">
                
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h4 className="m-0 text-[14px] font-bold text-gray-700 mb-1">Email Alerts</h4>
                    <p className="m-0 text-[13px] text-gray-500">Receive system alerts via email.</p>
                  </div>
                  {/* Active Toggle Switch */}
                  <div className="w-11 h-6 bg-[#8095d3] rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm" />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h4 className="m-0 text-[14px] font-bold text-gray-700 mb-1">SMS Notifications</h4>
                    <p className="m-0 text-[13px] text-gray-500">Receive urgent updates via SMS (Charges may apply).</p>
                  </div>
                  {/* Inactive Toggle Switch */}
                  <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="m-0 text-[14px] font-bold text-gray-700 mb-1">Weekly Summary Reports</h4>
                    <p className="m-0 text-[13px] text-gray-500">Receive a weekly summary of platform activity.</p>
                  </div>
                  {/* Active Toggle Switch */}
                  <div className="w-11 h-6 bg-[#8095d3] rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm" />
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'data_backup' && (
            <div className="max-w-[700px]">
              <h3 className="m-0 text-[20px] font-black text-gray-900 tracking-tight mb-6">Data Management</h3>
              <hr className="border-t border-gray-100 mb-8" />
              
              <div className="flex flex-col gap-6">
                
                {/* Status Block */}
                <div className="bg-[#f5f8ff] border border-blue-100 rounded-[12px] p-6 flex items-start gap-4">
                  <Icon name="server" size={24} className="text-[#28479d] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="m-0 text-[14px] font-bold text-[#28479d] mb-1">Last Backup: Oct 24, 2024 at 02:00 AM</h4>
                    <p className="m-0 text-[13px] text-[#4f6ab8]">Backups are performed automatically every 24 hours.</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="h-[52px] bg-white border border-gray-200 rounded-[12px] flex items-center justify-center gap-2 text-[14px] font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer" type="button">
                    <Icon name="save" size={18} /> Backup Now
                  </button>
                  <button className="h-[52px] bg-white border border-gray-200 rounded-[12px] flex items-center justify-center gap-2 text-[14px] font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer" type="button">
                    <Icon name="database" size={18} /> Download Logs
                  </button>
                </div>

              </div>
            </div>
          )}

          {activeTab !== 'general' && activeTab !== 'security' && activeTab !== 'business_rules' && activeTab !== 'integrations' && activeTab !== 'notifications' && activeTab !== 'data_backup' && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 min-h-[300px]">
              <Icon name={tabs.find(t => t.id === activeTab)?.icon} size={48} className="mb-4 opacity-20" />
              <p className="font-semibold">{tabs.find(t => t.id === activeTab)?.label} settings coming soon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
