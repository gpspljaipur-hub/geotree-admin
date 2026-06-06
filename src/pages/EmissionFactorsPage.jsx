import { useMemo, useState, useEffect } from 'react'
import { Actions, Badge, DataTable, EntityCell, Field, Modal, PageHeader, SearchBar, StatusToggle, TableCard , Pagination } from '../components/ui'
import { apiService } from '../config/apiService'

export default function EmissionFactorsPage() {
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
      const res = await apiService.getEmissionFactors({ page, limit: 10 })
      const dataList = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
      if (res?.pagination) setTotalPages(res.pagination.pages || 1)
      
      const mappedRows = dataList.map((st, index) => ({
        id: st._id || st.id || `EmissionFactorsPage-${index}`,
        values: [
          st.sub_category || st.factor_name || st.name || "Unnamed",
          st.category || "—",
          st.unit || "—",
          st.factor !== undefined ? st.factor : (st.value ?? "—"),
          st.status
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
      nextValues.push(formValues[i] || (i === 0 ? 'New Emission Factor' : '—'))
    }
    if (editingId) {
      setRows((current) => current.map((row) => row.id === editingId ? { ...row, values: nextValues } : row))
    } else {
      setRows((current) => [...current, { id: 'EmissionFactorsPage-' + Date.now(), values: nextValues }])
    }
    setModalOpen(false)
  }

  const columns = [
    { 
      key: 'col-0', 
      label: 'FACTOR', 
      render: (row) => {
        const name = row.values[0] || 'Unknown';
        const initials = name.split(/[\s-]+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-4 py-1">
            <div className="w-[36px] h-[36px] rounded-lg bg-[#fff0f7] text-[#df3b91] flex items-center justify-center text-[11px] font-[850] tracking-wider">
              {initials}
            </div>
            <strong className="text-[13px] font-[850] text-gray-900 tracking-tight">{name}</strong>
          </div>
        )
      } 
    },
    { 
      key: 'col-1', 
      label: 'CATEGORY', 
      render: (row) => <Badge>{row.values[1]}</Badge> 
    },
    { 
      key: 'col-2', 
      label: 'UNIT', 
      render: (row) => <span className="text-[12px] text-gray-500 font-semibold">{row.values[2]}</span> 
    },
    { 
      key: 'col-3', 
      label: 'FACTOR VALUE', 
      render: (row) => (
        <div className="flex items-baseline gap-1.5">
          <strong className="text-[#df3b91] font-black text-[13px]">{row.values[3]}</strong>
          <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase">{row.values[2]}</span>
        </div>
      ) 
    },
    { 
      key: 'col-4', 
      label: 'STATUS', 
      render: (row) => <StatusToggle active={row.values[4] === true || row.values[4] === 'Active'} tone="pink" /> 
    },
    {
      key: 'col-5',
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
      <PageHeader title="Emission Factors" description="Manage and update carbon emission factors and metrics." actionLabel="ADD EMISSION FACTOR" onAction={openCreate} />
      <TableCard>
        <SearchBar placeholder="Search factors..." value={query} onChange={setQuery} showButton={true} />
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
          title={editingId ? 'Edit Emission Factor' : 'Register New Emission Factor'}
          submitLabel={editingId ? 'SAVE CHANGES' : 'REGISTER EMISSION FACTOR'}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Factor Name" required value={formValues[0]} onChange={(val) => setFormValues(c => ({...c, [0]: val}))} />
            <Field label="Category" type="select" options={['Transport', 'Energy', 'Food', 'Waste']} value={formValues[1]} onChange={(val) => setFormValues(c => ({...c, [1]: val}))} />
            <Field label="Display Image" type="file" full value={formValues[2]} onChange={(val) => setFormValues(c => ({...c, [2]: val}))} />
            <Field label="Unit" placeholder="e.g. kg/km, kg/kWh" value={formValues[3]} onChange={(val) => setFormValues(c => ({...c, [3]: val}))} />
            <Field label="Factor Value" placeholder="e.g. 0.21" value={formValues[4]} onChange={(val) => setFormValues(c => ({...c, [4]: val}))} />
            <Field label="Status" type="select" options={['Active', 'Inactive']} value={formValues[5]} onChange={(val) => setFormValues(c => ({...c, [5]: val}))} />
          </div>
        </Modal>
      )}
    </>
  )
}
