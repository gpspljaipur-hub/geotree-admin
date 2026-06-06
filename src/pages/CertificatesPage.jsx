import { useState, useEffect, useMemo } from 'react'
import Icon from '../components/Icon'
import { Badge, DataTable, Field, Modal, PageHeader, SearchBar, TableCard, Pagination } from '../components/ui'
import { apiService } from '../config/apiService'

export default function CertificatesPage() {
  const [query, setQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedCert, setSelectedCert] = useState(null)
  
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  
  const [selectedUserStr, setSelectedUserStr] = useState('')
  const [plantations, setPlantations] = useState([])
  const [plantationsLoading, setPlantationsLoading] = useState(false)
  const [selectedPlantationStr, setSelectedPlantationStr] = useState('')
  const [categoryStr, setCategoryStr] = useState('Plantation (Standard)')

  // For Edit Modal
  const [editId, setEditId] = useState(null)
  const [editCategoryStr, setEditCategoryStr] = useState('')

  useEffect(() => {
    fetchData()
  }, [page])

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedUserStr) {
      const selectedUser = users.find(u => `${u.name || 'Unknown User'} - ${u.mobile || u.email || 'N/A'}` === selectedUserStr)
      if (selectedUser && (selectedUser._id || selectedUser.id)) {
        fetchUserPlantations(selectedUser._id || selectedUser.id)
      } else {
        setPlantations([])
      }
    } else {
      setPlantations([])
    }
  }, [selectedUserStr])

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
        id: item.certificate_id || item._id,
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
    () => rows.filter((row) => `${row.id} ${row.user} ${row.phone} ${row.site}`.toLowerCase().includes(query.toLowerCase())),
    [query, rows]
  )

  const handlePreview = (row) => {
    setSelectedCert(row)
    setPreviewOpen(true)
  }

  const handleEdit = (row) => {
    setEditId(row.id)
    setEditCategoryStr(row.category)
    setEditOpen(true)
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

  const saveCreate = async () => {
    try {
      const selectedUser = users.find(u => `${u.name || 'Unknown User'} - ${u.mobile || u.email || 'N/A'}` === selectedUserStr)
      const selectedPlantation = plantations.find(p => `${p.trees_count || p.plants?.[0]?.quantity || 1} Trees at ${p.site_name || 'Unknown Site'} (${new Date(p.date || p.createdAt).toLocaleDateString()})` === selectedPlantationStr)
      
      const payload = {
        user_id: selectedUser?._id || selectedUser?.id,
        plantation_id: selectedPlantation?._id || selectedPlantation?.id,
        category: categoryStr
      }

      await apiService.addCertificate(payload)
      setCreateOpen(false)
      fetchData()
    } catch (err) {
      console.error("Error generating certificate:", err)
      alert("Failed to generate certificate. Please ensure all fields are correctly selected.")
    }
  }

  const saveEdit = async () => {
    try {
      await apiService.updateCertificate({
        id: editId,
        category: editCategoryStr
      })
      setEditOpen(false)
      fetchData()
    } catch (err) {
      console.error("Error updating certificate:", err)
      alert("Failed to update certificate")
    }
  }

  const userOptions = useMemo(() => users.map(u => `${u.name || 'Unknown User'} - ${u.mobile || u.email || 'N/A'}`), [users])
  const plantationOptions = useMemo(() => plantations.map(p => `${p.trees_count || p.plants?.[0]?.quantity || 1} Trees at ${p.site_name || 'Unknown Site'} (${new Date(p.date || p.createdAt).toLocaleDateString()})`), [plantations])

  const columns = [
    { key: 'id', label: 'CERTIFICATE ID', render: (row) => <strong className="text-[13px] font-bold text-gray-800">{row.id}</strong> },
    { key: 'user', label: 'USER IDENTITY', render: (row) => <div className="flex flex-col"><strong className="text-[14px] font-bold text-gray-800">{row.user}</strong><small className="text-[12px] font-semibold text-gray-400 mt-0.5">{row.phone}</small></div> },
    { key: 'trees', label: 'TREES & SITE', render: (row) => <div className="flex flex-col"><strong className="text-[14px] font-bold text-gray-800">{row.trees}</strong><small className="text-[12px] font-semibold text-gray-400 mt-0.5">{row.site}</small></div> },
    { key: 'category', label: 'CATEGORY', render: (row) => <Badge>{row.category}</Badge> },
    { key: 'date', label: 'ISSUE DATE' },
    { key: 'view', label: 'PREVIEW', render: (row) => <div className="flex items-center gap-2"><button className="inline-flex items-center gap-1.5 h-8 px-3 bg-white border border-gray-200 rounded-[8px] text-[10px] font-bold tracking-widest text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handlePreview(row)} type="button"><Icon name="eye" size={16} /> VIEW</button></div> },
    { key: 'actions', label: 'ACTIONS', render: (row) => <div className="flex items-center justify-end gap-1"><button className="w-8 h-8 grid place-items-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border-0 bg-transparent" onClick={() => handleEdit(row)} type="button"><Icon name="edit" size={18} /></button><button className="w-8 h-8 grid place-items-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent" onClick={() => handleDelete(row)} type="button"><Icon name="trash" size={18} /></button></div> },
  ]
  return (
    <>
      <PageHeader title="Certificates" description="Manage and issue digital certificates for plantations and carbon credits." actionLabel="ADD CERTIFICATE" onAction={() => {
        setSelectedUserStr('');
        setSelectedPlantationStr('');
        setCategoryStr('Plantation (Standard)');
        setCreateOpen(true);
      }} />
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

      {createOpen && (
        <Modal title="Register New Certificate" submitLabel="GENERATE CERTIFICATE" onClose={() => setCreateOpen(false)} onSubmit={saveCreate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Select User" required type="select" options={userOptions} placeholder={usersLoading ? "Loading users..." : "Select User"} value={selectedUserStr} onChange={setSelectedUserStr} full />
            <Field label="Select Plantation Order" required type="select" options={plantationOptions} placeholder={plantationsLoading ? "Loading plantations..." : (selectedUserStr ? "Select Plantation" : "Select User First")} value={selectedPlantationStr} onChange={setSelectedPlantationStr} full />
            <Field label="Certificate Category" type="select" options={['Plantation (Standard)', 'Occasion / Event', 'Carbon Offset', 'IPL Dot Ball', 'Support Team']} value={categoryStr} onChange={setCategoryStr} full />
          </div>
        </Modal>
      )}

      {editOpen && (
        <Modal title="Update Certificate" submitLabel="SAVE CHANGES" onClose={() => setEditOpen(false)} onSubmit={saveEdit}>
          <div className="grid grid-cols-1 gap-6">
            <Field label="Certificate Category" required type="select" options={['Plantation (Standard)', 'Occasion / Event', 'Carbon Offset', 'IPL Dot Ball', 'Support Team']} value={editCategoryStr} onChange={setEditCategoryStr} full />
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
              <Badge tone="pink">{selectedCert.id}</Badge>
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

export function CertificatePreview({ purple = false }) {
  return (
    <div className={`relative w-full aspect-[1.414] min-h-[400px] rounded-[12px] p-6 sm:p-10 flex flex-col justify-between overflow-hidden shadow-sm border ${purple ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-white' : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'}`}>
      <div className={`absolute top-4 left-4 w-[120px] h-[120px] border-t-2 border-l-2 opacity-30 ${purple ? 'border-purple-400' : 'border-emerald-400'}`} />
      <div className={`absolute top-4 right-4 w-[120px] h-[120px] border-t-2 border-r-2 opacity-30 ${purple ? 'border-purple-400' : 'border-emerald-400'}`} />
      <div className={`absolute bottom-4 left-4 w-[120px] h-[120px] border-b-2 border-l-2 opacity-30 ${purple ? 'border-purple-400' : 'border-emerald-400'}`} />
      <div className={`absolute bottom-4 right-4 w-[120px] h-[120px] border-b-2 border-r-2 opacity-30 ${purple ? 'border-purple-400' : 'border-emerald-400'}`} />
      
      <div className="flex justify-between items-start text-[8px] sm:text-[10px] font-bold tracking-widest text-gray-500 relative z-10">
        <span className="flex items-center gap-1.5 text-[14px] font-black tracking-tighter text-gray-900 uppercase">GeoTree</span>
        <span className="text-right leading-relaxed">ISSUED DATE: &nbsp; 6/2/2026<br />CERTIFICATE ID: &nbsp; GT-2026-0001</span>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 mt-6">
        <span className={`w-14 h-14 rounded-full flex items-center justify-center text-[18px] font-black text-white shadow-lg mb-6 ${purple ? 'bg-purple-600 shadow-purple-600/30' : 'bg-emerald-600 shadow-emerald-600/30'}`}>GT</span>
        <h3 className={`text-[20px] sm:text-[28px] font-black tracking-wide uppercase m-0 mb-2 ${purple ? 'text-purple-900' : 'text-emerald-900'}`}>{purple ? 'GREEN DOT BALL HERO' : 'CERTIFICATE OF APPRECIATION'}</h3>
        <h4 className={`text-[12px] sm:text-[14px] font-[850] tracking-[4px] uppercase m-0 mb-8 opacity-70 ${purple ? 'text-purple-800' : 'text-emerald-800'}`}>{purple ? 'SUSTAINABILITY CHAMPION' : 'SPECIAL RECOGNITION'}</h4>
        <em className="font-serif text-[14px] sm:text-[16px] text-gray-600 mb-2 not-italic">This is proudly presented to</em>
        <strong className={`text-[32px] sm:text-[42px] font-black tracking-tight mb-6 ${purple ? 'text-purple-700' : 'text-emerald-700'}`}>John Doe</strong>
        <p className="max-w-[80%] text-[11px] sm:text-[13px] leading-[1.8] text-gray-700 m-0 mb-10 font-medium">{purple ? 'In recognition of your performance, 50 trees have been planted at Thar Desert Restoration on behalf of John Doe. Every dot ball makes the world a little greener.' : 'Marking this special occasion, this certificate acknowledges your thoughtful contribution of planting 50 trees under the Amazon Restoration Site initiative.'}</p>
        <b className="text-[10px] sm:text-[12px] font-bold tracking-widest uppercase text-gray-400 border-t border-gray-200/50 pt-4 w-[60%]">Nurturing a greener and more sustainable future</b>
      </div>
    </div>
  )
}
