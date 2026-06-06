import { useState, useEffect } from 'react'
import Icon from '../components/Icon'
import { apiService } from '../config/apiService'

function MetricCard({ metric }) {
  return (
    <article
      className={`relative p-6 rounded-[24px] flex justify-between items-center overflow-hidden shadow-[0_10px_40px_rgba(20,30,50,0.02)] hover:shadow-[0_15px_40px_rgba(20,30,50,0.06)] transition-all cursor-default bg-white border ${metric.featured ? 'border-transparent' : 'border-gray-100'}`}
      style={metric.featured ? { boxShadow: '0 20px 50px rgba(223,59,145,0.08)' } : undefined}
    >
      {metric.featured && (
        <div className="absolute bottom-0 left-10 right-10 h-1.5 bg-pink rounded-t-full shadow-[0_0_20px_rgba(223,59,145,0.8)]" />
      )}
      <div className="flex flex-col z-10 h-full justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{metric.label}</span>
        <strong className="text-[28px] leading-none font-black tracking-tight text-gray-900 mb-3">{metric.value}</strong>
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
          {metric.trend && <span className="flex items-center gap-[2px] text-[10px] font-black px-1.5 py-0.5 bg-[#e8f6f0] text-[#0d945b] rounded-[4px] tracking-widest uppercase">↗ {metric.trend}</span>}
          <span className="tracking-wide">{metric.note}</span>
        </div>
      </div>
      <div 
        className={`w-14 h-14 rounded-[16px] grid place-items-center relative z-10 transition-transform ${metric.featured ? 'rotate-12 scale-105' : ''}`}
        style={{ backgroundColor: metric.color, color: '#fff', boxShadow: `0 12px 25px ${metric.color}50` }}
      >
        <Icon name={metric.icon} size={24} />
      </div>
    </article>
  )
}

