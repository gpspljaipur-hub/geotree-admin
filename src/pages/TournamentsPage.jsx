import { useMemo, useState, useEffect } from 'react'
import Icon from '../components/Icon'
import { Actions, Badge, DataTable, EntityCell, Field, Modal, PageHeader, SearchBar, StatusToggle, TableCard, Pagination } from '../components/ui'
import { apiService } from '../config/apiService'
import { API_CONFIG } from '../config/endpoints'

export default function TournamentsPage() {
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
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
      const res = await apiService.getTournaments({ page, limit: 10 })
      const dataList = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
      if (res?.pagination) setTotalPages(res.pagination.pages || 1)
      
      const mappedRows = dataList.map((st, index) => ({
        id: st._id || st.id || `TournamentsPage-${index}`,
        values: [
          st.name || "Unnamed",
          st.short_name || "",
          st.venue || ""
        ],
        original: st
      }))
      setRows(mappedRows)
    } catch (err) {
      console.error("Error fetching tournaments:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRows = useMemo(
    () => rows.filter((row) => (row.original.name || '').toLowerCase().includes(query.toLowerCase())),
    [query, rows],
  )

  const openCreate = () => {
    setEditingId(null)
    setFormValues({
      0: '',
      1: '',
      2: '',
      3: 'upcoming',
      4: '',
      5: '',
      6: '',
      7: 'Active',
      8: ''
    })
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    const st = row.original
    setFormValues({
      0: st.name || '',
      1: st.short_name || '',
      2: st.image ? `${API_CONFIG.IMAGE_URL}${st.image}` : '',
      3: st.tournament_status || 'upcoming',
      4: st.start_date ? st.start_date.split('T')[0] : '',
      5: st.end_date ? st.end_date.split('T')[0] : '',
      6: st.venue || '',
      7: st.status !== false ? 'Active' : 'Inactive',
      8: st.description || ''
    })
    setModalOpen(true)
  }

  const saveRecord = async () => {
    try {
      const formData = new FormData()
      if (editingId) formData.append('id', editingId)
      
      formData.append('name', formValues[0] || 'New Tournament')
      formData.append('short_name', formValues[1] || '')
      formData.append('tournament_status', formValues[3] || 'upcoming')
      if (formValues[4]) formData.append('start_date', formValues[4])
      if (formValues[5]) formData.append('end_date', formValues[5])
      formData.append('venue', formValues[6] || '')
      formData.append('status', String(formValues[7] === 'Active'))
      formData.append('description', formValues[8] || '')

      if (formValues[2] && typeof formValues[2] === 'object') {
        formData.append('image', formValues[2])
      }

      if (editingId) {
        await apiService.updateTournament(formData)
      } else {
        await apiService.addTournament(formData)
      }

      setModalOpen(false)
      fetchData()
    } catch (err) {
      console.error("Error saving tournament:", err)
      alert("Failed to save tournament.")
    }
  }

  const handleDelete = async (row) => {
    if (window.confirm("Are you sure you want to delete this tournament?")) {
      try {
        await apiService.deleteTournament({ id: row.id })
        fetchData()
      } catch (err) {
        console.error("Error deleting tournament:", err)
        alert("Failed to delete tournament.")
      }
    }
  }

  const handleStatusChange = async (row, newStatus) => {
    try {
      const formData = new FormData()
      formData.append('id', row.id)
      formData.append('status', String(newStatus))
      await apiService.updateTournament(formData)
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
      label: 'TOURNAMENT', 
      render: (row) => (
        <EntityCell 
          title={row.original.name || 'Unnamed'} 
          subtitle={row.original.short_name || ''} 
          image={row.original.image ? `${API_CONFIG.IMAGE_URL}${row.original.image}` : null}
        /> 
      )
    },
    { 
      key: 'col-1', 
      label: 'TIMELINE', 
      render: (row) => {
        const start = row.original.start_date ? new Date(row.original.start_date).toLocaleDateString('en-US') : 'N/A'
        const end = row.original.end_date ? new Date(row.original.end_date).toLocaleDateString('en-US') : 'N/A'
        return (
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-gray-600">
              <span className="text-pink"><Icon name="calendar" size={14} /></span>
              {start} to {end}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 capitalize">
              <span className="bg-gray-100 text-gray-400 w-4 h-4 rounded-[4px] text-[10px] grid place-items-center">T</span>
              {row.original.tournament_status || 'unknown'}
            </span>
          </div>
        )
      } 
    },
    { key: 'col-2', label: 'VENUE', render: (row) => <span className="text-gray-600 font-semibold">{row.original.venue || '—'}</span> },
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

  return (
    <>
      <PageHeader title="Tournaments" description="Manage sports tournaments and sustainability campaigns." actionLabel="ADD TOURNAMENT" onAction={openCreate} />
      <TableCard>
        <SearchBar placeholder="Search Tournaments..." value={query} onChange={setQuery} />
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
          title={editingId ? 'Edit Tournament' : 'Register New Tournament'}
          submitLabel={editingId ? 'SAVE CHANGES' : 'REGISTER TOURNAMENT'}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Tournament Name" required placeholder="e.g. IPL 2024" value={formValues[0]} onChange={(val) => setFormValues(c => ({...c, [0]: val}))} />
            <Field label="Short Name" required placeholder="e.g. IPL" value={formValues[1]} onChange={(val) => setFormValues(c => ({...c, [1]: val}))} />
            
            <div className="flex flex-col gap-2 md:col-span-2">
              <Field label="Tournament Logo Upload" type="file" full onChange={(val) => setFormValues(c => ({...c, [2]: val}))} />
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

            <Field label="Tournament Status" type="select" options={['upcoming', 'live', 'completed']} value={formValues[3]} onChange={(val) => setFormValues(c => ({...c, [3]: val}))} />
            <Field label="Start Date" required type="date" value={formValues[4]} onChange={(val) => setFormValues(c => ({...c, [4]: val}))} />
            <Field label="End Date" required type="date" value={formValues[5]} onChange={(val) => setFormValues(c => ({...c, [5]: val}))} />
            <Field label="Venue / Country" required placeholder="e.g. India" value={formValues[6]} onChange={(val) => setFormValues(c => ({...c, [6]: val}))} />
            <Field label="Status" type="select" options={['Active', 'Inactive']} value={formValues[7]} onChange={(val) => setFormValues(c => ({...c, [7]: val}))} />
            <div className="md:col-span-2">
              <Field label="Description" type="textarea" placeholder="Brief about the tournament..." full value={formValues[8]} onChange={(val) => setFormValues(c => ({...c, [8]: val}))} />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
