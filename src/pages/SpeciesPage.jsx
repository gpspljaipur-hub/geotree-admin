import { useMemo, useState, useEffect } from 'react'
import { Actions, Badge, DataTable, EntityCell, Field, Modal, PageHeader, SearchBar, StatusToggle, TableCard, Pagination } from '../components/ui'
import { apiService } from '../config/apiService'
import { API_CONFIG } from '../config/endpoints'

export default function SpeciesPage() {
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
      const res = await apiService.getSpecies({ page, limit: 10 })
      const dataList = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
      if (res?.pagination) setTotalPages(res.pagination.pages || 1)
      
      const mappedRows = dataList.map((st, index) => ({
        id: st._id || st.id || `SpeciesPage-${index}`,
        values: [
          st.name || st.species_name || "Unnamed",
          st.scientific_name || "",
          st.co2_absorption ? `${st.co2_absorption}` : "",
          st.maturity_period || ""
        ],
        original: st
      }))
      setRows(mappedRows)
    } catch (err) {
      console.error("Error fetching species:", err)
    } finally {
      setLoading(false)
    }
  }

  const [newVariation, setNewVariation] = useState({ height: '', price: '' })

  const filteredRows = useMemo(
    () => rows.filter((row) => (row.original.name || row.original.species_name || '').toLowerCase().includes(query.toLowerCase())),
    [query, rows],
  )

  const openCreate = () => {
    setEditingId(null)
    setFormValues({ status: 'Active', variations: [] })
    setNewVariation({ height: '', price: '' })
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    const st = row.original
    setFormValues({
      name: st.name || st.species_name || '',
      scientific_name: st.scientific_name || '',
      co2_absorption: st.co2_absorption || '',
      maturity_period: st.maturity_period || '',
      image: st.species_image ? `${API_CONFIG.IMAGE_URL}${st.species_image}` : '',
      status: st.status !== false ? 'Active' : 'Inactive',
      description: st.description || '',
      variations: st.variations || []
    })
    setNewVariation({ height: '', price: '' })
    setModalOpen(true)
  }

  const saveRecord = async () => {
    try {
      const formData = new FormData()
      if (editingId) formData.append('id', editingId)
      
      formData.append('name', formValues.name || 'New Species')
      formData.append('scientific_name', formValues.scientific_name || '')
      formData.append('co2_absorption', formValues.co2_absorption || '0')
      formData.append('maturity_period', formValues.maturity_period || '')
      formData.append('description', formValues.description || '')
      formData.append('status', String(formValues.status === 'Active'))
      
      // Variations array
      const variations = formValues.variations || []
      formData.append('variations', JSON.stringify(variations))

      if (formValues.image && typeof formValues.image === 'object') {
        formData.append('image', formValues.image)
      }

      if (editingId) {
        await apiService.updateSpecies(formData)
      } else {
        await apiService.addSpecies(formData)
      }

      setModalOpen(false)
      fetchData()
    } catch (err) {
      console.error("Error saving species:", err)
      alert("Failed to save species.")
    }
  }

  const handleDelete = async (row) => {
    if (window.confirm("Are you sure you want to delete this species?")) {
      try {
        await apiService.deleteSpecies({ id: row.id })
        fetchData()
      } catch (err) {
        console.error("Error deleting species:", err)
        alert("Failed to delete species.")
      }
    }
  }

  const handleStatusChange = async (row, newStatus) => {
    try {
      const formData = new FormData()
      formData.append('id', row.id)
      formData.append('status', String(newStatus))
      await apiService.updateSpecies(formData)
      setRows((current) => current.map(r => r.id === row.id ? { ...r, original: { ...r.original, status: newStatus } } : r))
    } catch (err) {
      console.error("Error updating status:", err)
      alert("Failed to update status.")
      fetchData()
    }
  }

  const addVariation = () => {
    if (!newVariation.height || !newVariation.price) return
    setFormValues(prev => ({
      ...prev,
      variations: [...(prev.variations || []), newVariation]
    }))
    setNewVariation({ height: '', price: '' })
  }
  
  const removeVariation = (index) => {
    setFormValues(prev => ({
      ...prev,
      variations: (prev.variations || []).filter((_, i) => i !== index)
    }))
  }

  const columns = [
    { 
      key: 'col-0', 
      label: 'SPECIES', 
      render: (row) => (
        <EntityCell 
          title={row.original.name || row.original.species_name || 'Unnamed'} 
          subtitle={<span className="text-pink italic">{row.original.scientific_name || ''}</span>}
          image={row.original.species_image ? `${API_CONFIG.IMAGE_URL}${row.original.species_image}` : null}
        /> 
      )
    },
    { 
      key: 'col-1', 
      label: 'STATS', 
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-black text-blue-800 flex items-center gap-1">
            <span className="text-blue-500">⚖️</span> {row.original.co2_absorption || 0} kg/yr
          </span>
          <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
            <span className="text-gray-400">⏱️</span> {row.original.maturity_period || '—'}
          </span>
        </div>
      ) 
    },
    { 
      key: 'col-2', 
      label: 'PRICING & SIZE', 
      render: (row) => {
        const variations = row.original.variations || [];
        if (variations.length === 0) return <span className="text-gray-400 text-[11px]">—</span>;
        return (
          <div className="flex flex-col gap-1">
            {variations.map((v, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-gray-500 w-fit">
                {v.height}: <span className="text-pink">₹{v.price}</span>
              </span>
            ))}
          </div>
        )
      } 
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

  return (
    <>
      <PageHeader title="Species" description="Manage species, carbon sequestration and nursery pricing." actionLabel="ADD SPECIES" onAction={openCreate} />
      <TableCard>
        <SearchBar placeholder="Search Species..." value={query} onChange={setQuery} />
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
          title={editingId ? 'Edit Species' : 'Register New Species'}
          submitLabel={editingId ? 'SAVE CHANGES' : 'REGISTER SPECIES'}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Species Name" required placeholder="e.g. Neem" value={formValues.name || ''} onChange={(val) => setFormValues(c => ({...c, name: val}))} />
            <Field label="Scientific Name" placeholder="e.g. Azadirachta indica" value={formValues.scientific_name || ''} onChange={(val) => setFormValues(c => ({...c, scientific_name: val}))} />
            <Field label="Sequestration (KGS/YEAR)" placeholder="0" value={formValues.co2_absorption || ''} onChange={(val) => setFormValues(c => ({...c, co2_absorption: val}))} />
            <Field label="Maturity Period" placeholder="e.g. 10-15 Years" value={formValues.maturity_period || ''} onChange={(val) => setFormValues(c => ({...c, maturity_period: val}))} />
            
            <div className="flex flex-col gap-2 md:col-span-2">
              <Field label="Species Image Upload (Optional on Edit)" type="file" full onChange={(val) => setFormValues(c => ({...c, image: val}))} />
              {formValues.image && (
                <div className="flex items-center gap-3 mt-1 p-2 bg-gray-50 rounded-xl border border-gray-100 w-max pr-4">
                  <img 
                    src={typeof formValues.image === 'string' ? formValues.image : URL.createObjectURL(formValues.image)} 
                    alt="Preview" 
                    className="w-10 h-10 rounded-lg object-contain p-1 border border-gray-100 shadow-sm bg-white" 
                  />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    {typeof formValues.image === 'string' ? 'Current Image' : 'New Image Selected'}
                  </span>
                </div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-[11px] font-[850] text-gray-700 uppercase tracking-wider mb-2">HEIGHT & PRICE</label>
              <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50">
                {(!formValues.variations || formValues.variations.length === 0) ? (
                  <p className="text-[12px] font-semibold text-gray-400 italic mb-4">No items added yet</p>
                ) : (
                  <div className="mb-4 flex flex-wrap gap-4">
                    {formValues.variations.map((v, i) => (
                      <div key={i} className="flex items-center gap-4 bg-white px-4 py-3 rounded-2xl border border-gray-200 shadow-sm w-fit">
                        <div className="flex flex-col gap-1">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                            HEIGHT: <span className="text-[12px] font-[850] text-gray-800 normal-case ml-1">{v.height}</span>
                          </div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                            PRICE: <span className="text-[12px] font-[850] text-gray-800 normal-case ml-1">{v.price}</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeVariation(i)} className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-red-500 border-0 cursor-pointer transition-colors text-sm font-bold ml-2">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-4 items-end bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mt-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">HEIGHT</label>
                    <input 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                      placeholder="e.g. 5-6 ft" 
                      value={newVariation.height}
                      onChange={e => setNewVariation(prev => ({...prev, height: e.target.value}))}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">PRICE</label>
                    <input 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                      placeholder="e.g. 500" 
                      value={newVariation.price}
                      onChange={e => setNewVariation(prev => ({...prev, price: e.target.value}))}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={addVariation}
                    className="px-6 py-3 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-xl text-[11px] font-[850] uppercase tracking-wider transition-colors border-0 cursor-pointer shadow-md shadow-blue-900/20 mb-[1px]"
                  >
                    ADD
                  </button>
                </div>
              </div>
            </div>

            <Field label="Status" type="select" options={['Active', 'Inactive']} value={formValues.status || 'Active'} onChange={(val) => setFormValues(c => ({...c, status: val}))} />
            <Field label="Description" type="textarea" placeholder="Brief description..." full value={formValues.description || ''} onChange={(val) => setFormValues(c => ({...c, description: val}))} />
          </div>
        </Modal>
      )}
    </>
  )
}