function ReportPanel({ icon, title, subtitle, color, emptyMessage, data = [] }) {
  const hasData = data.length > 0;
  return (
    <section className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-[0_10px_40px_rgba(20,30,50,0.02)] flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6" style={{ color }}>
        <div className="w-[42px] h-[42px] rounded-xl grid place-items-center text-white shadow-lg shrink-0" style={{ backgroundColor: color, boxShadow: `0 10px 25px ${color}40` }}>
          <Icon name={icon} size={20} />
        </div>
        <div>
          <h3 className="m-0 text-[18px] font-black text-gray-900 tracking-tight">{title}</h3>
          <p className="m-0 mt-1 text-[10px] font-black tracking-widest uppercase text-gray-400">{subtitle}</p>
        </div>
      </div>
      
      <div className={`flex-1 flex flex-col ${!hasData ? 'items-center justify-center' : ''}`}>
        {!hasData ? (
          <span className="px-5 py-2 bg-gray-50 text-gray-400 text-[10px] font-black tracking-widest uppercase rounded-full">{emptyMessage}</span>
        ) : (
          <div className="flex flex-col gap-3">
            {data.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-[12px] font-bold text-gray-700">{item.label}</span>
                <span className="text-[14px] font-black" style={{ color }}>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await apiService.getDashboardStats()
        if (res?.data) {
          setStats(res.data)
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const metricsData = [
    { label: 'Total Users', value: stats?.users?.total || '0', note: 'Registered Heroes', icon: 'users', color: '#3946c6' },
    { label: 'Trees Planted', value: stats?.impact?.trees_planted || '0', note: 'Green Legacy', icon: 'tree', color: '#45b984' },
    { label: 'Carbon Offset', value: `-${stats?.impact?.carbon_offset_tonnes || '0'} t`, note: 'CO2e Sequestered', icon: 'pulse', color: '#dc307d', featured: true },
    { label: 'Total Revenue', value: `₹${stats?.finance?.total_revenue || '0'}`, note: 'Platform Earnings', icon: 'card', color: '#efa000' },
    { label: 'Certificates', value: stats?.certificate?.total || '0', note: 'Awards Minted', icon: 'crown', color: '#ad27eb' },
    { label: 'Active Sites', value: stats?.active_sites?.total || '0', note: 'Green Hubs', icon: 'pin', color: '#3da9ef' },
    { label: 'Total Orders', value: stats?.orders?.total || '0', note: `${stats?.orders?.pending || 0} Action Required`, icon: 'box', color: '#7453ac' },
    { label: 'IPL Dot Balls', value: stats?.ipl?.dot_balls || '0', note: 'Game Changers', icon: 'sparkle', color: '#e43859' },
  ]

  const stateWiseImpact = (stats?.impact?.state_wise || []).map(sw => ({
    label: sw.state,
    value: `${sw.trees} trees / ${sw.carbon} kg CO2`
  }))

  const orderStatuses = stats?.orders ? [
    { label: 'Completed', value: stats.orders.completed },
    { label: 'Pending', value: stats.orders.pending },
  ] : []

  return (
    <div className="max-w-[1200px] w-full mx-auto">
      <section 
        className="text-white rounded-[28px] px-8 py-8 md:px-[40px] md:py-[32px] mb-8 relative overflow-hidden shadow-[0_20px_50px_rgba(32,57,125,0.2)]"
        style={{ background: 'linear-gradient(105deg, #28479d 0%, #764197 50%, #df3b91 100%)' }}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />
        
        <div className="relative z-10 flex flex-col items-start">
          <div className="inline-flex items-center gap-[8px] px-3 py-1 mb-4 rounded-full bg-white/20 border border-white/20 text-[10px] font-black tracking-widest uppercase text-white backdrop-blur-sm shadow-sm">
            <Icon name="sparkle" size={12} className="text-pink-300" /> LIVE TELEMETRY
          </div>
          <h2 className="text-[36px] md:text-[44px] font-black tracking-[-1px] leading-tight m-0 mb-2">Command Center</h2>
          <p className="text-[14px] md:text-[15px] leading-relaxed text-indigo-50/90 font-medium m-0 max-w-[500px]">
            Real-time intelligence and impact tracking across your entire planetary green initiative. Let's make the world breathe better.
          </p>
        </div>
      </section>
      
      {loading ? (
        <div className="p-20 text-center text-gray-500 font-semibold animate-pulse">Synchronizing Telemetry...</div>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px] mb-[20px]">
            {metricsData.map((metric) => <MetricCard metric={metric} key={metric.label} />)}
          </section>
          
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[20px]">
            <ReportPanel icon="target" color="#df3b91" title="State-wise Impact Vectors" subtitle="TREES PLACED BY TERRITORY" emptyMessage="AWAITING INITIAL DATA" data={stateWiseImpact} />
            <ReportPanel icon="pulse" color="#28479d" title="Order Fulfillment Array" subtitle="STATUS DISTRIBUTION MATRIX" emptyMessage="NO ACTIVE ORDERS" data={orderStatuses} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-[20px]">
            
            {/* Output Sync Card */}
            <article className="relative overflow-hidden p-5 rounded-[24px] shadow-[0_10px_40px_rgba(20,30,50,0.05)] bg-[#263b87]">
              <div className="mb-4 absolute right-[-20px] top-[-20px] opacity-20 pointer-events-none">
                <Icon name="crown" size={180} className="text-blue-200" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Icon name="pulse" size={20} className="text-blue-200" />
                  <div>
                    <h3 className="m-0 text-[18px] font-black text-white tracking-tight leading-none">Output Sync</h3>
                    <p className="m-0 mt-1 text-[8px] font-black tracking-widest uppercase text-blue-200">CORE ECOLOGICAL METRICS</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="px-5 py-4 rounded-[16px] bg-white/[0.05] border border-white/[0.08] backdrop-blur-md">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-blue-200 mb-1">TREES PLANTED</span>
                    <strong className="block text-[24px] font-black text-white tracking-tight leading-none">{stats?.impact?.trees_planted || '0'}</strong>
                  </div>
                  <div className="px-5 py-4 rounded-[16px] bg-white/[0.05] border border-white/[0.08] backdrop-blur-md">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-blue-200 mb-1">CARBON SHIELD ARRAY</span>
                    <strong className="block text-[24px] font-black text-pink tracking-tight leading-none">-{stats?.impact?.carbon_offset_tonnes || '0'} <span className="text-[12px] text-pink/80 font-bold">tonnes</span></strong>
                  </div>
                  <div className="px-5 py-4 rounded-[16px] bg-white/[0.05] border border-white/[0.08] backdrop-blur-md">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-blue-200 mb-1">NURSERY STOCK RESERVES</span>
                    <strong className="block text-[24px] font-black text-white tracking-tight leading-none">{stats?.nursery?.stock_summary || '0'} <span className="text-[12px] text-white/70 font-bold">plants</span></strong>
                  </div>
                </div>
              </div>
            </article>

            {/* Operations Ledger Card */}
            <article className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-[0_10px_40px_rgba(20,30,50,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Icon name="zap" size={20} className="text-[#f59e0b]" />
                  <h3 className="m-0 text-[18px] font-black text-gray-900 tracking-tight">Operations Ledger</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-5 py-3 rounded-[16px] border border-gray-100 bg-white shadow-sm hover:border-indigo-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center"><Icon name="box" size={14} /></div>
                      <strong className="text-[12px] font-extrabold text-[#334155]">Cumulative Orders</strong>
                    </div>
                    <strong className="text-[16px] font-black text-indigo-600">{stats?.orders?.total || '0'}</strong>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3 rounded-[16px] border border-gray-100 bg-white shadow-sm hover:border-emerald-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center"><Icon name="check-circle" size={14} /></div>
                      <strong className="text-[12px] font-extrabold text-[#334155]">Successfully Fulfilled</strong>
                    </div>
                    <strong className="text-[16px] font-black text-emerald-600">{stats?.orders?.completed || '0'}</strong>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3 rounded-[16px] border border-gray-100 bg-white shadow-sm hover:border-orange-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 grid place-items-center"><Icon name="pulse" size={14} /></div>
                      <strong className="text-[12px] font-extrabold text-[#334155]">Pending Processing</strong>
                    </div>
                    <strong className="text-[16px] font-black text-orange-600">{stats?.orders?.pending || '0'}</strong>
                  </div>
                </div>
              </div>
            </article>

            {/* Sector Leaders Card */}
            <article className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-[0_10px_40px_rgba(20,30,50,0.02)] flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="crown" size={20} className="text-pink" />
                <h3 className="m-0 text-[18px] font-black text-gray-900 tracking-tight">Sector Leaders</h3>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 min-h-[160px] bg-gray-50 rounded-[16px] border border-dashed border-gray-200">
                <Icon name="pin" size={32} className="mb-3 opacity-40 text-pink" />
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">Map Data Empty</span>
              </div>
            </article>
          </section>
        </>
      )}

    </div>
  )
}
