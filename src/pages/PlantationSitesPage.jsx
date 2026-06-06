import { useMemo, useState, useEffect } from 'react'
import { Actions, Badge, DataTable, EntityCell, Field, Modal, PageHeader, SearchBar, StatusToggle, TableCard, Pagination } from '../components/ui'
import { apiService } from '../config/apiService'

export default function PlantationSitesPage() {
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formValues, setFormValues] = useState({})
  
  // Pagination State
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [statesList, setStatesList] = useState([])

  useEffect(() => {
    fetchSites()
    fetchStates()
  }, [page])

  const fetchStates = async () => {
    try {
      const res = await apiService.getStatesLocation()
      const data = res?.data?.data || res?.data || []
      const formatted = data.map(s => typeof s === 'string' ? s : (s.state_name || s.name || s._id || s.id || String(s)))
      setStatesList(formatted)
    } catch (err) {
      console.error("Error fetching states:", err)
    }
  }

  const fetchSites = async () => {
    try {
      setLoading(true)
      const res = await apiService.getPlantationSites({ page, limit: 10 })
      
      const siteList = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
      if (res?.pagination) setTotalPages(res.pagination.pages || 1)
      
      const mappedRows = siteList.map((st, index) => {
        const district = st.district || '';
        const stateName = st.state_id?.state_name || st.state || '';
        const locationText = [district, stateName ? `(${stateName})` : null].filter(Boolean).join(' ');
        
        return {
          id: st.id || st._id || `PlantationSitesPage-${index}`,
          values: [
            st.site_name || 'Unnamed Site',
            locationText,
            st.plantation_type || 'Miyawaki',
            `${st.area || st.area_in_ha || '0'}`
          ],
          original: st
        }
      })
      setRows(mappedRows)
    } catch (err) {
      console.error("Error fetching plantation sites:", err)
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
      nextValues.push(formValues[i] || (i === 0 ? 'New Plantation Site' : '—'))
    }
    if (editingId) {
      setRows((current) => current.map((row) => row.id === editingId ? { ...row, values: nextValues } : row))
    } else {
      setRows((current) => [...current, { id: 'PlantationSitesPage-' + Date.now(), values: nextValues }])
    }
    setModalOpen(false)
  }

  const columns = [
    { 
      key: 'col-0', 
      label: 'Site Details', 
      render: (row) => {
        const district = row.original.district || '';
        const stateName = row.original.state_id?.state_name || row.original.state || '';
        const locationText = [district, stateName ? `(${stateName})` : null].filter(Boolean).join(' ');
        return (
          <EntityCell 
            title={row.original.site_name || 'Unnamed Site'} 
            subtitle={locationText ? `, ${locationText}` : ''} 
          />
        )
      } 
    },
    { 
      key: 'col-1', 
      label: 'Plantation', 
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-bold text-gray-800">{row.original.plantation_type || 'Miyawaki'}</span>
          <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
            <span className="text-pink">📣</span> {row.original.planted_count || 0} / {row.original.capacity || 0} Trees
          </span>
        </div>
      ) 
    },
    { 
      key: 'col-2', 
      label: 'Land Info', 
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-black text-blue-700 flex items-center gap-1">
            <span className="text-blue-500">📍</span> {row.original.area || row.original.area_in_ha || '—'}
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            {row.original.latitude && row.original.longitude ? `${row.original.latitude}, ${row.original.longitude}` : '—'}
          </span>
        </div>
      ) 
    },
    { key: 'col-3', label: 'Status', render: () => <StatusToggle /> },
    {
      key: 'col-4',
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
      <PageHeader title="Plantation Sites" description="Detailed management of plantation areas and tree counts" actionLabel="ADD PLANTATION SITE" onAction={openCreate} />
      <TableCard>
        <SearchBar placeholder="Search Plantation Sites..." value={query} onChange={setQuery} />
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-semibold">Loading sites...</div>
        ) : (
          <>
            <DataTable columns={columns} rows={filteredRows} />
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </>
        )}
      </TableCard>
      {modalOpen && (
        <Modal
          title={editingId ? 'Edit Plantation Site' : 'Register New Plantation Site'}
          submitLabel={editingId ? 'SAVE CHANGES' : 'REGISTER PLANTATION SITE'}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Site Name" required placeholder="e.g. Green Valley Site A" value={formValues[0]} onChange={(val) => setFormValues(c => ({...c, [0]: val}))} />
            <Field label="State" required type="select" options={statesList.length > 0 ? statesList : ['Loading...']} value={formValues[1]} onChange={(val) => setFormValues(c => ({...c, [1]: val}))} />
            <Field label="District" required type="select" options={['Chandigarh', 'Bhavnagar', 'Gadchiroli', 'Jaipur']} value={formValues[2]} onChange={(val) => setFormValues(c => ({...c, [2]: val}))} />
            <Field label="Block" placeholder="e.g. Mulshi" value={formValues[3]} onChange={(val) => setFormValues(c => ({...c, [3]: val}))} />
            <Field label="Gram Panchayat" placeholder="e.g. Hinjavadi" value={formValues[4]} onChange={(val) => setFormValues(c => ({...c, [4]: val}))} />
            <Field label="Village" placeholder="e.g. Hinjavadi Site 1" value={formValues[5]} onChange={(val) => setFormValues(c => ({...c, [5]: val}))} />
            <Field label="Plantation Type" type="select" options={['Miyawaki', 'Block Plantation']} value={formValues[6]} onChange={(val) => setFormValues(c => ({...c, [6]: val}))} />
            <Field label="Capacity" placeholder="Total Capacity" value={formValues[7]} onChange={(val) => setFormValues(c => ({...c, [7]: val}))} />
            <Field label="Area (in HA)" placeholder="e.g. 2.5" value={formValues[8]} onChange={(val) => setFormValues(c => ({...c, [8]: val}))} />
            <Field label="Site Image URL" type="file" value={formValues[9]} onChange={(val) => setFormValues(c => ({...c, [9]: val}))} />
            <Field label="Description" type="textarea" placeholder="Optional details..." full value={formValues[10]} onChange={(val) => setFormValues(c => ({...c, [10]: val}))} />
          </div>
        </Modal>
      )}
    </>
  )
}
