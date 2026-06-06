import { useMemo, useState, useEffect } from 'react'
import Icon from '../components/Icon'
import { Actions, Badge, DataTable, EntityCell, Field, Modal, PageHeader, SearchBar, StatusToggle, TableCard, Pagination } from '../components/ui'
import { apiService } from '../config/apiService'

export default function AdminsPage() {
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
      const res = await apiService.getAdmins({ page, limit: 10 })
      const dataList = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
      if (res?.pagination) setTotalPages(res.pagination.pages || 1)
      
      const mappedRows = dataList.map((st, index) => ({
        id: st._id || st.id || `AdminsPage-${index}`,
        values: [
          st.name || st.first_name || "Unnamed",
          st.email || "—",
          st.role || "—",
          st.status
        ],
        original: st
      }))
      setRows(mappedRows)
    } catch (err) {
      console.error("Error fetching admins:", err)
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
    setFormValues({
      0: '', // Name
      2: '', // Email
      3: '', // Password
      4: 'admin', // Role (Backend uses 'admin'/'super admin' etc.)
      5: 'Active' // Status
    })
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    const st = row.original
    setFormValues({
      0: st.name || st.first_name || '',
      2: st.email || '',
      3: '', // Password usually left blank for update unless changing
      4: st.role || 'admin',
      5: st.status !== false ? 'Active' : 'Inactive'
    })
    setModalOpen(true)
  }

  const saveRecord = async () => {
    try {
      const payload = {
        name: formValues[0],
        email: formValues[2],
        role: formValues[4],
        status: formValues[5] === 'Active'
      }

      // Only send password if provided
      if (formValues[3]) {
        payload.password = formValues[3]
      }

      if (editingId) {
        payload.id = editingId
        await apiService.updateAdmin(payload)
      } else {
        await apiService.addAdmin(payload)
      }
      
      setModalOpen(false)
      fetchData()
    } catch (err) {
      console.error("Error saving admin:", err)
      alert("Failed to save admin.")
    }
  }

  const handleDelete = async (row) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        await apiService.deleteAdmin({ id: row.id })
        fetchData()
      } catch (err) {
        console.error("Error deleting admin:", err)
        alert("Failed to delete admin.")
      }
    }
  }

  const handleStatusChange = async (row, newStatus) => {
    try {
      await apiService.updateAdmin({ id: row.id, status: newStatus })
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
      label: 'IDENTITY & ROLE', 
      render: (row) => {
        const name = row.values[0] || 'Unknown';
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const role = row.values[2] || 'Admin';
        return (
          <div className="flex items-center gap-4 py-2">
            <div className="w-12 h-12 rounded-[16px] bg-[#fff0f7] text-[#df3b91] flex items-center justify-center text-[12px] font-black tracking-wider border border-[#ffe0ef]">
              {initials}
            </div>
            <div className="flex flex-col gap-1.5 items-start">
              <strong className="text-[14px] font-black text-gray-900 tracking-tight">{name}</strong>
              <span className="bg-[#f0f5ff] text-[#0033cc] px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase">{role}</span>
            </div>
          </div>
        )
      } 
    },
    { key: 'col-1', label: 'EMAIL', render: (row) => <span className="text-[13px] text-gray-500 font-medium">{row.values[1] || '—'}</span> },
    { key: 'col-2', label: 'APP STATUS', render: (row) => <StatusToggle active={row.original.status !== false} onChange={(newStatus) => handleStatusChange(row, newStatus)} /> },
    {
      key: 'col-3',
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

  const [activeTab, setActiveTab] = useState('team')

  const permissionRoutes = [
    { id: 'admins', name: 'Admins', path: '/admins' },
    { id: 'app-users', name: 'App Users', path: '/users' },
    { id: 'categories', name: 'Categories', path: '/categories' },
    { id: 'certificate-templates', name: 'Certificate Templates', path: '/certificate-templates' },
    { id: 'certificates', name: 'Certificates', path: '/certificates' },
    { id: 'dashboard', name: 'Dashboard', path: '/dashboard' },
    { id: 'emission-factors', name: 'Emission Factors', path: '/emission-factors' },
    { id: 'matches', name: 'Matches', path: '/matches' },
    { id: 'nurseries', name: 'Nurseries', path: '/nurseries' },
    { id: 'occasions', name: 'Occasions', path: '/occasions' },
    { id: 'payments', name: 'Payments & Revenue', path: '/payments' },
    { id: 'plantation-inventory', name: 'Plantation Inventory', path: '/plantation-inventory' },
    { id: 'plantation-sites', name: 'Plantation Sites', path: '/plantation-site' },
    { id: 'settings', name: 'Settings', path: '/settings' },
    { id: 'species', name: 'Species', path: '/species' },
    { id: 'state-selection', name: 'State Selection', path: '/states' },
    { id: 'teams', name: 'Teams', path: '/teams' },
    { id: 'tournaments', name: 'Tournaments', path: '/tournaments' },
    { id: 'user-carbon', name: 'User Carbon Footprint', path: '/user-carbon' },
    { id: 'user-plantations', name: 'User Plantations', path: '/user-plantations' },
    { id: 'user-profile', name: 'User Profile', path: '/profile' }
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <PageHeader title={activeTab === 'team' ? "Team Members" : "Roles & Permissions"} description="Configure system-level administrative access and security." actionLabel={activeTab === 'team' ? "ADD ADMIN" : undefined} onAction={openCreate} />
      
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab('team')} className={`flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[11px] font-black tracking-widest uppercase transition-all border ${activeTab === 'team' ? 'bg-white text-[#244ea3] border-gray-100 shadow-sm' : 'text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-sm border-transparent hover:border-gray-100'}`}>
          <Icon name="users" size={15} /> TEAM MEMBERS
        </button>
        <button onClick={() => setActiveTab('roles')} className={`flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[11px] font-black tracking-widest uppercase transition-all border ${activeTab === 'roles' ? 'bg-white text-[#244ea3] border-gray-100 shadow-sm' : 'text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-sm border-transparent hover:border-gray-100'}`}>
          <Icon name="shield" size={15} /> ROLES & PERMISSIONS
        </button>
      </div>

      {activeTab === 'team' ? (
        <TableCard>
          <SearchBar placeholder="Search Team Members..." value={query} onChange={setQuery} />
          {loading ? (
            <div className="p-8 text-center text-gray-500 font-semibold">Loading...</div>
          ) : (
            <>
              <DataTable columns={columns} rows={filteredRows} />
              <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            </>
          )}
        </TableCard>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { name: 'SUPER ADMIN', count: 1, total: 21 },
              { name: 'FINANCE ADMIN', count: 2, total: 21 },
              { name: 'FIELD OFFICER', count: 2, total: 21 },
            ].map((role) => (
              <div key={role.name} className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex flex-col items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center shadow-sm">
                  <Icon name="shield" size={20} />
                </div>
                <div className="w-full">
                  <h4 className="m-0 text-[11px] font-black tracking-widest text-[#1e3a8a] uppercase mb-2">{role.name}</h4>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-[32px] font-black text-gray-900 leading-none">{role.count}</span>
                    <span className="text-[12px] font-medium text-gray-400">of {role.total} routes</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1e3a8a] rounded-full" style={{ width: `${(role.count/role.total)*100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="relative w-72">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center">
                <Icon name="search" size={16} />
              </div>
              <input type="text" placeholder="Filter routes..." className="w-full h-11 pl-11 pr-4 rounded-[12px] border border-gray-100 bg-white text-[13px] text-gray-900 focus:outline-none focus:border-[#244ea3] focus:ring-1 focus:ring-[#244ea3] shadow-sm transition-all" />
            </div>
            <button className="px-6 py-2.5 rounded-[12px] bg-gray-200 text-white text-[12px] font-black tracking-widest uppercase cursor-not-allowed">
              Save Permissions
            </button>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-8 py-6 text-[11px] font-black tracking-widest text-gray-400 uppercase w-1/3">Route / Module</th>
                  {['SUPER ADMIN', 'FINANCE ADMIN', 'FIELD OFFICER'].map(role => (
                    <th key={role} className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center shadow-sm">
                          <Icon name="shield" size={14} />
                        </div>
                        <span className="text-[10px] font-black tracking-widest text-[#1e3a8a] uppercase leading-tight">{role.split(' ')[0]}<br/>{role.split(' ')[1]}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionRoutes.map((route, i) => (
                  <tr key={route.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <strong className="block text-[14px] font-bold text-gray-900">{route.name}</strong>
                      <span className="block text-[11px] font-medium text-gray-400 font-mono mt-1">{route.path}</span>
                    </td>
                    {[0, 1, 2].map(colIdx => (
                      <td key={colIdx} className="px-6 py-5 text-center">
                        <button className="w-8 h-8 rounded-lg bg-[#fafafa] text-gray-300 border border-gray-100 flex items-center justify-center hover:bg-gray-100 hover:text-gray-400 transition-colors mx-auto">
                          <Icon name="shield-off" size={14} />
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-8 py-5 bg-white flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
                  <Icon name="shield" size={14} className="text-[#df3b91]" /> Has access
                </div>
                <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
                  <Icon name="shield-off" size={14} className="text-gray-300" /> No access
                </div>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
                 <Icon name="info" size={14} /> Click a cell to toggle access (Super Admin is always full access)
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <Modal
          title={editingId ? 'Edit Admin' : 'Register New Admin'}
          submitLabel={editingId ? 'SAVE CHANGES' : 'REGISTER ADMIN'}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={false}
        >
          <div className="grid grid-cols-1 gap-6">
            <Field label="Admin Name" required placeholder="Full Name" value={formValues[0]} onChange={(val) => setFormValues(c => ({...c, [0]: val}))} />
            <Field label="Email ID" required type="email" placeholder="admin@geotree.com" value={formValues[2]} onChange={(val) => setFormValues(c => ({...c, [2]: val}))} />
            <Field label="Password" type="password" placeholder={editingId ? "Leave blank to keep unchanged" : "Password"} value={formValues[3]} onChange={(val) => setFormValues(c => ({...c, [3]: val}))} />
            <Field label="System Role" required type="select" options={['admin', 'super admin', 'finance', 'field officer']} value={formValues[4]} onChange={(val) => setFormValues(c => ({...c, [4]: val}))} />
            <Field label="Status" type="select" options={['Active', 'Inactive']} value={formValues[5]} onChange={(val) => setFormValues(c => ({...c, [5]: val}))} />
          </div>
        </Modal>
      )}
    </>
  )
}
