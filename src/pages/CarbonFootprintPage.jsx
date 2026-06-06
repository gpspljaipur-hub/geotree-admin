import { useState, useEffect, useMemo } from 'react'
import { Badge, DataTable, PageHeader, SearchBar, TableCard, Pagination } from '../components/ui'
import { apiService } from '../config/apiService'

export default function CarbonFootprintPage() {
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchData()
  }, [page])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await apiService.getCarbonFootprints({ page, limit: 10 })
      const dataList = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
      
      if (res?.data?.meta) {
        setTotalPages(res.data.meta.pages || 1)
      } else if (res?.meta) {
        setTotalPages(res.meta.pages || 1)
      } else if (res?.pagination) {
        setTotalPages(res.pagination.pages || 1)
      }

      const mappedRows = dataList.map((st) => {
        const userName = st.user_id?.name || st.user_id?.first_name || "";
        const userMobile = st.user_id?.mobile || "";
        const userIdentity = userName ? `${userName} · ${userMobile}` : userMobile || "Unknown User";

        const recs = st.species_recommendations?.map(r => `${r.count}x ${r.name}`) || [];

        return {
          id: st._id || Math.random().toString(),
          user: userIdentity,
          emissions: st.total_tonnes?.toString() || "0",
          transport: st.breakdown?.transport?.toString() || "0",
          energy: st.breakdown?.energy?.toString() || "0",
          food: st.breakdown?.food?.toString() || "0",
          waste: st.breakdown?.waste?.toString() || "0",
          rec: recs,
          original: st
        }
      })
      setRows(mappedRows)
    } catch (err) {
      console.error("Error fetching footprints:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRows = useMemo(
    () => rows.filter((row) => String(row.user || '').toLowerCase().includes(query.toLowerCase())),
    [query, rows]
  )

  const columns = [
    { key: 'user', label: 'USER IDENTITY' },
    { key: 'emissions', label: 'EMISSIONS OVERVIEW (TONNES CO2E)', render: (row) => <strong className="text-pink text-[14px] font-black">{row.emissions}</strong> },
    { key: 'breakdown', label: 'FOOTPRINT BREAKDOWN (KG)', render: (row) => <div className="flex flex-col gap-1.5"><span className="text-[10px] font-bold tracking-widest text-gray-500 flex justify-between w-[160px]">TRANSPORT <b className="text-gray-900">{parseFloat(row.transport).toFixed(1)}</b></span><span className="text-[10px] font-bold tracking-widest text-gray-500 flex justify-between w-[160px]">ENERGY <b className="text-gray-900">{parseFloat(row.energy).toFixed(1)}</b></span><span className="text-[10px] font-bold tracking-widest text-gray-500 flex justify-between w-[160px]">FOOD <b className="text-gray-900">{parseFloat(row.food).toFixed(1)}</b></span><span className="text-[10px] font-bold tracking-widest text-gray-500 flex justify-between w-[160px]">WASTE <b className="text-gray-900">{parseFloat(row.waste).toFixed(1)}</b></span></div> },
    { key: 'recommendations', label: 'RECOMMENDATIONS', render: (row) => <div className="flex flex-wrap gap-2 max-w-[200px]">{row.rec.map((item) => <Badge tone="pink" key={item}>{item}</Badge>)}</div> },
  ]

  return (
    <>
      <PageHeader title="User Carbon Footprint" description="Analyze and track individual user carbon emission data." />
      <TableCard>
        <SearchBar placeholder="Search by user or period..." value={query} onChange={setQuery} />
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-semibold">Loading...</div>
        ) : (
          <>
            <DataTable columns={columns} rows={filteredRows} />
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </>
        )}
      </TableCard>
    </>
  )
}
