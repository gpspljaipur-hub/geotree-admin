import { useState, useEffect } from 'react'
import Icon from '../components/Icon'
import { CertificatePreview, generateCertificateHTML } from './CertificatesPage'
import { Field, PageHeader } from '../components/ui'
import { apiService } from '../config/apiService'
import { API_CONFIG } from '../config/endpoints'

const filters = ['All', 'Occasion', 'Carbon Offset', 'IPL Dot Ball', 'Support Team']

export default function CertificateTemplatesPage() {
  const [designerOpen, setDesignerOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  
  const [editingId, setEditingId] = useState(null)
  const [formValues, setFormValues] = useState({})

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

  const openCreate = () => {
    setEditingId(null)
    setFormValues({
      name: '',
      category: 'Occasion',
      title: 'Certificate of Appreciation',
      subTitle: 'Special Recognition',
      description: 'Marking this special occasion...',
      tagline: 'Nurturing a greener and more sustainable future',
      primaryColor: 'Forest Green (Eco)',
      template_file: ''
    })
    setDesignerOpen(true)
  }

  const openEdit = (t) => {
    setEditingId(t._id || t.id)
    setFormValues({
      name: t.name || '',
      category: t.category || t.type || 'Occasion',
      title: t.title || '',
      subTitle: t.subTitle || '',
      description: t.description || '',
      tagline: t.tagline || '',
      primaryColor: t.primaryColor || 'Forest Green (Eco)',
      template_file: t.template_file || t.background_image || ''
    })
    setDesignerOpen(true)
  }

  const handleDelete = async (t) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await apiService.deleteCertificateTemplate({ id: t._id || t.id })
        fetchTemplates()
      } catch (err) {
        console.error("Error deleting template:", err)
        alert("Failed to delete template")
      }
    }
  }

  const saveTemplate = async () => {
    try {
      const formData = new FormData()
      if (editingId) formData.append('id', editingId)
      
      formData.append('name', formValues.name || 'Unnamed Template')
      formData.append('category', formValues.category)
      formData.append('type', formValues.category) // Backend maps category to type
      formData.append('title', formValues.title || 'Certificate Title')
      formData.append('subTitle', formValues.subTitle || 'Sub Heading')
      formData.append('description', formValues.description || 'Description')
      formData.append('tagline', formValues.tagline || 'Tagline')
      formData.append('primaryColor', formValues.primaryColor || '#000000')
      
      if (formValues.template_file && typeof formValues.template_file === 'object') {
        formData.append('template_file', formValues.template_file)
      }
      
      // Generate HTML from form values and send it to the backend as the actual template layout
      const generatedHtml = generateCertificateHTML({
        title: formValues.title || 'Certificate Title',
        subTitle: formValues.subTitle || 'Sub Heading',
        description: formValues.description || 'Description',
        tagline: formValues.tagline || 'Tagline',
        primaryColor: formValues.primaryColor || '#d97706',
        recipient: '{{recipient}}',
        issueDate: '{{issue_date}}',
        certId: '{{certificate_id}}'
      });
      
      formData.append('html_template', generatedHtml);

      if (editingId) {
        await apiService.updateCertificateTemplate(formData)
      } else {
        await apiService.addCertificateTemplate(formData)
      }
      
      setDesignerOpen(false)
      fetchTemplates()
    } catch (err) {
      console.error("Error saving template:", err)
      alert("Failed to save template. Make sure all fields and image are provided.")
    }
  }

  const filteredTemplates = templates.filter(t => activeFilter === 'All' || t.category === activeFilter)

  if (designerOpen) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-white">
        <div className="flex items-center justify-between px-8 min-h-[70px] border-b border-gray-100 bg-white shadow-sm relative z-10">
          <h2 className="m-0 text-[20px] font-bold text-gray-800 tracking-tight">{editingId ? 'Edit Template' : 'Create New Template'}</h2>
          <button className="p-2 border-0 bg-transparent text-gray-400 hover:text-gray-900 cursor-pointer transition-colors" onClick={() => setDesignerOpen(false)} type="button"><Icon name="x" size={24} /></button>
        </div>
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Column - Form */}
          <section className="w-full lg:w-[600px] xl:w-[700px] p-8 lg:p-10 border-r border-gray-100 overflow-y-auto bg-white flex flex-col gap-10 pb-24">
            
            {/* Section 1 */}
            <div>
              <h3 className="text-[12px] font-black tracking-widest text-gray-400 uppercase mb-6 m-0 border-b border-gray-50 pb-2">TEMPLATE CONFIGURATION</h3>
              <div className="flex flex-col gap-6">
                <Field label="TEMPLATE NAME *" placeholder="e.g. Summer Campaign 2024" value={formValues.name} onChange={(v) => setFormValues(f => ({...f, name: v}))} full />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="ISSUE CATEGORY *" type="select" options={['Occasion', 'Carbon Offset', 'IPL Dot Ball', 'Support Team', 'Plantation']} value={formValues.category} onChange={(v) => setFormValues(f => ({...f, category: v}))} />
                  <Field label="PRIMARY DESIGN COLOR *" type="select" options={['Forest Green (Eco)', 'Ocean Blue', 'Sunset Orange', 'Royal Purple', 'Slate Grey']} value={formValues.primaryColor} onChange={(v) => setFormValues(f => ({...f, primaryColor: v}))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="WATERMARK PATTERN" type="select" options={['Minimal White', 'Logo Fade', 'Geometric', 'None']} value={'Minimal White'} onChange={() => {}} />
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="text-[12px] font-black tracking-widest text-gray-400 uppercase mb-6 m-0 border-b border-gray-50 pb-2">CERTIFICATE CONTENT (SUPPORTS VARIABLES)</h3>
              <div className="flex flex-col gap-6">
                <Field label="CERTIFICATE TITLE" value={formValues.title} onChange={(v) => setFormValues(f => ({...f, title: v}))} full />
                <Field label="SUB-HEADING" value={formValues.subTitle} onChange={(v) => setFormValues(f => ({...f, subTitle: v}))} full />
                <Field label="MAIN DESCRIPTION" type="textarea" value={formValues.description} onChange={(v) => setFormValues(f => ({...f, description: v}))} full />
                <Field label="TAGLINE (FOOTER)" value={formValues.tagline} onChange={(v) => setFormValues(f => ({...f, tagline: v}))} full />
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="text-[12px] font-black tracking-widest text-gray-400 uppercase mb-2 m-0">PREVIEW TOOLS (NOT SAVED)</h3>
              <p className="text-[12px] italic text-gray-400 mb-6 m-0 border-b border-gray-50 pb-3">Change these values only to test how your template looks with real data.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="TEST METRIC (QTY)" value="50" onChange={() => {}} />
                <Field label="TEST SITE (SITE)" value="Amazon Restoration Site" onChange={() => {}} />
                <Field label="TEST IMPACT (IMPACT)" value="0.5 Tons" onChange={() => {}} />
              </div>
            </div>

            {/* Action Buttons fixed to bottom in mobile, inline in desktop */}
            <div className="flex items-center gap-4 mt-4">
              <button className="h-[46px] px-8 text-[12px] font-bold tracking-widest uppercase text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDesignerOpen(false)} type="button">CANCEL</button>
              <button className="h-[46px] px-8 text-[12px] font-bold tracking-widest uppercase text-white bg-pink-500 rounded-full hover:bg-pink-600 transition-colors cursor-pointer border-0 shadow-lg shadow-pink-500/20" onClick={saveTemplate} type="button" style={{backgroundColor: '#e83e8c'}}>SAVE TEMPLATE</button>
            </div>
            
          </section>

          {/* Right Column - Preview & Info */}
          <aside className="flex-1 bg-white p-8 lg:p-10 flex flex-col gap-6 overflow-y-auto">
            <div>
              <h3 className="text-[12px] font-black tracking-widest text-gray-400 uppercase mb-4 m-0">DESIGNER INSIGHT PREVIEW</h3>
              <div className="w-full bg-white border border-gray-100 rounded-[20px] shadow-sm p-4 lg:p-8 flex items-center justify-center">
                <div className="w-full max-w-[800px] aspect-[1.414/1] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden" style={{ minHeight: '400px' }}>
                  <CertificatePreview values={{
                    ...formValues,
                    primaryColor: formValues.primaryColor?.includes('Green') ? '#2E8B57' : 
                                  formValues.primaryColor?.includes('Blue') ? '#0284c7' : 
                                  formValues.primaryColor?.includes('Orange') ? '#ea580c' : 
                                  formValues.primaryColor?.includes('Purple') ? '#7c3aed' : '#475569',
                    description: formValues.description || "Marking the occasion of [Occasion Name], this certificate acknowledges your thoughtful contribution of planting {{qty}} trees under the {{site}} initiative.\n\nYour gesture celebrates the moment while nurturing a greener and more sustainable future."
                  }} />
                </div>
              </div>
            </div>

            <div className="border border-gray-100 rounded-[20px] bg-slate-50/50 p-6">
              <h3 className="text-[13px] font-bold text-gray-500 uppercase flex items-center gap-2 mb-6 m-0">
                <Icon name="star" size={16} /> AVAILABLE VARIABLES
              </h3>
              
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                {[
                  { tag: '{{recipient}}', desc: 'Full Name' },
                  { tag: '{{qty}}', desc: 'Metric Value' },
                  { tag: '{{site}}', desc: 'Site Name' },
                  { tag: '{{occasion}}', desc: 'Occasion Name' },
                  { tag: '{{tournament}}', desc: 'Tournament' },
                  { tag: '{{match}}', desc: 'Match Name' },
                  { tag: '{{issue_date}}', desc: 'Today (Issue Day)' },
                  { tag: '{{event_date}}', desc: 'Plantation Day' },
                  { tag: '{{match_date}}', desc: 'Match Day' },
                  { tag: '{{date}}', desc: 'Same as Issue Date' },
                  { tag: '{{dot_balls}}', desc: 'Dot Balls' },
                ].map((variable) => (
                  <div className="flex flex-col" key={variable.tag}>
                    <b className="text-[14px] font-bold text-blue-600 mb-1">{variable.tag}</b>
                    <span className="text-[12px] text-gray-400 font-medium">{variable.desc}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-[11px] italic text-gray-400 mt-6 pt-4 border-t border-gray-200">
                * Use these tags in your description. The system will replace them with real user data automatically.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-[16px] p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm border border-slate-200">
                <Icon name="monitor" size={18} />
              </div>
              <p className="text-[13px] font-semibold text-gray-600 m-0 leading-tight">
                Design once, issue millions. This template will automatically adapt to every user's details.
              </p>
            </div>
            
          </aside>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader title="Certificate Formats" description="Manage and customize the visual appearance of issued certificates." actionLabel="New Template" onAction={openCreate} />
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
          onClick={openCreate} 
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
          filteredTemplates.map(template => {
            const templateImage = template.template_file || template.background_image || template.image;
            return (
              <div key={template._id || template.id} className="relative w-full min-h-[220px] bg-white border border-gray-200 rounded-[20px] shadow-sm flex flex-col overflow-hidden">
                {templateImage && (
                  <div className="absolute inset-0 z-0 opacity-15 mix-blend-multiply pointer-events-none">
                    <img src={`${API_CONFIG.IMAGE_URL}${templateImage}`} alt="bg" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 p-6 flex flex-col justify-between relative z-10 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm">
                  <div>
                    <span className="inline-block px-3 py-1 mb-4 bg-gray-100 text-gray-600 text-[10px] font-bold tracking-widest uppercase rounded-lg shadow-sm border border-gray-200/50">{template.category || 'General'}</span>
                    <h3 className="text-[18px] font-black text-gray-900 m-0 mb-2 leading-tight">{template.name || 'Unnamed Template'}</h3>
                    <p className="text-[12px] font-semibold text-gray-600 m-0 line-clamp-2">{template.title || 'No title set'}</p>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <small className="text-[11px] font-bold text-gray-400">Created: {new Date(template.createdAt || Date.now()).toLocaleDateString()}</small>
                    <div className="flex items-center gap-3">
                      <button className="text-[13px] font-bold text-gray-400 hover:text-blue bg-transparent border-0 cursor-pointer transition-colors" onClick={() => openEdit(template)} title="Edit Template" type="button"><Icon name="edit" size={16} /></button>
                      <button className="text-[13px] font-bold text-gray-400 hover:text-red-500 bg-transparent border-0 cursor-pointer transition-colors" onClick={() => handleDelete(template)} title="Delete Template" type="button"><Icon name="trash" size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
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
