import { useState, useEffect, useMemo } from 'react'
import { DataTable, PageHeader, SearchBar, TableCard, Pagination } from '../components/ui'
import { apiService } from '../config/apiService'

export default function PlantationInventoryPage() {
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchData()
  }, [page])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await apiService.getSiteInventory({ page, limit: 10 })
      const dataList = res?.data?.data || res?.data || []
      
      if (res?.data?.pagination) {
        setTotalPages(res.data.pagination.pages || 1)
      } else if (res?.pagination) {
        setTotalPages(res.pagination.pages || 1)
      }

      const mappedRows = dataList.map((item, index) => {
        const site = item.site_info || {}
        const inv = item.inventory || []
        
        let ordered = 0
        let planted = 0
        let remaining = 0
        
        const speciesStrs = inv.map(sp => {
          ordered += sp.ordered_count || 0
          planted += sp.planted_count || 0
          remaining += sp.remaining_count || 0
          return `${sp.species_name} ${sp.ordered_count || 0}`
        })
        
        return {
          id: site._id || index,
          site: site.site_name || "Unknown Site",
          location: `${site.district || ''}, ${site.state_name || ''}`.replace(/^, |, $/g, '') || "Unknown Location",
          species: speciesStrs.length > 0 ? speciesStrs.join(' · ') : "No species",
          ordered,
          planted,
          remaining,
          capacity: site.capacity || "Unlimited",
          original: item
        }
      })
      
      setRows(mappedRows)
    } catch (err) {
      console.error("Error fetching plantation inventory:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRows = useMemo(
    () => rows.filter((row) => row.site.toLowerCase().includes(query.toLowerCase())),
    [query, rows]
  )

  const columns = [
    { key: 'site', label: 'SITE OVERVIEW', render: (row) => <div className="flex flex-col"><strong className="text-[14px] font-bold text-gray-800">{row.site}</strong><small className="text-[11px] font-[800] uppercase tracking-wider text-gray-400 mt-1">⌖ {row.location}</small></div> },
    { key: 'species', label: 'SPECIES & QUANTITIES', render: (row) => <span className="inline-block px-3 py-1.5 bg-gray-100 text-gray-700 text-[11px] font-bold tracking-wider rounded-lg uppercase">{row.species}</span> },
    { key: 'progress', label: 'ORDERING PROGRESS', render: (row) => {
      const isUnlimited = row.capacity === 'Unlimited'
      const capNum = isUnlimited ? row.ordered : parseInt(row.capacity, 10) || 1
      const pct = Math.min(100, (row.ordered / capNum) * 100) || 0
      return (
        <div className="flex flex-col w-[200px]">
          <strong className="flex justify-between items-center text-[10px] font-black tracking-widest text-gray-500 uppercase mb-2">ORDERED <span className="text-[11px] text-gray-900">{row.ordered} / {row.capacity}</span></strong>
          <i className="w-full h-2 bg-gray-100 rounded-full overflow-hidden block">
            <b className={`h-full block rounded-full ${isUnlimited ? 'bg-blue-400' : 'bg-pink'}`} style={{ width: isUnlimited ? '100%' : `${pct}%` }} />
          </i>
        </div>
      )
    }},
    { key: 'fulfillment', label: 'SITE FULFILLMENT', render: (row) => <div className="flex items-center gap-6"><span className="flex flex-col"><span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-1">PLANTED</span><b className="text-[14px] font-black text-gray-800">{row.planted}</b></span><span className="flex flex-col"><span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-1">REMAINING</span><b className="text-[14px] font-black text-gray-800">{row.remaining}</b></span></div> },
  ]

  return (
    <>
      <PageHeader title="Plantation Inventory" description="Comprehensive report of tree species distribution and order status across all sites." />
      <TableCard>
        <SearchBar placeholder="Search Plantation Inventory..." value={query} onChange={setQuery} showButton={true} />
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-semibold">Loading...</div>
        ) : (
          <>
            <DataTable columns={columns} rows={filteredRows} emptyText="No inventory records found" />
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </>
        )}
      </TableCard>
    </>
  )
}
