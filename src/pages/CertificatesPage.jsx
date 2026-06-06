import { useState, useEffect, useMemo } from 'react'
import Icon from '../components/Icon'
import { Badge, DataTable, Field, Modal, PageHeader, SearchBar, TableCard, Pagination } from '../components/ui'
import { apiService } from '../config/apiService'

export default function CertificatesPage() {
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedCert, setSelectedCert] = useState(null)
  
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  
  const [plantations, setPlantations] = useState([])
  const [plantationsLoading, setPlantationsLoading] = useState(false)
  
  const [formValues, setFormValues] = useState({
    user_id: '',
    plantation_id: '',
    category: 'Plantation (Standard)'
  })

  useEffect(() => {
    fetchData()
  }, [page])

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (formValues.user_id) {
      fetchUserPlantations(formValues.user_id)
    } else {
      setPlantations([])
    }
  }, [formValues.user_id])

  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      const res = await apiService.getAdmins({ page: 1, limit: 100 })
      setUsers(res?.data?.data || res?.data || [])
    } catch (err) {
      console.error("Error fetching users:", err)
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchUserPlantations = async (userId) => {
    try {
      setPlantationsLoading(true)
      const res = await apiService.getAllPlantations({ page: 1, limit: 100, user_id: userId })
      setPlantations(res?.data?.data || res?.data || [])
    } catch (err) {
      console.error("Error fetching user plantations:", err)
    } finally {
      setPlantationsLoading(false)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await apiService.getCertificates({ page, limit: 10 })
      const dataList = res?.data?.data || res?.data || []
      
      if (res?.data?.pagination) {
        setTotalPages(res.data.pagination.pages || 1)
      } else if (res?.pagination) {
        setTotalPages(res.pagination.pages || 1)
      }

      const mappedRows = dataList.map(item => ({
        id: item._id || item.id,
        display_id: item.certificate_id || item._id,
        user: item.user_id?.name || item.user_name || "Unknown User",
        phone: item.user_id?.mobile || item.user_id?.email || item.user_mobile || "N/A",
        trees: `${item.trees_count || 1} Trees`,
        site: item.site_name || "Unknown Site",
        category: item.category || item.plantation_source || "PLANTATION",
        date: new Date(item.created_at || item.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        original: item
      }))
      setRows(mappedRows)
    } catch (err) {
      console.error("Error fetching certificates:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRows = useMemo(
    () => rows.filter((row) => `${row.display_id} ${row.user} ${row.phone} ${row.site}`.toLowerCase().includes(query.toLowerCase())),
    [query, rows]
  )

  const handlePreview = (row) => {
    setSelectedCert(row)
    setPreviewOpen(true)
  }

  const handleEdit = (row) => {
    setEditingId(row.id)
    const item = row.original
    setFormValues({
      user_id: item.user_id?._id || item.user_id || item.user || '',
      plantation_id: item.plantation_id?._id || item.plantation_id || '',
      category: item.category || item.plantation_source || 'Plantation (Standard)'
    })
    setModalOpen(true)
  }

  const handleCreate = () => {
    setEditingId(null)
    setFormValues({
      user_id: '',
      plantation_id: '',
      category: 'Plantation (Standard)'
    })
    setModalOpen(true)
  }

  const handleDelete = async (row) => {
    if (window.confirm("Are you sure you want to delete this certificate?")) {
      try {
        await apiService.deleteCertificate({ id: row.id })
        fetchData()
      } catch (err) {
        console.error("Error deleting certificate:", err)
        alert("Failed to delete certificate")
      }
    }
  }

  const saveRecord = async () => {
    try {
      const payload = {
        user_id: formValues.user_id,
        plantation_id: formValues.plantation_id,
        category: formValues.category
      }

      if (editingId) {
        payload.id = editingId
        await apiService.updateCertificate(payload)
      } else {
        await apiService.addCertificate(payload)
      }
      
      setModalOpen(false)
      fetchData()
    } catch (err) {
      console.error("Error saving certificate:", err)
      alert("Failed to save certificate. Please ensure all fields are correctly selected.")
    }
  }

  const userOptions = useMemo(() => users.map(u => ({ label: `${u.name || 'Unknown User'} - ${u.mobile || u.email || 'N/A'}`, value: u._id || u.id })), [users])
  const plantationOptions = useMemo(() => plantations.map(p => ({ label: `${p.trees_count || p.plants?.[0]?.quantity || 1} Trees at ${p.site_name || 'Unknown Site'} (${new Date(p.date || p.createdAt).toLocaleDateString()})`, value: p._id || p.id })), [plantations])

  const columns = [
    { key: 'id', label: 'CERTIFICATE ID', render: (row) => <strong className="text-[13px] font-bold text-gray-800">{row.display_id}</strong> },
    { key: 'user', label: 'USER IDENTITY', render: (row) => <div className="flex flex-col"><strong className="text-[14px] font-bold text-gray-800">{row.user}</strong><small className="text-[12px] font-semibold text-gray-400 mt-0.5">{row.phone}</small></div> },
    { key: 'trees', label: 'TREES & SITE', render: (row) => <div className="flex flex-col"><strong className="text-[14px] font-bold text-gray-800">{row.trees}</strong><small className="text-[12px] font-semibold text-gray-400 mt-0.5">{row.site}</small></div> },
    { key: 'category', label: 'CATEGORY', render: (row) => <Badge>{row.category}</Badge> },
    { key: 'date', label: 'ISSUE DATE' },
    { key: 'view', label: 'PREVIEW', render: (row) => <div className="flex items-center gap-2"><button className="inline-flex items-center gap-1.5 h-8 px-3 bg-white border border-gray-200 rounded-[8px] text-[10px] font-bold tracking-widest text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handlePreview(row)} type="button"><Icon name="eye" size={16} /> VIEW</button></div> },
    { key: 'actions', label: 'ACTIONS', render: (row) => <div className="flex items-center justify-end gap-1"><button className="w-8 h-8 grid place-items-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border-0 bg-transparent" onClick={() => handleEdit(row)} type="button"><Icon name="edit" size={18} /></button><button className="w-8 h-8 grid place-items-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent" onClick={() => handleDelete(row)} type="button"><Icon name="trash" size={18} /></button></div> },
  ]
  return (
    <>
      <PageHeader title="Certificates" description="Manage and issue digital certificates for plantations and carbon credits." actionLabel="ADD CERTIFICATE" onAction={handleCreate} />
      <TableCard>
        <SearchBar placeholder="Search by ID, User, or Site..." value={query} onChange={setQuery} showButton={true} />
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-semibold">Loading...</div>
        ) : (
          <>
            <DataTable columns={columns} rows={filteredRows} emptyText="No certificates found" />
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </>
        )}
      </TableCard>

      {modalOpen && (
        <Modal title={editingId ? "Update Certificate" : "Register New Certificate"} submitLabel={editingId ? "SAVE CHANGES" : "GENERATE CERTIFICATE"} onClose={() => setModalOpen(false)} onSubmit={saveRecord}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Select User" required type="select" options={userOptions} placeholder={usersLoading ? "Loading users..." : "Select User"} value={formValues.user_id} onChange={(val) => setFormValues(prev => ({...prev, user_id: val}))} full />
            <Field label="Select Plantation Order" required type="select" options={plantationOptions} placeholder={plantationsLoading ? "Loading plantations..." : (formValues.user_id ? "Select Plantation" : "Select User First")} value={formValues.plantation_id} onChange={(val) => setFormValues(prev => ({...prev, plantation_id: val}))} full />
            <Field label="Certificate Category" type="select" options={['Plantation (Standard)', 'Occasion / Event', 'Carbon Offset', 'IPL Dot Ball', 'Support Team']} value={formValues.category} onChange={(val) => setFormValues(prev => ({...prev, category: val}))} full />
          </div>
        </Modal>
      )}

      {previewOpen && selectedCert && (
        <div className="fixed inset-0 z-[60] p-4 md:p-8 grid place-items-center bg-slate-900/60 backdrop-blur-md overflow-y-auto" role="presentation" onMouseDown={() => setPreviewOpen(false)}>
          <section className="relative w-full max-w-[840px] bg-white rounded-[24px] shadow-2xl p-6 md:p-8" onMouseDown={(event) => event.stopPropagation()}>
            <header className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
              <h3 className="m-0 text-[21px] font-black tracking-tight text-gray-900">Certificate Preview</h3>
              <button className="p-2 border-0 bg-transparent text-gray-400 hover:text-gray-900 cursor-pointer" onClick={() => setPreviewOpen(false)} type="button"><Icon name="x" size={24} /></button>
            </header>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <Badge tone="pink">{selectedCert.display_id}</Badge>
              <div className="flex items-center gap-3">
                <button className="min-h-[40px] px-5 text-[10px] font-bold tracking-widest text-gray-600 bg-white border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors cursor-pointer uppercase" type="button">NEW TAB</button>
                <button className="min-h-[40px] px-5 text-[10px] font-bold tracking-widest text-gray-600 bg-white border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors cursor-pointer uppercase" type="button">PRINT</button>
                <button className="inline-flex items-center justify-center gap-2 min-h-[40px] px-5 bg-blue text-white text-[10px] font-bold tracking-widest rounded-[10px] border-0 cursor-pointer hover:bg-indigo transition-colors uppercase" type="button"><Icon name="download" size={16} />DOWNLOAD PDF</button>
              </div>
            </div>
            <CertificatePreview />
          </section>
        </div>
      )}
    </>
  )
}

export const generateCertificateHTML = (values = {}) => {
  const color = values.primaryColor || '#d97706';
  const title = values.title || 'ENVIRONMENTAL IMPACT AWARD';
  const subTitle = values.subTitle || 'TEAM CONTRIBUTION RECOGNITION';
  const recipient = values.recipient || 'John Doe';
  const description = values.description || 'Thank you John Doe for your incredible support. By helping us manage the plantation of 50 trees at Thar Desert Restoration, you are a vital part of our mission.';
  const tagline = values.tagline || 'Nurturing a greener and more sustainable future';
  const issueDate = values.issueDate || '6/6/2026';
  const certId = values.certId || '6a1ea5388ce00f39550881c8';

  return `
    <div style="width: 100%; height: 100%; min-height: 480px; padding: 10px; background: #fdfdfd; box-sizing: border-box; font-family: sans-serif;">
      <div style="border: 3px solid ${color}; height: 100%; width: 100%; box-sizing: border-box; padding: 5px;">
        <div style="position: relative; border: 1px solid ${color}; height: 100%; box-sizing: border-box; padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: #fff;">
          
          <!-- corners -->
          <div style="position: absolute; top: 15px; left: 15px; width: 40px; height: 40px; border-top: 1px solid ${color}; border-left: 1px solid ${color};"></div>
          <div style="position: absolute; top: 15px; right: 15px; width: 40px; height: 40px; border-top: 1px solid ${color}; border-right: 1px solid ${color};"></div>
          <div style="position: absolute; bottom: 15px; left: 15px; width: 40px; height: 40px; border-bottom: 1px solid ${color}; border-left: 1px solid ${color};"></div>
          <div style="position: absolute; bottom: 15px; right: 15px; width: 40px; height: 40px; border-bottom: 1px solid ${color}; border-right: 1px solid ${color};"></div>

          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; margin-bottom: 30px;">
             <div style="font-size:20px; font-weight:900; color:#2c3e50; letter-spacing:-1px;">
               <span style="color:#27ae60;">Geo</span><span style="color:#2c3e50;">Tree</span>
             </div>
             <div style="width: 34px; height: 34px; border-radius: 50%; border: 3px solid #8cc63f; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; transform: rotate(-15deg);">
                <div style="width: 2px; height: 100%; background: #3498db; position: absolute; transform: rotate(45deg);"></div>
                <div style="width: 100%; height: 2px; background: #3498db; position: absolute; transform: rotate(45deg);"></div>
                <div style="color: #8cc63f; font-weight: 900; font-size: 22px; position: relative; z-index: 10;">G</div>
             </div>
             <div style="text-align: right; font-family: sans-serif; font-size: 9px; color: #95a5a6; font-weight: bold; line-height: 1.6; letter-spacing: 1px;">
               ISSUED DATE: <span style="color: #2c3e50;">${issueDate}</span><br/>
               CERTIFICATE ID: <span style="color: #2c3e50;">${certId}</span>
             </div>
          </div>

          <!-- Content -->
          <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a252f; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px 0; max-width: 90%; line-height: 1.2;">${title}</h1>
          <h2 style="font-family: sans-serif; font-size: 11px; color: #7f8c8d; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 25px 0;">${subTitle}</h2>

          <p style="font-family: Georgia, serif; font-size: 15px; font-style: italic; color: #5a6672; margin: 0 0 8px 0;">This is proudly presented to</p>
          <div style="display: inline-block; border-bottom: 2px solid ${color}; padding-bottom: 2px; margin-bottom: 20px;">
            <h3 style="font-family: Georgia, serif; font-size: 34px; color: #0f172a; margin: 0; font-weight: bold;">${recipient}</h3>
          </div>

          <p style="font-family: sans-serif; font-size: 13px; color: #475569; line-height: 1.6; max-width: 85%; margin: 0 auto 25px auto;">${description}</p>

          <p style="font-family: sans-serif; font-size: 13px; font-weight: bold; font-style: italic; color: #4c82b4; margin: 0;">${tagline}</p>
          <div style="width: 120px; height: 1px; background: #cbd5e1; margin-top: 15px;"></div>
        </div>
      </div>
    </div>
  `;
}

export function CertificatePreview({ values = {} }) {
  return (
    <div 
      className="w-full flex-1 min-h-[400px] flex items-center justify-center rounded-[12px] overflow-hidden shadow-sm border border-gray-100 bg-white"
      dangerouslySetInnerHTML={{ __html: generateCertificateHTML(values) }}
    />
  )
}
