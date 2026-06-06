import { useMemo, useState, useEffect } from 'react'
import { Actions, Badge, DataTable, EntityCell, Field, Modal, PageHeader, SearchBar, StatusToggle, TableCard , Pagination } from '../components/ui'
import { apiService } from '../config/apiService'

export default function TeamsPage() {
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
      const res = await apiService.getTeams({ page, limit: 10 })
      const dataList = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
      if (res?.pagination) setTotalPages(res.pagination.pages || 1)
      
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
    row.values.slice(0, 4).forEach((val, i) => {
      initialValues[i] = val || ''
    })
    setFormValues(initialValues)
    setModalOpen(true)
  }

  const saveRecord = () => {
    const nextValues = []
    for (let i = 0; i < 4; i++) {
      nextValues.push(formValues[i] || (i === 0 ? 'New Team' : '—'))
    }
    if (editingId) {
      setRows((current) => current.map((row) => row.id === editingId ? { ...row, values: nextValues } : row))
    } else {
      setRows((current) => [...current, { id: 'TeamsPage-' + Date.now(), values: nextValues }])
    }
    setModalOpen(false)
  }

  const columns = [
    { 
      key: 'col-0', 
      label: 'TEAM IDENTITY', 
      render: (row) => (
        <div className="flex items-center gap-4">
          {row.original.team_logo ? (
            <img 
              src={`http://192.168.0.19:5030${row.original.team_logo}`} 
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
            <Field label="Team Logo Upload" type="file" value={formValues[2]} onChange={(val) => setFormValues(c => ({...c, [2]: val}))} />
            <Field label="Branding Hex Color" placeholder="#E73895" value={formValues[3]} onChange={(val) => setFormValues(c => ({...c, [3]: val}))} />
            <Field label="Tournament" required type="select" options={['Indian Premier League']} value={formValues[4]} onChange={(val) => setFormValues(c => ({...c, [4]: val}))} />
            <Field label="Status" type="select" options={['Active', 'Inactive']} value={formValues[5]} onChange={(val) => setFormValues(c => ({...c, [5]: val}))} />
            <Field label="Description" type="textarea" placeholder="About the team..." full value={formValues[6]} onChange={(val) => setFormValues(c => ({...c, [6]: val}))} />
          </div>
        </Modal>
      )}
    </>
  )
}
