import { useMemo, useState, useEffect } from 'react'
import Icon from '../components/Icon'
import { Actions, Badge, DataTable, Field, Modal, PageHeader, SearchBar, StatusToggle, TableCard, Pagination } from '../components/ui'
import { apiService } from '../config/apiService'
import { API_CONFIG } from '../config/endpoints'

export default function MatchesPage() {
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [teams, setTeams] = useState([])
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
      const [res, toursRes, teamsRes] = await Promise.all([
        apiService.getMatches({ page, limit: 10 }),
        apiService.getTournaments({ page: 1, limit: 100 }),
        apiService.getTeams({ page: 1, limit: 100 })
      ])
      
      if (res?.pagination) setTotalPages(res.pagination.pages || 1)
      const dataList = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
      
      setTournaments(toursRes?.data?.data || toursRes?.data || [])
      setTeams(teamsRes?.data?.data || teamsRes?.data || [])
      
      const mappedRows = dataList.map((st, index) => ({
        id: st._id || st.id || `MatchesPage-${index}`,
        values: [
          st.tournament_id?.short_name || "—",
          st.team1_id?.team_short_name || "—",
          st.team2_id?.team_short_name || "—",
          st.venue || "—",
          st.match_status || "—"
        ],
        original: st
      }))
      setRows(mappedRows)
    } catch (err) {
      console.error("Error fetching matches:", err)
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
      0: tournaments.length > 0 ? tournaments[0]._id : '',
      1: teams.length > 0 ? teams[0]._id : '',
      2: teams.length > 1 ? teams[1]._id : '',
      3: '',
      4: 'Upcoming',
      5: '',
      6: '',
      7: '0',
      8: '0',
      9: '0',
      10: 'Active'
    })
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    const st = row.original
    setFormValues({
      0: st.tournament_id?._id || st.tournament_id || (tournaments.length > 0 ? tournaments[0]._id : ''),
      1: st.team1_id?._id || st.team1_id || (teams.length > 0 ? teams[0]._id : ''),
      2: st.team2_id?._id || st.team2_id || (teams.length > 1 ? teams[1]._id : ''),
      3: st.venue || '',
      4: st.match_status || 'Upcoming',
      5: st.match_date ? st.match_date.split('T')[0] : '',
      6: st.match_time || '',
      7: String(st.total_dot_balls || 0),
      8: String(st.team1_dotball || st.team1_initial_dotball || 0),
      9: String(st.team2_dotball || st.team2_initial_dotball || 0),
      10: st.status !== false ? 'Active' : 'Inactive'
    })
    setModalOpen(true)
  }

  const saveRecord = async () => {
    try {
      const payload = {
        tournament_id: formValues[0],
        team1_id: formValues[1],
        team2_id: formValues[2],
        venue: formValues[3],
        match_status: formValues[4],
        match_date: formValues[5],
        match_time: formValues[6],
        match_type: "League", // Hardcoded for now based on postman examples
        team1_dotball: Number(formValues[8]) || 0,
        team2_dotball: Number(formValues[9]) || 0,
        status: formValues[10] === 'Active'
      }

      if (editingId) {
        payload.id = editingId
        await apiService.updateMatch(payload)
      } else {
        await apiService.addMatch(payload)
      }

      setModalOpen(false)
      fetchData()
    } catch (err) {
      console.error("Error saving match:", err)
      alert("Failed to save match.")
    }
  }

  const handleDelete = async (row) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      try {
        await apiService.deleteMatch({ id: row.id })
        fetchData()
      } catch (err) {
        console.error("Error deleting match:", err)
        alert("Failed to delete match.")
      }
    }
  }

  const handleStatusChange = async (row, newStatus) => {
    try {
      await apiService.updateMatch({ id: row.id, status: newStatus })
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
      label: 'MATCH DETAILS',
      render: (row) => (
        <div className="flex flex-col gap-4 py-2">
          <div><span className="bg-pink-50 text-pink text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest">{row.original.tournament_id?.short_name || '—'}</span></div>
          <div className="flex items-center gap-6 max-w-max">
            <div className="flex items-center gap-3 w-[100px]">
              {row.original.team1_id?.team_logo ? <img src={`${API_CONFIG.IMAGE_URL}${row.original.team1_id.team_logo}`} className="w-10 h-10 rounded-lg object-contain bg-white border border-gray-100 p-1" alt={row.original.team1_id.team_short_name} /> : <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200" />}
              <b className="text-[14px] font-black tracking-wider text-gray-900">{row.original.team1_id?.team_short_name || 'T1'}</b>
            </div>
            
            <span className="text-[9px] font-black text-pink bg-pink-50 w-6 h-6 flex items-center justify-center rounded-full shadow-sm">VS</span>
            
            <div className="flex items-center gap-3 w-[100px]">
              {row.original.team2_id?.team_logo ? <img src={`${API_CONFIG.IMAGE_URL}${row.original.team2_id.team_logo}`} className="w-10 h-10 rounded-lg object-contain bg-white border border-gray-100 p-1" alt={row.original.team2_id.team_short_name} /> : <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200" />}
              <b className="text-[14px] font-black tracking-wider text-gray-900">{row.original.team2_id?.team_short_name || 'T2'}</b>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'col-1',
      label: 'SCHEDULE & VENUE',
      render: (row) => {
        const dateStr = row.original.match_date ? new Date(row.original.match_date).toLocaleDateString('en-US') : '—'
        return (
          <div className="flex flex-col gap-2.5 py-2">
            <strong className="flex items-center gap-2 text-[12px] font-bold text-gray-900"><Icon name="calendar" size={15} className="text-pink" />{dateStr}</strong>
            <span className="flex items-center gap-2 text-[12px] font-semibold text-gray-400"><Icon name="clock" size={15} />{row.original.match_time || '—'}</span>
            <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-[#0033cc]"><Icon name="pulse" size={14} />{row.original.match_status || '—'}</span>
            <span className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 mt-1"><Icon name="pin" size={15} className="text-[#3da9ef]" />{row.original.venue || '—'}</span>
          </div>
        )
      }
    },
    {
      key: 'col-2',
      label: 'INITIAL DOT BALLS',
      render: (row) => {
        const t1 = row.original.team1_initial_dotball || 0
        const t2 = row.original.team2_initial_dotball || 0
        const total = t1 + t2
        return (
          <div className="flex flex-col gap-3 items-start py-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f5ff] text-[#0033cc] rounded-lg text-[10px] font-black tracking-widest uppercase"><Icon name="pulse" size={14}/> TOTAL: {total}</span>
            <div className="flex flex-col gap-1.5 w-[100px] pl-1">
              <div className="flex justify-between items-center w-full">
                <span className="text-[9px] font-black tracking-widest text-gray-400">{row.original.team1_id?.team_short_name || 'T1'}</span>
                <span className="text-[11px] font-black text-gray-900">{t1}</span>
              </div>
              <div className="flex justify-between items-center w-full">
                <span className="text-[9px] font-black tracking-widest text-gray-400">{row.original.team2_id?.team_short_name || 'T2'}</span>
                <span className="text-[11px] font-black text-gray-900">{t2}</span>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'col-3',
      label: 'CONVERSION & PLANTED',
      render: (row) => {
        const t1_name = row.original.team1_id?.team_short_name || 'T1'
        const t2_name = row.original.team2_id?.team_short_name || 'T2'
        const t1_rem = row.original.team1_dotball || 0
        const t2_rem = row.original.team2_dotball || 0
        const t1_plant = row.original.team1_trees || 0
        const t2_plant = row.original.team2_trees || 0

        return (
          <div className="flex flex-col gap-3.5 py-2">
            <div className="flex items-center gap-4 w-[240px]">
              <span className="text-[10px] font-black text-[#0033cc] w-8">{t1_name}</span>
              <span className="bg-orange-50 text-orange-500 px-2 py-1 rounded text-[9px] tracking-widest uppercase font-black">Rem: {t1_rem}</span>
              <span className="bg-pink-50 text-pink px-2 py-1 rounded text-[9px] tracking-widest uppercase font-black">Planted: {t1_plant}</span>
            </div>
            <div className="flex items-center gap-4 w-[240px]">
              <span className="text-[10px] font-black text-[#0033cc] w-8">{t2_name}</span>
              <span className="bg-orange-50 text-orange-500 px-2 py-1 rounded text-[9px] tracking-widest uppercase font-black">Rem: {t2_rem}</span>
              <span className="bg-pink-50 text-pink px-2 py-1 rounded text-[9px] tracking-widest uppercase font-black">Planted: {t2_plant}</span>
            </div>
          </div>
        )
      }
    },
    { key: 'col-4', label: 'STATUS', render: (row) => <StatusToggle active={row.original.status !== false} onChange={(newStatus) => handleStatusChange(row, newStatus)} /> },
    {
      key: 'col-5',
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

  const tournamentOptions = tournaments.map(t => ({ label: t.name, value: t._id }))
  const teamOptions = teams.map(t => ({ label: t.team_name, value: t._id }))

  return (
    <>
      <PageHeader title="Matches" description="Schedule matches and record green ball statistics" actionLabel="ADD MATCH" onAction={openCreate} />
      <TableCard>
        <SearchBar placeholder="Search Matches..." value={query} onChange={setQuery} />
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
        <Modal title={editingId ? "Edit Match" : "Register New Match"} submitLabel={editingId ? "SAVE CHANGES" : "REGISTER MATCH"} onClose={() => setModalOpen(false)} onSubmit={saveRecord}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Tournament" required type="select" placeholder="Select Tournament" options={tournamentOptions} value={formValues[0]} onChange={(val) => setFormValues(c => ({...c, [0]: val}))} />
            <Field label="Team 1" required type="select" placeholder="Select Team 1" options={teamOptions} value={formValues[1]} onChange={(val) => setFormValues(c => ({...c, [1]: val}))} />
            
            <Field label="Team 2" required type="select" placeholder="Select Team 2" options={teamOptions} value={formValues[2]} onChange={(val) => setFormValues(c => ({...c, [2]: val}))} />
            <Field label="Match Date" required type="date" value={formValues[5]} onChange={(val) => setFormValues(c => ({...c, [5]: val}))} />
            
            <Field label="Match Time" required type="time" value={formValues[6]} onChange={(val) => setFormValues(c => ({...c, [6]: val}))} />
            <Field label="Match Stage" type="select" options={['upcoming', 'live', 'completed']} value={formValues[4]} onChange={(val) => setFormValues(c => ({...c, [4]: val}))} />
            
            <Field label="Venue / Stadium" required placeholder="e.g. Wankhede Stadium" full value={formValues[3]} onChange={(val) => setFormValues(c => ({...c, [3]: val}))} />
            
            <Field label="Team 1 Dot Balls" type="number" value={formValues[8]} onChange={(val) => setFormValues(c => ({...c, [8]: val}))} />
            <Field label="Team 2 Dot Balls" type="number" value={formValues[9]} onChange={(val) => setFormValues(c => ({...c, [9]: val}))} />
            
            <Field label="Status" type="select" options={['Active', 'Inactive']} value={formValues[10]} onChange={(val) => setFormValues(c => ({...c, [10]: val}))} />
          </div>
        </Modal>
      )}
    </>
  )
}
