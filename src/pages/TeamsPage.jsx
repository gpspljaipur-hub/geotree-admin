import { useMemo, useState, useEffect } from 'react'
import { Actions, Badge, DataTable, EntityCell, Field, Modal, PageHeader, SearchBar, StatusToggle, TableCard, Pagination } from '../components/ui'
import { apiService } from '../config/apiService'
import { API_CONFIG } from '../config/endpoints'

export default function TeamsPage() {
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formValues, setFormValues] = useState({})
  
  // Pagination State
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchData()
  }, [page])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [res, toursRes] = await Promise.all([
        apiService.getTeams({ page, limit: 10 }),
        apiService.getTournaments({ page: 1, limit: 100 })
      ])
      
      const dataList = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
      if (res?.pagination) setTotalPages(res.pagination.pages || 1)
      
      let tList = toursRes?.data?.data || toursRes?.data || []
      if (!Array.isArray(tList) && tList.docs) tList = tList.docs
      if (!Array.isArray(tList)) tList = []
      setTournaments(tList)
      
      const mappedRows = dataList.map((st, index) => ({
        id: st._id || st.id || `TeamsPage-${index}`,
        values: [
          st.team_name || "Unnamed",
          st.team_short_name || "",
          st.tournament_id?.name || "",
          st.team_color || ""
        ],
        original: st
      }))
      setRows(mappedRows)
    } catch (err) {
      console.error("Error fetching teams:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRows = useMemo(
    () => rows.filter((row) => (row.original.team_name || '').toLowerCase().includes(query.toLowerCase())),
    [query, rows],
  )

  const openCreate = () => {
    setEditingId(null)
    setFormValues({
      0: '',
      1: '',
      2: '',
      3: '#cccccc',
      4: tournaments.length > 0 ? tournaments[0]._id : '',
      5: 'Active',
      6: ''
    })
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    const st = row.original
    setFormValues({
      0: st.team_name || st.name || '',
      1: st.team_short_name || st.full_name || '',
      2: st.team_logo ? `${API_CONFIG.IMAGE_URL}${st.team_logo}` : '',
      3: st.team_color || '#cccccc',
      4: st.tournament_id?._id || st.tournament_id || (tournaments.length > 0 ? tournaments[0]._id : ''),
      5: st.status !== false ? 'Active' : 'Inactive',
      6: st.description || ''
    })
    setModalOpen(true)
  }

  const saveRecord = async () => {
    try {
      const formData = new FormData()
      if (editingId) formData.append('id', editingId)
      
      formData.append('team_name', formValues[0] || 'New Team')
      formData.append('team_short_name', formValues[1] || '')
      formData.append('team_color', formValues[3] || '#cccccc')
      if (formValues[4]) formData.append('tournament_id', formValues[4])
      formData.append('status', String(formValues[5] === 'Active'))
      formData.append('description', formValues[6] || '')

      if (formValues[2] && typeof formValues[2] === 'object') {
        formData.append('logo', formValues[2])
      }

      if (editingId) {
        await apiService.updateTeam(formData)
      } else {
        await apiService.addTeam(formData)
      }

      setModalOpen(false)
      fetchData()
    } catch (err) {
      console.error("Error saving team:", err)
      alert("Failed to save team.")
    }
  }

  const handleDelete = async (row) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        await apiService.deleteTeam({ id: row.id })
        fetchData()
      } catch (err) {
        console.error("Error deleting team:", err)
        alert("Failed to delete team.")
      }
    }
  }

  const handleStatusChange = async (row, newStatus) => {
    try {
      const formData = new FormData()
      formData.append('id', row.id)
      formData.append('status', String(newStatus))
      await apiService.updateTeam(formData)
      setRows((current) => current.map(r => r.id === row.id ? { ...r, original: { ...r.original, status: newStatus } } : r))
    } catch (err) {
      console.error("Error updating status:", err)
      alert("Failed to update status.")
      fetchData()
    }
  }

  const columns = [
    { 
      key: 'col-0', 
      label: 'TEAM IDENTITY', 
      render: (row) => (
        <div className="flex items-center gap-4">
          {row.original.team_logo ? (
            <img 
              src={`${API_CONFIG.IMAGE_URL}${row.original.team_logo}`} 
              alt={row.original.team_name} 
              className="w-10 h-10 rounded-lg object-contain bg-white border border-gray-100 p-1" 
              onError={(e) => { e.target.style.display = 'none' }} 
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200" />
          )}
          <div className="flex items-center gap-2">
            <strong className="text-[14px] font-bold text-gray-800">{row.original.team_name}</strong>
            {row.original.tournament_id?.short_name && (
              <span className="bg-pink-50 text-pink text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
                {row.original.tournament_id.short_name}
              </span>
            )}
          </div>
        </div>
      )
    },
    { 
      key: 'col-1', 
      label: 'BRANDING', 
      render: (row) => (
        <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500 uppercase">
          <div className="w-[18px] h-[18px] rounded-full shadow-inner" style={{ backgroundColor: row.original.team_color || '#cccccc' }} />
          {row.original.team_color || 'N/A'}
        </div>
      )
    },
    { 
      key: 'col-2', 
      label: 'TOURNAMENT', 
      render: (row) => <strong className="text-[12px] font-bold text-gray-700">{row.original.tournament_id?.name || '—'}</strong> 
    },
    { key: 'col-3', label: 'STATUS', render: (row) => <StatusToggle active={row.original.status !== false} onChange={(newStatus) => handleStatusChange(row, newStatus)} /> },
    {
      key: 'col-4',
      label: 'ACTIONS',
      render: (row) => (
        <Actions
          onEdit={() => openEdit(row)}
          onDelete={() => handleDelete(row)}
        />
      ),
    }
  ]

  const tournamentOptions = tournaments.map(t => ({ label: t.name, value: t._id }))

  return (
    <>
      <PageHeader title="Teams" description="Manage tournament teams, branding, and supporters." actionLabel="ADD TEAM" onAction={openCreate} />
      <TableCard>
        <SearchBar placeholder="Search Teams..." value={query} onChange={setQuery} />
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-semibold">Loading...</div>
        ) : (
          <>
            <DataTable columns={columns} rows={filteredRows} />
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </>
        )}
      </TableCard>
      {modalOpen && (
        <Modal
          title={editingId ? 'Edit Team' : 'Register New Team'}
          submitLabel={editingId ? 'SAVE CHANGES' : 'REGISTER TEAM'}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Team Name" required placeholder="e.g. Rajasthan Royals" value={formValues[0]} onChange={(val) => setFormValues(c => ({...c, [0]: val}))} />
            <Field label="Team Short Name" placeholder="e.g. RR" value={formValues[1]} onChange={(val) => setFormValues(c => ({...c, [1]: val}))} />
            
            <div className="flex flex-col gap-2 md:col-span-2">
              <Field label="Team Logo Upload" type="file" full onChange={(val) => setFormValues(c => ({...c, [2]: val}))} />
              {formValues[2] && (
                <div className="flex items-center gap-3 mt-1 p-2 bg-gray-50 rounded-xl border border-gray-100 w-max pr-4">
                  <img 
                    src={typeof formValues[2] === 'string' ? formValues[2] : URL.createObjectURL(formValues[2])} 
                    alt="Preview" 
                    className="w-10 h-10 rounded-lg object-contain p-1 border border-gray-100 shadow-sm bg-white" 
                  />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    {typeof formValues[2] === 'string' ? 'Current Logo' : 'New Logo Selected'}
                  </span>
                </div>
              )}
            </div>

            <Field label="Branding Hex Color" type="color" value={formValues[3]} onChange={(val) => setFormValues(c => ({...c, [3]: val}))} />
            <Field label="Tournament" required type="select" options={tournamentOptions} value={formValues[4]} onChange={(val) => setFormValues(c => ({...c, [4]: val}))} />
            <Field label="Status" type="select" options={['Active', 'Inactive']} value={formValues[5]} onChange={(val) => setFormValues(c => ({...c, [5]: val}))} />
            
            <div className="md:col-span-2">
              <Field label="Description" type="textarea" placeholder="About the team..." full value={formValues[6]} onChange={(val) => setFormValues(c => ({...c, [6]: val}))} />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
