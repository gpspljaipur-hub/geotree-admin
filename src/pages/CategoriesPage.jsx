import { useMemo, useState, useEffect } from 'react'
import { Actions, Badge, DataTable, EntityCell, Field, Modal, PageHeader, SearchBar, StatusToggle, TableCard , Pagination } from '../components/ui'
import { apiService } from '../config/apiService'

export default function CategoriesPage() {
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
      const res = await apiService.getCategories({ page, limit: 10 })
      const dataList = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
      if (res?.pagination) setTotalPages(res.pagination.pages || 1)
      
      const mappedRows = dataList.map((st, index) => ({
        id: st._id || st.id || `CategoriesPage-${index}`,
        values: [
          st.name || "Unnamed",
          st.type || "",
          st.description || ""
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
    setFormValues({
      0: row.original.name || '',
      1: row.original.type || '',
      2: '', // Image placeholder
      3: row.original.status !== false ? 'Active' : 'Inactive',
      4: row.original.description || ''
    })
    setModalOpen(true)
  }

  const saveRecord = () => {
    const nextValues = [
      formValues[0] || 'New Category',
      formValues[1] || '',
      formValues[4] || ''
    ]
    if (editingId) {
      setRows((current) => current.map((row) => row.id === editingId ? { ...row, values: nextValues, original: { ...row.original, name: formValues[0], type: formValues[1], description: formValues[4], status: formValues[3] === 'Active' } } : row))
    } else {
      setRows((current) => [...current, { id: 'CategoriesPage-' + Date.now(), values: nextValues, original: { name: formValues[0], type: formValues[1], description: formValues[4], status: formValues[3] === 'Active' } }])
    }
    setModalOpen(false)
  }

  const columns = [
    { 
      key: 'col-0', 
      label: 'CATEGORY', 
      render: (row) => (
        <EntityCell 
          title={row.original.name || 'Unnamed'} 
          subtitle={<span className="text-pink">{row.original.type || ''}</span>} 
        />
      ) 
    },
    { key: 'col-1', label: 'STATUS', render: (row) => <StatusToggle active={row.original.status !== false} /> },
    {
      key: 'col-2',
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
      <PageHeader title="Categories" description="Organize trees and initiatives into reusable categories." actionLabel="ADD CATEGORY" onAction={openCreate} />
      <TableCard>
        <SearchBar placeholder="Search Categories..." value={query} onChange={setQuery} />
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
          title={editingId ? 'Edit Categorie' : 'Register New Category'}
          submitLabel={editingId ? 'SAVE CHANGES' : 'REGISTER CATEGORY'}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Category Name" required placeholder="e.g. Ornamental" value={formValues[0]} onChange={(val) => setFormValues(c => ({...c, [0]: val}))} />
            <Field label="Category Type" required type="select" options={['Species', 'Occasion', 'Plantation']} value={formValues[1]} onChange={(val) => setFormValues(c => ({...c, [1]: val}))} />
            <Field label="Category Image Upload" type="file" full value={formValues[2]} onChange={(val) => setFormValues(c => ({...c, [2]: val}))} />
            <Field label="Status" type="select" options={['Active', 'Inactive']} value={formValues[3]} onChange={(val) => setFormValues(c => ({...c, [3]: val}))} />
            <Field label="Description" type="textarea" placeholder="Brief description..." full value={formValues[4]} onChange={(val) => setFormValues(c => ({...c, [4]: val}))} />
          </div>
        </Modal>
      )}
    </>
  )
}
