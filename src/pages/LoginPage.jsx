import { useState } from 'react'
import Logo from '../components/Logo'
import Icon from '../components/Icon'

import { apiService } from '../config/apiService'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@geotree.com')
  const [password, setPassword] = useState('AdminPassword123!')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (email && password) {
      try {
        setLoading(true)
        const res = await apiService.adminLogin({ email, password })
        if (res.status && res.data?.token) {
          localStorage.setItem('token', res.data.token)
          onLogin()
        } else {
          setError(true)
        }
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 lg:p-8">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[#425a43]/20" />
      
      <div className="relative z-10 flex w-full max-w-[1000px] min-h-[640px] rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(20,30,50,0.15)] flex-col lg:flex-row">
        
        {/* Left Side */}
        <div className="flex-1 bg-gradient-to-br from-[#f2e6e3]/80 via-[#e3ebdb]/80 to-[#c8d6cb]/80 backdrop-blur-xl p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden">
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl px-4 py-2 inline-block w-max mb-12 shadow-sm border border-white/40">
              <Logo />
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <h1 className="text-3xl lg:text-[42px] leading-[1.15] font-black text-[#1a2b3c] tracking-tight m-0 mb-6">
                One tree at a time,<br />
                <span className="text-pink italic font-black">one future at a time.</span>
              </h1>
              <p className="text-[15px] leading-relaxed text-gray-700 font-medium m-0 mb-10 max-w-[420px]">
                GeoTree's admin portal for plantations, nurseries, IPL
                Dot Ball orders, carbon credits & certificates.
              </p>
              
              <ul className="list-none p-0 m-0 flex flex-col gap-5">
                <li className="flex items-center gap-4 text-[13px] font-bold text-gray-800 tracking-wide">
                  <span className="w-8 h-8 grid place-items-center bg-pink/20 rounded-lg text-pink"><Icon name="pin" size={16} /></span>
                  Plantation sites, species & nurseries
                </li>
                <li className="flex items-center gap-4 text-[13px] font-bold text-gray-800 tracking-wide">
                  <span className="w-8 h-8 grid place-items-center bg-pink/20 rounded-lg text-pink"><Icon name="trophy" size={16} /></span>
                  IPL Dot Ball — Tree plantation initiative
                </li>
              </ul>
            </div>

            <div className="mt-12 p-6 bg-black/[0.04] border border-black/[0.08] rounded-2xl">
              <strong className="block text-[11px] text-pink font-black tracking-widest uppercase mb-2">🏏 EVERY DOT BALL = 1 TREE PLANTED</strong>
              <p className="text-[13px] leading-relaxed text-gray-700 font-medium m-0">Every dot ball bowled now results in a real tree planted across India's plantation sites.</p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-[460px] p-10 lg:p-14 flex flex-col justify-center bg-[#eef0ea]">
          <div className="w-full max-w-[340px] mx-auto flex flex-col h-full justify-center">
            
            <div className="inline-flex items-center self-start gap-2 px-3 py-1.5 mb-8 rounded-full bg-blue/10 border border-blue/20 text-blue text-[10px] font-black tracking-widest uppercase">
              <Icon name="lock" size={14} /> SECURE ADMIN ACCESS
            </div>
            
            <h2 className="text-[32px] font-black text-gray-900 tracking-tight m-0 mb-2">Welcome back</h2>
            <p className="text-[14px] text-gray-500 font-semibold m-0 mb-8">Sign in to your portal account</p>

            {error && (
              <div className="flex items-center gap-3 p-4 mb-8 bg-red-50 text-red-600 rounded-xl text-[12px] font-bold uppercase tracking-wider border border-red-100">
                <span className="text-red-500 text-lg">▪</span> bad auth : authentication failed
              </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2.5">
                <label htmlFor="email" className="text-[12px] font-extrabold text-gray-700 uppercase tracking-widest">Email Address</label>
                <input
                  id="email"
                  name="email"
                  autoComplete="email"
                  className="w-full h-[52px] px-5 bg-[#f4f6f1] border border-[#dce0d8] rounded-xl text-[14px] font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-pink focus:ring-4 focus:ring-pink/10"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[12px] font-extrabold text-gray-700 uppercase tracking-widest">Password</label>
                  <button type="button" className="text-[12px] font-bold text-pink hover:text-pink/80 bg-transparent border-0 cursor-pointer">Forgot password?</button>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    className="w-full h-[52px] px-5 pr-12 bg-[#f4f6f1] border border-[#dce0d8] rounded-xl text-[14px] font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-pink focus:ring-4 focus:ring-pink/10"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" className="absolute right-3 w-10 h-10 grid place-items-center text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer">
                    <Icon name="eye" size={18} />
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="mt-4 w-full h-[54px] flex items-center justify-center gap-3 bg-pink hover:bg-pink/90 text-white border-0 rounded-xl text-[15px] font-bold tracking-wide cursor-pointer transition-all shadow-[0_8px_25px_rgba(223,59,145,0.35)] hover:-translate-y-0.5"
              >
                Sign In to Portal <Icon name="arrow-right" size={18} />
              </button>
            </form>
            
            <div className="mt-auto pt-12 text-[11px] font-semibold text-gray-500 text-center leading-relaxed">
              © 2026 Geo Planet Solution Private Limited.<br />
              All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
