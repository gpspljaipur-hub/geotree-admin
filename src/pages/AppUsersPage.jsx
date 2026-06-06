import { useState, useEffect } from 'react'
import { Avatar, DataTable, EntityCell, PageHeader, SearchBar, StatusToggle, TableCard, Pagination } from '../components/ui'
import { apiService } from '../config/apiService'

export default function AppUsersPage() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [page])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // Passing role: 'user' to get App Users instead of Admins
      const res = await apiService.getAdmins({ page, limit: 10, role: 'user' })
      const dataList = res?.data?.data || res?.data || []
      
      if (res?.data?.pagination) {
        setTotalPages(res.data.pagination.pages || 1)
      } else if (res?.pagination) {
        setTotalPages(res.pagination.pages || 1)
      }

      setUsers(dataList.map(u => ({
        id: u._id || u.id,
        name: u.name || '?',
        phone: u.mobile || u.phone || '—',
        email: u.email || '—',
        status: u.status !== 'inactive',
        session: u.last_login ? new Date(u.last_login).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
        original: u
      })))
    } catch (err) {
      console.error("Error fetching app users:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const user = users.find(u => u.id === userId);
      await apiService.updateAdmin({
        id: userId,
        status: newStatus ? 'active' : 'inactive',
        role: user.original.role || 'user'
      })
      // Update local state without full reload
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u))
    } catch (err) {
      console.error("Error updating user status:", err)
      alert("Failed to update app user status.")
    }
  }

  const rows = users.filter((user) => `${user.name} ${user.phone} ${user.email}`.toLowerCase().includes(query.toLowerCase()))
  
  const columns = [
    { key: 'identity', label: 'USER IDENTITY', render: (row) => row.name === '?' ? <div className="flex items-center gap-4"><Avatar /><strong className="text-pink text-[14px] font-bold">{row.phone}</strong></div> : <EntityCell title={row.name} subtitle={row.phone} /> },
    { key: 'email', label: 'EMAIL' },
    { key: 'status', label: 'APP STATUS', render: (row) => <StatusToggle checked={row.status} onChange={(val) => handleStatusChange(row.id, val)} /> },
    { key: 'session', label: 'LAST SESSION', render: (row) => <span className="text-gray-500 font-medium text-[13px]">{row.session}</span> },
  ]
  
  return (
    <>
      <PageHeader title="App Users" description="Manage system access and details for all app users." />
      <TableCard>
        <SearchBar placeholder="Search App Users..." value={query} onChange={setQuery} showButton={true} />
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-semibold">Loading App Users...</div>
        ) : (
          <>
            <DataTable columns={columns} rows={rows} emptyText="No app users found" />
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </>
        )}
      </TableCard>
    </>
  )
}
