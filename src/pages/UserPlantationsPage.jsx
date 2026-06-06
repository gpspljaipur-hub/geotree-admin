import { useState, useEffect, useMemo } from 'react'
import Icon from '../components/Icon'
import { Badge, DataTable, PageHeader, SearchBar, TableCard, Tabs, Pagination, Modal, Field } from '../components/ui'
import { apiService } from '../config/apiService'

const tabItems = [
  { id: 'occasion', label: 'OCCASION PLANTATIONS', icon: 'heart' },
  { id: 'match', label: 'MATCH DOT BALL PLANTATIONS', icon: 'trophy' },
  { id: 'team', label: 'TEAM SUPPORT PLANTATIONS', icon: 'users' },
  { id: 'carbon', label: 'CARBON OFFSET PLANTATIONS', icon: 'pulse' },
]

export default function UserPlantationsPage() {
  const [tab, setTab] = useState('occasion')
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
    if (tab !== 'occasion' && tab !== 'match' && tab !== 'team' && tab !== 'carbon') {
      setRows([])
      setTotalPages(1)
      return
    }

    try {
      setLoading(true)
      const fetchFn = tab === 'carbon' ? apiService.getCarbonPlantations : (tab === 'team' ? apiService.getTeamPlantations : (tab === 'match' ? apiService.getMatchPlantations : apiService.getOccasionPlantations))
      const res = await fetchFn({ page, limit: 10 })
      const dataList = res?.data?.data || res?.data || []
      
      if (res?.data?.pagination) {
        setTotalPages(res.data.pagination.pages || 1)
      } else if (res?.pagination) {
        setTotalPages(res.pagination.pages || 1)
      }

      const mappedRows = dataList.map(st => {
        const plant = st.plants?.[0] || {}
        const matchName = st.match_name || st.ipl_support?.match_details?.name || "Match"
        const tournamentName = st.tournament_id?.short_name || st.tournament_id?.name || "Tournament"
        return {
          id: st._id,
          user: st.name || st.user_id?.name || "Unknown User",
          phone: st.mobile || st.user_id?.mobile || "N/A",
          occasion: st.occasion_name || st.occasion_id?.name || "Occasion",
          match_name: matchName,
          team_name: st.team_name || st.ipl_support?.team_name || "Team",
          tournament_name: tournamentName,
          carbon_period: st.carbon_id?.period || "Annual",
          carbon_tonnes: st.carbon_id?.total_tonnes || 0,
          dot_balls: st.trees_count || plant.quantity || 0,
          site: `${st.site_name || 'Unknown Site'}, ${st.state_name || 'N/A'}`,
          tree: `${plant.plant_name || 'Tree'} (${plant.tree_height || 'N/A'})`,
          qty: st.trees_count || plant.quantity || 1,
          price: st.amount || plant.price || 0,
          carbon: st.carbon_offset_kg || 0,
          status: st.plantation_status || "Pending",
          planted: st.planted_trees || st.planted_count || 0,
          remaining: st.remaining_trees || 0,
          original: st
        }
      })
      setRows(mappedRows)
    } catch (err) {
      console.error("Error fetching plantations:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRows = useMemo(
    () => rows.filter((row) => `${row.user} ${row.occasion} ${row.site}`.toLowerCase().includes(query.toLowerCase())),
    [query, rows]
  )

  const occasionColumns = [
    { key: 'user', label: 'USER PROFILE', render: (row) => <div className="flex flex-col"><strong className="text-[14px] font-bold text-gray-800">{row.user}</strong><small className="text-[12px] font-semibold text-gray-400 mt-0.5">Mobile: {row.phone}</small></div> },
    { key: 'occasion', label: 'OCCASION DETAILS', render: (row) => <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink/5 text-[#df3b91] rounded-[10px] text-[12px] font-bold uppercase tracking-wider"><Icon name="heart" size={17} />{row.occasion}</span> },
    { key: 'plantation', label: 'PLANTATION', render: (row) => <div className="flex flex-col gap-1.5"><small className="flex items-center gap-1.5 text-[11px] font-[800] uppercase tracking-wider text-gray-500"><Icon name="pin" size={13} />{row.site}</small><strong className="text-[13px] font-bold text-gray-900 flex items-center gap-2">{row.tree}<span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">Qty: {row.qty}</span></strong><div className="flex items-center gap-2 mt-1"><Badge tone="blue">₹{row.price}</Badge><Badge tone="pink">{row.carbon} kg CO2e</Badge></div></div> },
    { key: 'status', label: 'STATUS', render: (row) => <div className="flex flex-col"><strong className="flex items-center gap-2 text-[12px] font-bold text-gray-800 uppercase tracking-widest"><i className={`w-2 h-2 rounded-full ${row.status === 'Completed' || row.status === 'Planted' ? 'bg-green-500 shadow-[0_0_0_3px_#22c55e33]' : 'bg-orange-400 shadow-[0_0_0_3px_#fb923c33]'}`} />{row.status}</strong><small className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mt-1">PLANTED: {row.planted} &nbsp;|&nbsp; REM: {row.remaining}</small></div> },
    { key: 'actions', label: 'ACTIONS', render: (row) => row.original?.certificate_issued ? <button className="inline-flex items-center gap-2 h-9 px-4 bg-[#fff0f7] border border-[#ffe0ef] rounded-[10px] text-[11px] font-extrabold tracking-widest text-[#df3b91] uppercase hover:bg-pink-100 transition-colors cursor-pointer" type="button"><Icon name="eye" size={16} /> VIEW</button> : <button className="inline-flex items-center gap-2 h-9 px-4 bg-blue-50 border border-blue-100 rounded-[10px] text-[11px] font-extrabold tracking-widest text-blue-700 uppercase hover:bg-blue-100 transition-colors cursor-pointer" type="button" onClick={() => handleIssueClick(row)}><Icon name="certificate" size={16} /> ISSUE</button> },
  ]

  const matchColumns = [
    { key: 'user', label: 'USER PROFILE', render: (row) => <div className="flex flex-col"><strong className="text-[14px] font-bold text-gray-800">{row.user}</strong><small className="text-[12px] font-semibold text-gray-400 mt-0.5">Mobile: {row.phone}</small></div> },
    { key: 'match', label: 'MATCH DETAILS', render: (row) => <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-[10px] text-[12px] font-bold uppercase tracking-wider"><Icon name="trophy" size={17} />{row.match_name || 'Match'}</span> },
    { key: 'dotballs', label: 'DOT BALLS / TREES', render: (row) => <div className="flex items-center gap-2"><strong className="text-[14px] font-black text-gray-800">{row.dot_balls || 0} Balls</strong><span className="text-gray-300">/</span><span className="text-[12px] font-bold text-[#df3b91]">{row.qty} Trees</span></div> },
    { key: 'plantation', label: 'PLANTATION', render: occasionColumns[2].render },
    { key: 'status', label: 'STATUS', render: occasionColumns[3].render },
    { key: 'actions', label: 'ACTIONS', render: occasionColumns[4].render },
  ]

  const teamColumns = [
    { key: 'user', label: 'USER PROFILE', render: occasionColumns[0].render },
    { key: 'team', label: 'TEAM SUPPORT', render: (row) => <div className="flex flex-col"><strong className="text-[13px] font-black text-[#df3b91] uppercase tracking-wide">{row.team_name}</strong><small className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mt-1 uppercase"><Icon name="trophy" size={12} />{row.tournament_name}</small></div> },
    { key: 'plantation', label: 'PLANTATION', render: occasionColumns[2].render },
    { key: 'status', label: 'STATUS', render: occasionColumns[3].render },
    { key: 'actions', label: 'ACTIONS', render: occasionColumns[4].render },
  ]

  const carbonColumns = [
    { key: 'user', label: 'USER PROFILE', render: occasionColumns[0].render },
    { key: 'carbon', label: 'OFFSET REQUEST', render: (row) => <div className="flex flex-col"><strong className="text-[13px] font-black text-[#df3b91] tracking-wider uppercase">{row.carbon_tonnes} TONNES CO2E</strong><small className="text-[11px] font-bold text-gray-500 mt-0.5">Period: {row.carbon_period}</small></div> },
    { key: 'plantation', label: 'PLANTATION CONTRIBUTION', render: (row) => <div className="flex flex-col gap-1.5"><small className="flex items-center gap-1.5 text-[11px] font-[800] uppercase tracking-wider text-gray-500"><Icon name="pin" size={13} />{row.site}</small><strong className="text-[13px] font-bold text-gray-900 flex items-center gap-2">{row.tree}<span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">Qty: {row.qty}</span></strong><div className="flex items-center gap-2 mt-1"><Badge tone="gray">₹{row.price}</Badge><Badge tone="blue">{row.carbon} kg CO2e</Badge></div></div> },
    { key: 'status', label: 'STATUS', render: occasionColumns[3].render },
    { key: 'actions', label: 'ACTIONS', render: occasionColumns[4].render },
  ]
  
  const columns = tab === 'occasion' ? occasionColumns : (tab === 'match' ? matchColumns : (tab === 'team' ? teamColumns : (tab === 'carbon' ? carbonColumns : occasionColumns)))

  const [issueModalOpen, setIssueModalOpen] = useState(false)
  const [issueRow, setIssueRow] = useState(null)

  const handleIssueClick = (row) => {
    setIssueRow(row)
    setIssueModalOpen(true)
  }

  const activeTabLabel = tabItems.find(t => t.id === tab)?.label || 'User Plantations'
  const pageTitle = activeTabLabel.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')

  return (
    <>
      <PageHeader title={pageTitle} description="Centralized monitoring system for multi-channel plantation initiatives." />
      <Tabs items={tabItems} active={tab} onChange={setTab} />
      <TableCard>
        <SearchBar placeholder={`Search ${activeTabLabel} ...`} value={query} onChange={setQuery} showButton={true} />
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-semibold">Loading...</div>
        ) : tab !== 'occasion' && tab !== 'match' && tab !== 'team' && tab !== 'carbon' ? (
          <div className="p-8 text-center text-gray-400 font-semibold">API integration pending for this module.</div>
        ) : (
          <>
            <DataTable columns={columns} rows={filteredRows} emptyText="No data available" />
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </>
        )}
      </TableCard>
      
      {issueModalOpen && issueRow && (
        <Modal
          title="Register New Certificate"
          submitLabel="REGISTER CERTIFICATE"
          buttonTone="pink"
          onClose={() => setIssueModalOpen(false)}
          onSubmit={() => setIssueModalOpen(false)}
        >
          <div className="flex flex-col gap-6">
            <Field 
              label="SELECT USER" 
              type="select" 
              required 
              options={[`${issueRow.user} - ${issueRow.phone}`]} 
              value={`${issueRow.user} - ${issueRow.phone}`} 
            />
            <Field 
              label="SELECT PLANTATION ORDER" 
              type="select" 
              required 
              options={[`${issueRow.qty} Trees at ${issueRow.site.split(',')[0]} (6/1/2026)`]} 
              value={`${issueRow.qty} Trees at ${issueRow.site.split(',')[0]} (6/1/2026)`} 
            />
            <Field 
              label="CERTIFICATE CATEGORY (OPTIONAL - AUTO-DETECTED)" 
              type="select" 
              options={['Occasion / Event']} 
              value="Occasion / Event" 
            />
          </div>
        </Modal>
      )}
    </>
  )
}
