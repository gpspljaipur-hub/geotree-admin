import { useState, useEffect } from 'react'
import Icon from '../components/Icon'
import { CertificatePreview } from './CertificatesPage'
import { Field, PageHeader } from '../components/ui'
import { apiService } from '../config/apiService'

const filters = ['All', 'Occasion', 'Carbon Offset', 'IPL Dot Ball', 'Support Team']

export default function CertificateTemplatesPage() {
  const [designerOpen, setDesignerOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const res = await apiService.getCertificateTemplates({ page: 1, limit: 100 })
      setTemplates(res?.data?.data || res?.data || [])
    } catch (err) {
      console.error("Error fetching templates:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter(t => activeFilter === 'All' || t.category === activeFilter)

  if (designerOpen) {
    return (
      <div className="flex flex-col bg-white min-h-[calc(100vh-140px)] rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-8 min-h-[70px] border-b border-gray-100 bg-gray-50/50">
          <h2 className="m-0 text-[18px] font-black text-gray-900 tracking-tight">Create New Template</h2>
          <button className="p-2 border-0 bg-transparent text-gray-400 hover:text-gray-900 cursor-pointer transition-colors" onClick={() => setDesignerOpen(false)} type="button"><Icon name="x" size={20} /></button>
        </div>
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          <section className="flex-1 p-8 lg:border-r border-gray-100 overflow-y-auto">
            <h3 className="text-[11px] font-black tracking-widest text-pink uppercase mb-6 pb-3 border-b border-gray-100 m-0">TEMPLATE CONFIGURATION</h3>
            <div className="flex flex-col gap-6 mb-10">
              <Field label="Template Name" required placeholder="e.g. Summer Campaign 2024" full />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Issue Category" required type="select" options={['Occasion', 'Carbon Offset', 'IPL Dot Ball']} />
                <Field label="Primary Design Color" required type="select" options={['Forest Green (Eco)', 'Royal Purple', 'Ocean Blue']} />
              </div>
              <Field label="Watermark Pattern" type="select" options={['Minimal White', 'Leaf Pattern', 'Geometric']} />
            </div>
            
            <h3 className="text-[11px] font-black tracking-widest text-blue-600 uppercase mb-6 pb-3 border-b border-gray-100 m-0">CERTIFICATE CONTENT (SUPPORTS VARIABLES)</h3>
            <div className="flex flex-col gap-6 mb-10">
              <Field label="Certificate Title" value="Certificate of Appreciation" full />
              <Field label="Sub-heading" value="Special Recognition" full />
              <Field label="Main Description" type="textarea" value="Marking the occasion of [Occasion Name], this certificate acknowledges your thoughtful contribution of planting {{qty}} trees under the {{site}} initiative." full />
              <Field label="Tagline (Footer)" value="Nurturing a greener and more sustainable future" full />
            </div>

            <div className="mb-10">
              <h3 className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-2 m-0">PREVIEW TOOLS (NOT SAVED)</h3>
              <p className="text-[11px] italic font-medium text-gray-400 mb-6 pb-3 border-b border-gray-100 m-0">Change these values only to test how your template looks with real data.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="TEST METRIC (QTY)" value="50" />
                <Field label="TEST SITE (SITE)" value="Amazon Restoration Site" />
                <Field label="TEST IMPACT (IMPACT)" value="0.5 Tons" />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <button className="min-h-[46px] px-6 text-[11px] font-bold tracking-widest uppercase text-gray-600 bg-white border border-gray-200 rounded-[13px] hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDesignerOpen(false)} type="button">CANCEL</button>
              <button className="min-h-[46px] px-8 text-[11px] font-bold tracking-widest uppercase text-white bg-blue rounded-[13px] hover:bg-indigo transition-colors cursor-pointer border-0 shadow-lg shadow-blue/20" onClick={() => setDesignerOpen(false)} type="button">SAVE TEMPLATE</button>
            </div>
          </section>
          <aside className="w-full lg:w-[480px] xl:w-[540px] p-8 bg-slate-50 flex flex-col overflow-y-auto">
            <h3 className="text-[11px] font-black tracking-widest text-gray-500 uppercase mb-6 m-0">DESIGNER INSIGHT PREVIEW</h3>
            <div className="mb-8">
              <CertificatePreview />
            </div>
            <section className="p-6 bg-white border border-indigo-100 rounded-[16px] shadow-sm">
              <h4 className="flex items-center gap-2 text-[10px] font-[850] tracking-widest uppercase text-indigo-800 m-0 mb-4 pb-3 border-b border-indigo-50">
                <span className="text-indigo-400">☆</span> AVAILABLE VARIABLES
              </h4>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                {['{{recipient}}', '{{qty}}', '{{site}}', '{{occasion}}', '{{tournament}}', '{{match}}', '{{issue_date}}', '{{event_date}}', '{{match_date}}', '{{date}}', '{{dot_balls}}'].map((variable) => (
                  <span className="flex flex-col" key={variable}>
                    <b className="text-[12px] font-bold text-gray-900">{variable}</b>
                    <small className="text-[10px] font-semibold text-gray-400 mt-0.5">Dynamic value</small>
                  </span>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader title="Certificate Formats" description="Manage and customize the visual appearance of issued certificates." actionLabel="New Template" onAction={() => setDesignerOpen(true)} />
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((filter) => (
          <button 
            className={`min-h-[38px] px-5 rounded-[10px] text-[11px] font-bold tracking-wider uppercase transition-colors cursor-pointer border ${filter === activeFilter ? 'bg-gray-800 text-white border-gray-800 shadow-md shadow-gray-900/10' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`} 
            onClick={() => setActiveFilter(filter)} 
            key={filter} 
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <button 
          className="w-full min-h-[220px] flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed border-gray-200 rounded-[20px] bg-gray-50/50 hover:bg-pink/5 hover:border-pink/30 hover:shadow-[0_10px_30px_rgba(223,59,145,0.1)] transition-all cursor-pointer text-center" 
          onClick={() => setDesignerOpen(true)} 
          type="button"
        >
          <i className="w-[60px] h-[60px] grid place-items-center bg-white rounded-full text-pink shadow-md"><Icon name="plus" size={30} /></i>
          <span className="flex flex-col">
            <strong className="text-[18px] font-black text-gray-900">Create New Template</strong>
            <span className="text-[13px] font-bold text-gray-500 mt-1">Start from scratch</span>
          </span>
        </button>
        
        {loading ? (
          <div className="col-span-full py-12 text-center text-[14px] font-bold text-gray-500">Loading templates...</div>
        ) : filteredTemplates.length > 0 ? (
          filteredTemplates.map(template => (
            <div key={template._id || template.id} className="relative w-full min-h-[220px] bg-white border border-gray-200 rounded-[20px] shadow-sm flex flex-col overflow-hidden">
              <div className="flex-1 p-6 flex flex-col justify-between relative z-10 bg-gradient-to-br from-white to-gray-50">
                <div>
                  <span className="inline-block px-3 py-1 mb-4 bg-gray-100 text-gray-600 text-[10px] font-bold tracking-widest uppercase rounded-lg">{template.category || 'General'}</span>
                  <h3 className="text-[18px] font-black text-gray-900 m-0 mb-2 leading-tight">{template.name || 'Unnamed Template'}</h3>
                  <p className="text-[12px] font-semibold text-gray-500 m-0 line-clamp-2">{template.title || 'No title set'}</p>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <small className="text-[11px] font-bold text-gray-400">Created: {new Date(template.createdAt || Date.now()).toLocaleDateString()}</small>
                  <button className="text-[12px] font-bold text-blue hover:text-indigo bg-transparent border-0 cursor-pointer underline underline-offset-4 decoration-blue/30 transition-colors" onClick={() => setPreviewOpen(true)} type="button">Preview</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center flex flex-col items-center">
            <Icon name="file" size={32} className="text-gray-300 mb-4" />
            <span className="text-[14px] font-bold text-gray-500">No templates found for {activeFilter}.</span>
          </div>
        )}
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-[60] p-4 md:p-8 grid place-items-center bg-slate-900/60 backdrop-blur-md overflow-y-auto" role="presentation" onMouseDown={() => setPreviewOpen(false)}>
          <section className="relative w-full max-w-[900px] bg-white rounded-[24px] shadow-2xl overflow-hidden" onMouseDown={(event) => event.stopPropagation()}>
            <header className="flex items-center justify-between px-8 min-h-[70px] border-b border-gray-100 bg-gray-50/50">
              <h3 className="m-0 text-[18px] font-black text-gray-900 tracking-tight">Preview: Template</h3>
              <button className="p-2 border-0 bg-transparent text-gray-400 hover:text-gray-900 cursor-pointer" onClick={() => setPreviewOpen(false)} type="button"><Icon name="x" size={20} /></button>
            </header>
            <div className="p-8 bg-slate-50">
              <CertificatePreview purple />
            </div>
            <footer className="flex justify-end gap-3 px-8 py-5 border-t border-gray-100 bg-white">
              <button className="min-h-[46px] px-6 text-[11px] font-bold tracking-widest uppercase text-gray-600 bg-white border border-gray-200 rounded-[13px] hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setPreviewOpen(false)} type="button">Close</button>
              <button className="min-h-[46px] px-8 text-[11px] font-bold tracking-widest uppercase text-white bg-blue rounded-[13px] hover:bg-indigo transition-colors cursor-pointer border-0 shadow-lg shadow-blue/20" type="button">Use This Template</button>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}
