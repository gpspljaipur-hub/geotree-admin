import { useMemo, useState, useEffect } from 'react'
import { Actions, Badge, DataTable, EntityCell, Field, Modal, PageHeader, Pagination, SearchBar, StatusToggle, TableCard } from '../components/ui'
import { apiService } from '../config/apiService'

export default function StateSelectionPage() {
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
    fetchStates()
  }, [page])

  const fetchStates = async () => {
    try {
      setLoading(true)
      // Using limit: 10 so pagination is more apparent if there are many records
      const res = await apiService.getStates({ page, limit: 10 })
      
      const stateList = res?.data || []
      
      if (res?.pagination) {
        setTotalPages(res.pagination.pages || 1)
      }
      
      const mappedRows = stateList.map((st, index) => ({
        id: st._id || st.id || `StateSelectionPage-${index}`,
        values: [
          st.state_name || 'Unnamed State',
          st.description || '—'
        ],
        original: st
      }))
      setRows(mappedRows)
    } catch (err) {
      console.error("Error fetching states:", err)
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
    row.values.slice(0, 2).forEach((val, i) => {
      initialValues[i] = val || ''
    })
    setFormValues(initialValues)
    setModalOpen(true)
  }

  const saveRecord = () => {
    const nextValues = []
    for (let i = 0; i < 2; i++) {
      nextValues.push(formValues[i] || (i === 0 ? 'New State Selection' : '—'))
    }
    if (editingId) {
      setRows((current) => current.map((row) => row.id === editingId ? { ...row, values: nextValues } : row))
    } else {
      setRows((current) => [...current, { id: 'StateSelectionPage-' + Date.now(), values: nextValues }])
    }
    setModalOpen(false)
  }

  const columns = [
    { key: 'col-0', label: 'State Details', render: (row) => <EntityCell title={row.values[0]} /> },
    { key: 'col-1', label: 'Region', render: (row) => <span>{row.values[Math.min(1, row.values.length - 1)] || '—'}</span> },
    { key: 'col-2', label: 'Status', render: () => <StatusToggle /> },
    {
      key: 'col-3',
      label: 'Actions',
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
      <PageHeader title="State Selection" description="Manage states, regions, and plantation availability." actionLabel="ADD STATE" onAction={openCreate} />
      <TableCard>
        <SearchBar placeholder="Search States..." value={query} onChange={setQuery} />
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-semibold">Loading states...</div>
        ) : (
          <>
            <DataTable columns={columns} rows={filteredRows} />
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </>
        )}
      </TableCard>
      {modalOpen && (
        <Modal
          title={editingId ? 'Edit State Selection' : 'Register New State'}
          submitLabel={editingId ? 'SAVE CHANGES' : 'REGISTER STATE'}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="State Name" required placeholder="e.g. Maharashtra" value={formValues[0]} onChange={(val) => setFormValues(c => ({...c, [0]: val}))} />
            <Field label="Region Banner Upload" type="file" value={formValues[1]} onChange={(val) => setFormValues(c => ({...c, [1]: val}))} />
            <Field label="Status" type="select" placeholder="Active" options={['Active', 'Inactive']} value={formValues[2]} onChange={(val) => setFormValues(c => ({...c, [2]: val}))} />
            <Field label="Description" type="textarea" placeholder="Enter regional details..." full value={formValues[3]} onChange={(val) => setFormValues(c => ({...c, [3]: val}))} />
          </div>
        </Modal>
      )}
    </>
  )
}

