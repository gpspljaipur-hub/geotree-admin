import { useMemo, useState, useEffect } from 'react'
import Icon from '../components/Icon'
import { Actions, Badge, DataTable, EntityCell, Field, Modal, PageHeader, SearchBar, StatusToggle, TableCard , Pagination } from '../components/ui'
import { apiService } from '../config/apiService'

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
      console.error("Error fetching:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRows = useMemo(
    () => rows.filter((row) => row.values.join(' ').toLowerCase().includes(query.toLowerCase())),
    [query, rows],
  )

  const openCreate = () => {
    setEditingId(null)
    setFormValues({})
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    const initialValues = {}
    row.values.slice(0, 3).forEach((val, i) => {
      initialValues[i] = val || ''
    })
    setFormValues(initialValues)
    setModalOpen(true)
  }

  const saveRecord = () => {
    const nextValues = []
    for (let i = 0; i < 3; i++) {
      nextValues.push(formValues[i] || (i === 0 ? 'New Tournament' : '—'))
    }
    if (editingId) {
      setRows((current) => current.map((row) => row.id === editingId ? { ...row, values: nextValues } : row))
    } else {
      setRows((current) => [...current, { id: 'TournamentsPage-' + Date.now(), values: nextValues }])
    }
    setModalOpen(false)
  }

  const columns = [
    { 
      key: 'col-0', 
      label: 'TOURNAMENT', 
      render: (row) => <EntityCell title={row.original.name || 'Unnamed'} subtitle={row.original.short_name || ''} /> 
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
    { key: 'col-3', label: 'STATUS', render: (row) => <StatusToggle active={row.original.status !== false} /> },
    {
      key: 'col-4',
      label: 'ACTIONS',
      render: (row) => (
        <Actions
          onEdit={() => openEdit(row)}
          onDelete={() => setRows((current) => current.filter((item) => item.id !== row.id))}
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
            <Field label="Logo" type="file" value={formValues[2]} onChange={(val) => setFormValues(c => ({...c, [2]: val}))} />
            <Field label="Tournament Status" type="select" options={['Upcoming', 'Live', 'Completed']} value={formValues[3]} onChange={(val) => setFormValues(c => ({...c, [3]: val}))} />
            <Field label="Start Date" required type="date" value={formValues[4]} onChange={(val) => setFormValues(c => ({...c, [4]: val}))} />
            <Field label="End Date" required type="date" value={formValues[5]} onChange={(val) => setFormValues(c => ({...c, [5]: val}))} />
            <Field label="Venue / Country" required placeholder="e.g. India" value={formValues[6]} onChange={(val) => setFormValues(c => ({...c, [6]: val}))} />
            <Field label="Status" type="select" options={['Active', 'Inactive']} value={formValues[7]} onChange={(val) => setFormValues(c => ({...c, [7]: val}))} />
            <Field label="Description" type="textarea" placeholder="Brief about the tournament..." full value={formValues[8]} onChange={(val) => setFormValues(c => ({...c, [8]: val}))} />
          </div>
        </Modal>
      )}
    </>
  )
}
