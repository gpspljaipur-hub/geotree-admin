import { useMemo, useState, useEffect } from 'react'
import { Actions, Badge, DataTable, EntityCell, Field, Modal, PageHeader, SearchBar, StatusToggle, TableCard , Pagination } from '../components/ui'
import { apiService } from '../config/apiService'

export default function NurseriesPage() {
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
      const res = await apiService.getNurseries({ page, limit: 10 })
      const dataList = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
      if (res?.pagination) setTotalPages(res.pagination.pages || 1)
      
      const mappedRows = dataList.map((st, index) => ({
        id: st._id || st.id || `NurseriesPage-${index}`,
        values: [
          st.nursery_name || st.name || "Unnamed",
          st.location || "—",
          st.capacity || "—",
          st.owner_name || "—"
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
      nextValues.push(formValues[i] || (i === 0 ? 'New Nurserie' : '—'))
    }
    if (editingId) {
      setRows((current) => current.map((row) => row.id === editingId ? { ...row, values: nextValues } : row))
    } else {
      setRows((current) => [...current, { id: 'NurseriesPage-' + Date.now(), values: nextValues }])
    }
    setModalOpen(false)
  }

  const columns = [
    { key: 'col-0', label: 'NURSERY HUB', render: (row) => <EntityCell title={row.values[0]} /> },
    { key: 'col-1', label: 'LOCATION & ADDRESS', render: (row) => <span>{row.values[1] || '—'}</span> },
    { key: 'col-2', label: 'ADMINISTRATIVE', render: (row) => <span>{row.values[3] || '—'}</span> },
    { key: 'col-3', label: 'APP STATUS', render: () => <StatusToggle active={true} /> },
    {
      key: 'col-4',
      label: 'ACTIONS',
      align: 'right',
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
      <PageHeader title="Nurseries" description="Track partner nurseries, ownership, and available inventory." actionLabel="ADD NURSERY" onAction={openCreate} />
      <TableCard>
        <SearchBar placeholder="Search Nurseries..." value={query} onChange={setQuery} />
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
          title={editingId ? 'Edit Nurserie' : 'Register New Nursery'}
          submitLabel={editingId ? 'SAVE CHANGES' : 'REGISTER NURSERY'}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Nursery Name" required placeholder="e.g. Green Valley Nursery" value={formValues[0]} onChange={(val) => setFormValues(c => ({...c, [0]: val}))} />
            <Field label="Image Upload" type="file" value={formValues[1]} onChange={(val) => setFormValues(c => ({...c, [1]: val}))} />
            <Field label="Coordinates (LAT, LONG)" required placeholder="e.g. 18.5204, 73.8567" value={formValues[2]} onChange={(val) => setFormValues(c => ({...c, [2]: val}))} />
            <Field label="Ownership Type" type="select" options={['Private', 'Government', 'Leased', 'NGO']} value={formValues[3]} onChange={(val) => setFormValues(c => ({...c, [3]: val}))} />
            
            <div className="md:col-span-2">
              <Field label="Khasra ID / Plot No" required placeholder="e.g. KH-9021" value={formValues[4]} onChange={(val) => setFormValues(c => ({...c, [4]: val}))} />
            </div>
            
            <div className="md:col-span-2 flex flex-col gap-3">
              <label className="text-[13px] font-black tracking-widest text-[#2f3b52] uppercase">
                SPECIES INVENTORY
              </label>
              <div className="bg-[#fafafa] rounded-[16px] p-6 border border-gray-100 flex flex-col gap-6">
                <span className="text-[14px] font-semibold italic text-[#a3b1cc]">No items added yet</span>
                <div className="bg-white rounded-[16px] p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row items-end gap-5">
                  <div className="flex-1 w-full">
                    <Field label="Species" type="select" options={['Select Species']} />
                  </div>
                  <div className="flex-1 w-full">
                    <Field label="Count" placeholder="e.g. 50" />
                  </div>
                  <button type="button" className="bg-[#244ea3] text-white text-[12px] font-black tracking-widest uppercase rounded-[8px] px-8 h-[42px] hover:bg-blue-800 transition-colors shadow-sm mb-0 md:mb-[2px] w-full md:w-auto">ADD</button>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <Field label="Status" type="select" options={['Active', 'Inactive']} value={formValues[5]} onChange={(val) => setFormValues(c => ({...c, [5]: val}))} />
            </div>
            <Field label="Full Address" type="textarea" placeholder="Enter physical address..." full value={formValues[6]} onChange={(val) => setFormValues(c => ({...c, [6]: val}))} />
          </div>
        </Modal>
      )}
    </>
  )
}
