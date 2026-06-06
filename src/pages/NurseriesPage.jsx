import { useMemo, useState, useEffect } from 'react'
import { Actions, Badge, DataTable, EntityCell, Field, Modal, PageHeader, SearchBar, StatusToggle, TableCard, Pagination } from '../components/ui'
import { apiService } from '../config/apiService'
import { API_CONFIG } from '../config/endpoints'

export default function NurseriesPage() {
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [speciesList, setSpeciesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formValues, setFormValues] = useState({})
  
  // Stock / Inventory State
  const [selectedSpecies, setSelectedSpecies] = useState('')
  const [speciesCount, setSpeciesCount] = useState('')
  
  // Pagination State
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchData()
  }, [page])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [res, speciesRes] = await Promise.all([
        apiService.getNurseries({ page, limit: 10 }),
        apiService.getSpecies({ page: 1, limit: 100 })
      ])
      
      if (res?.pagination) setTotalPages(res.pagination.pages || 1)
      const dataList = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
      
      const spList = speciesRes?.data?.data || speciesRes?.data || []
      setSpeciesList(spList)
      
      const mappedRows = dataList.map((st, index) => ({
        id: st._id || st.id || `NurseriesPage-${index}`,
        values: [
          st.name || "Unnamed",
          st.address || "—",
          st.ownership_type || "—"
        ],
        original: st
      }))
      setRows(mappedRows)
    } catch (err) {
      console.error("Error fetching nurseries:", err)
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
      0: '', // Name
      1: '', // Image
      2: '', // Coordinates
      3: 'Private', // Ownership
      4: '', // Khasra ID (if any)
      5: 'Active', // Status
      6: '', // Address
      7: []  // Stock Array
    })
    setSelectedSpecies('')
    setSpeciesCount('')
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    const st = row.original
    
    let coords = ''
    if (st.lat !== undefined && st.lng !== undefined) {
      coords = `${st.lat}, ${st.lng}`
    }

    setFormValues({
      0: st.name || '',
      1: st.nursery_image ? `${API_CONFIG.IMAGE_URL}${st.nursery_image}` : '',
      2: coords,
      3: st.ownership_type || 'Private',
      4: st.khasra_id || '',
      5: st.status !== false ? 'Active' : 'Inactive',
      6: st.address || '',
      7: Array.isArray(st.stock) ? st.stock : []
    })
    setSelectedSpecies('')
    setSpeciesCount('')
    setModalOpen(true)
  }

  const handleAddStock = () => {
    if (!selectedSpecies || !speciesCount) return
    const sp = speciesList.find(s => s._id === selectedSpecies || s.id === selectedSpecies)
    if (!sp) return

    const newStockItem = {
      species_id: sp._id || sp.id,
      name: sp.name,
      count: Number(speciesCount)
    }

    setFormValues(c => ({
      ...c,
      7: [...(c[7] || []), newStockItem]
    }))
    
    setSelectedSpecies('')
    setSpeciesCount('')
  }

  const handleRemoveStock = (index) => {
    setFormValues(c => {
      const newStock = [...(c[7] || [])]
      newStock.splice(index, 1)
      return { ...c, 7: newStock }
    })
  }

  const saveRecord = async () => {
    try {
      const formData = new FormData()
      if (editingId) formData.append('id', editingId)
      
      formData.append('name', formValues[0] || 'New Nursery')
      formData.append('ownership_type', formValues[3] || 'Private')
      formData.append('khasra_id', formValues[4] || '')
      formData.append('status', String(formValues[5] === 'Active'))
      formData.append('address', formValues[6] || '')

      if (formValues[2]) {
        const parts = formValues[2].split(',')
        if (parts.length >= 2) {
          formData.append('lat', parts[0].trim())
          formData.append('lng', parts[1].trim())
        }
      }

      if (formValues[1] && typeof formValues[1] === 'object') {
        formData.append('nursery_image', formValues[1])
      }

      if (formValues[7] && formValues[7].length > 0) {
        formData.append('stock', JSON.stringify(formValues[7]))
      }

      if (editingId) {
        await apiService.updateNursery(formData)
      } else {
        await apiService.addNursery(formData)
      }

      setModalOpen(false)
      fetchData()
    } catch (err) {
      console.error("Error saving nursery:", err)
      alert("Failed to save nursery.")
    }
  }

  const handleDelete = async (row) => {
    if (window.confirm("Are you sure you want to delete this nursery?")) {
      try {
        await apiService.deleteNursery({ id: row.id })
        fetchData()
      } catch (err) {
        console.error("Error deleting nursery:", err)
        alert("Failed to delete nursery.")
      }
    }
  }

  const handleStatusChange = async (row, newStatus) => {
    try {
      const formData = new FormData()
      formData.append('id', row.id)
      formData.append('status', String(newStatus))
      await apiService.updateNursery(formData)
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
      label: 'NURSERY HUB', 
      render: (row) => (
        <EntityCell 
          title={row.original.name || 'Unnamed'} 
          subtitle={`Total Stock: ${Array.isArray(row.original.stock) ? row.original.stock.length : 0} items`}
          image={row.original.nursery_image ? `${API_CONFIG.IMAGE_URL}${row.original.nursery_image}` : null}
        />
      )
    },
    { key: 'col-1', label: 'LOCATION & ADDRESS', render: (row) => <span className="text-gray-600 font-semibold text-[13px]">{row.original.address || '—'}</span> },
    { key: 'col-2', label: 'OWNERSHIP', render: (row) => <span className="bg-pink-50 text-pink px-2.5 py-1 rounded font-black uppercase text-[10px] tracking-widest">{row.original.ownership_type || '—'}</span> },
    { key: 'col-3', label: 'APP STATUS', render: (row) => <StatusToggle active={row.original.status !== false} onChange={(newStatus) => handleStatusChange(row, newStatus)} /> },
    {
      key: 'col-4',
      label: 'ACTIONS',
      align: 'right',
      render: (row) => (
        <Actions
          onEdit={() => openEdit(row)}
          onDelete={() => handleDelete(row)}
        />
      ),
    }
  ]

  const speciesOptions = speciesList.map(s => ({ label: s.name, value: s._id || s.id }))

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
          title={editingId ? 'Edit Nursery' : 'Register New Nursery'}
          submitLabel={editingId ? 'SAVE CHANGES' : 'REGISTER NURSERY'}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Nursery Name" required placeholder="e.g. Green Valley Nursery" value={formValues[0]} onChange={(val) => setFormValues(c => ({...c, [0]: val}))} />
            
            <div className="flex flex-col gap-2">
              <Field label="Nursery Image" type="file" full onChange={(val) => setFormValues(c => ({...c, [1]: val}))} />
              {formValues[1] && (
                <div className="flex items-center gap-3 mt-1 p-2 bg-gray-50 rounded-xl border border-gray-100 w-max pr-4">
                  <img 
                    src={typeof formValues[1] === 'string' ? formValues[1] : URL.createObjectURL(formValues[1])} 
                    alt="Preview" 
                    className="w-10 h-10 rounded-lg object-cover p-0 border border-gray-100 shadow-sm bg-white" 
                  />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    {typeof formValues[1] === 'string' ? 'Current Image' : 'New Image Selected'}
                  </span>
                </div>
              )}
            </div>

            <Field label="Coordinates (LAT, LONG)" placeholder="e.g. 18.5204, 73.8567" value={formValues[2]} onChange={(val) => setFormValues(c => ({...c, [2]: val}))} />
            <Field label="Ownership Type" type="select" options={['Private', 'Government', 'Leased', 'NGO']} value={formValues[3]} onChange={(val) => setFormValues(c => ({...c, [3]: val}))} />
            
            <div className="md:col-span-2">
              <Field label="Khasra ID / Plot No" placeholder="e.g. KH-9021" value={formValues[4]} onChange={(val) => setFormValues(c => ({...c, [4]: val}))} />
            </div>
            
            <div className="md:col-span-2 flex flex-col gap-3">
              <label className="text-[13px] font-black tracking-widest text-[#2f3b52] uppercase">
                SPECIES INVENTORY (STOCK)
              </label>
              <div className="bg-[#fafafa] rounded-[16px] p-6 border border-gray-100 flex flex-col gap-6">
                
                {(!formValues[7] || formValues[7].length === 0) ? (
                  <span className="text-[14px] font-semibold italic text-[#a3b1cc]">No items added yet</span>
                ) : (
                  <div className="flex flex-col gap-2">
                    {formValues[7].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-pink-50 text-pink flex items-center justify-center font-black text-[12px]">{idx + 1}</span>
                          <div>
                            <p className="text-[13px] font-bold text-gray-900">{item.name || item.species_id}</p>
                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Count: {item.count}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => handleRemoveStock(idx)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                          <Icon name="x" size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white rounded-[16px] p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row items-end gap-5">
                  <div className="flex-1 w-full">
                    <Field label="Species" type="select" options={[{label: 'Select Species', value: ''}, ...speciesOptions]} value={selectedSpecies} onChange={setSelectedSpecies} />
                  </div>
                  <div className="flex-1 w-full">
                    <Field label="Count" type="number" placeholder="e.g. 50" value={speciesCount} onChange={setSpeciesCount} />
                  </div>
                  <button type="button" onClick={handleAddStock} className="bg-[#244ea3] text-white text-[12px] font-black tracking-widest uppercase rounded-[8px] px-8 h-[42px] hover:bg-blue-800 transition-colors shadow-sm mb-0 md:mb-[2px] w-full md:w-auto">ADD</button>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <Field label="Status" type="select" options={['Active', 'Inactive']} value={formValues[5]} onChange={(val) => setFormValues(c => ({...c, [5]: val}))} />
            </div>
            <div className="md:col-span-2">
              <Field label="Full Address" type="textarea" placeholder="Enter physical address..." full value={formValues[6]} onChange={(val) => setFormValues(c => ({...c, [6]: val}))} />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
