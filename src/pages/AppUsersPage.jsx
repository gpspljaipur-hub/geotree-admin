import { useState } from 'react'
import { Avatar, DataTable, EntityCell, PageHeader, SearchBar, StatusToggle, TableCard } from '../components/ui'

const users = [
  { id: 1, name: '?', phone: '8523698555', email: '—', session: '01 Jun 2026, 16:21' },
  { id: 2, name: 'Adit', phone: '9462610444', email: 'aditsharma444@gmaip.com', session: '01 Jun 2026, 12:20' },
  { id: 3, name: '?', phone: '9797946464', email: '—', session: '30 May 2026, 16:29' },
  { id: 4, name: '?', phone: '8547896325', email: '—', session: '30 May 2026, 16:26' },
  { id: 5, name: '?', phone: '9461827695', email: '—', session: '30 May 2026, 16:18' },
  { id: 6, name: '?', phone: '5896325874', email: '—', session: '30 May 2026, 16:14' },
]

export default function AppUsersPage() {
  const [query, setQuery] = useState('')
  const rows = users.filter((user) => `${user.name} ${user.phone} ${user.email}`.toLowerCase().includes(query.toLowerCase()))
  const columns = [
    { key: 'identity', label: 'USER IDENTITY', render: (row) => row.name === '?' ? <div className="flex items-center gap-4"><Avatar /><strong className="text-pink text-[14px] font-bold">{row.phone}</strong></div> : <EntityCell title={row.name} subtitle={row.phone} /> },
    { key: 'email', label: 'EMAIL' },
    { key: 'status', label: 'APP STATUS', render: () => <StatusToggle /> },
    { key: 'session', label: 'SESSION' },
  ]
  return (
    <>
      <PageHeader title="App Users" description="Manage system access and details for all app users." />
      <TableCard><SearchBar placeholder="Search App Users..." value={query} onChange={setQuery} /><DataTable columns={columns} rows={rows} /></TableCard>
    </>
  )
}
