import { useState, useEffect, useMemo } from 'react'
import { Badge, DataTable, PageHeader, SearchBar, TableCard, Tabs, Pagination } from '../components/ui'
import Icon from '../components/Icon'
import { apiService } from '../config/apiService'

export default function PaymentsPage() {
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [tab])

  useEffect(() => {
    fetchData()
  }, [page, tab])

  const fetchData = async () => {
    try {
      setLoading(true)
      const statusParam = tab === 'all' ? undefined : tab.charAt(0).toUpperCase() + tab.slice(1)
      const res = await apiService.getPayments({ page, limit: 10, status: statusParam })
      const dataList = res?.data?.data || res?.data || []
      
      if (res?.data?.pagination) {
        setTotalPages(res.data.pagination.pages || 1)
      } else if (res?.pagination) {
        setTotalPages(res.pagination.pages || 1)
      }

      const mappedRows = dataList.map(item => ({
        id: item._id,
        transaction_id: item.razorpay_payment_id || item._id,
        customer_name: item.user_name || "Unknown User",
        customer_mobile: item.user_mobile || "N/A",
        module: item.plantation_source || "General",
        amount: item.amount || 0,
        currency: item.currency || "INR",
        status: item.status || "Pending",
        original: item
      }))
      setRows(mappedRows)
    } catch (err) {
      console.error("Error fetching payments:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRows = useMemo(
    () => rows.filter((row) => `${row.transaction_id} ${row.customer_name} ${row.customer_mobile}`.toLowerCase().includes(query.toLowerCase())),
    [query, rows]
  )

  const columns = [
    { key: 'transaction_id', label: 'TRANSACTION ID', render: (row) => <strong className="text-[13px] font-bold text-gray-800">{row.transaction_id}</strong> },
    { key: 'customer', label: 'USER / CUSTOMER', render: (row) => <div className="flex flex-col"><strong className="text-[14px] font-bold text-gray-800">{row.customer_name}</strong><small className="text-[12px] font-semibold text-gray-400 mt-0.5">Mobile: {row.customer_mobile}</small></div> },
    { key: 'module', label: 'MODULE', render: (row) => <Badge>{row.module}</Badge> },
    { key: 'amount', label: 'AMOUNT', render: (row) => <strong className="text-[14px] font-black text-green-600">+{row.currency === 'INR' ? '₹' : row.currency} {row.amount}</strong> },
    { key: 'status', label: 'STATUS', render: (row) => {
        const isCompleted = row.status === 'Completed'
        const isCancelled = row.status === 'Cancelled'
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded-md border ${isCompleted ? 'text-green-700 bg-green-50 border-green-100' : isCancelled ? 'text-red-700 bg-red-50 border-red-100' : 'text-orange-700 bg-orange-50 border-orange-100'}`}>
            <i className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-green-500' : isCancelled ? 'bg-red-500' : 'bg-orange-500'}`} /> {row.status}
          </span>
        )
      } 
    },
    { key: 'actions', label: 'ACTIONS', render: () => <button className="w-8 h-8 grid place-items-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent" type="button"><Icon name="trash" size={18} /></button> },
  ]

  return (
    <>
      <PageHeader title="All Payments" description="Manage transactions, refunds, and financial reporting." />
      <Tabs items={[{ id: 'all', label: 'ALL PAYMENTS', icon: 'chart' }, { id: 'completed', label: 'COMPLETED', icon: 'check' }, { id: 'cancelled', label: 'CANCELLED', icon: 'x' }, { id: 'pending', label: 'PENDING', icon: 'clock' }]} active={tab} onChange={setTab} />
      <TableCard>
        <SearchBar placeholder={`Search ${tab === 'all' ? 'All Payments' : tab}...`} value={query} onChange={setQuery} showButton={true} />
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-semibold">Loading...</div>
        ) : (
          <>
            <DataTable columns={columns} rows={filteredRows} emptyText="No payments found" />
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </>
        )}
      </TableCard>
    </>
  )
}
