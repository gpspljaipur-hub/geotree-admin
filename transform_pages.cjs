const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages');

const mapping = {
  'PlantationSitesPage.jsx': { api: 'getPlantationSites', cols: ['st.site_name || "Unnamed"', '[st.district, st.state].filter(Boolean).join(", ") || "—"'] },
  'SpeciesPage.jsx': { api: 'getSpecies', cols: ['st.species_name || st.name || "Unnamed"', 'st.scientific_name || "—"', 'st.sequestration ? `${st.sequestration} KGS/YEAR` : "—"', 'st.maturity_period || "—"'] },
  'CategoriesPage.jsx': { api: 'getCategories', cols: ['st.category_name || st.name || "Unnamed"', 'st.description || "—"', 'st.category_type || "—"'] },
  'OccasionsPage.jsx': { api: 'getOccasions', cols: ['st.occasion_name || st.title || "Unnamed"', 'st.description || "—"', 'st.date || "—"'] },
  'TournamentsPage.jsx': { api: 'getTournaments', cols: ['st.tournament_name || st.name || "Unnamed"', 'st.season || "—"', 'st.description || "—"'] },
  'TeamsPage.jsx': { api: 'getTeams', cols: ['st.team_name || st.name || "Unnamed"', 'st.captain || "—"', 'st.home_ground || "—"', 'st.owner || "—"'] },
  'NurseriesPage.jsx': { api: 'getNurseries', cols: ['st.nursery_name || st.name || "Unnamed"', 'st.location || "—"', 'st.capacity || "—"', 'st.owner_name || "—"'] },
  'AdminsPage.jsx': { api: 'getAdmins', cols: ['st.name || st.first_name || "Unnamed"', 'st.email || "—"', 'st.role || "—"'] },
  'EmissionFactorsPage.jsx': { api: 'getEmissionFactors', cols: ['st.factor_name || st.name || "Unnamed"', 'st.unit || "—"', 'st.value || "—"', 'st.source || "—"'] }
};

for (const [file, info] of Object.entries(mapping)) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip StateSelectionPage if it is somehow here
  if (file === 'StateSelectionPage.jsx') continue;

  // Fix imports
  if (!content.includes('Pagination')) {
    content = content.replace(/import {([^}]+)} from '\.\.\/components\/ui'/, "import {$1, Pagination } from '../components/ui'");
  }
  if (!content.includes('apiService')) {
    content = content.replace(/from '\.\.\/components\/ui'/, "from '../components/ui'\nimport { apiService } from '../config/apiService'");
  }
  if (!content.includes('useEffect')) {
    content = content.replace(/import { useMemo, useState } from 'react'/, "import { useMemo, useState, useEffect } from 'react'");
  }

  // Remove initialRows
  content = content.replace(/const initialRows = \[.*?\]\.map\(\(row, index\) => \(\{ id: '.*?' \+ index, values: row \}\)\)\n+/s, '');

  // Modify states
  const stateRegex = /const \[rows, setRows\] = useState\((?:initialRows|\[\])\)\n(.*?)const \[formValues, setFormValues\] = useState\(\{\}\)/s;
  if (stateRegex.test(content) && !content.includes('const [page, setPage]')) {
    content = content.replace(stateRegex, 
`const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
$1const [formValues, setFormValues] = useState({})
  
  // Pagination State
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchData()
  }, [page])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await apiService.${info.api}({ page, limit: 10 })
      const dataList = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
      if (res?.pagination) setTotalPages(res.pagination.pages || 1)
      
      const mappedRows = dataList.map((st, index) => ({
        id: st._id || st.id || \`${file.replace('.jsx', '')}-\${index}\`,
        values: [
          ${info.cols.join(',\n          ')}
        ],
        original: st
      }))
      setRows(mappedRows)
    } catch (err) {
      console.error("Error fetching:", err)
    } finally {
      setLoading(false)
    }
  }`);
  }

  // Replace DataTable with Pagination wrapper
  const dataTableRegex = /<DataTable columns=\{columns\} rows=\{filteredRows\} \/>/g;
  if (dataTableRegex.test(content) && !content.includes('<Pagination page={page}')) {
    content = content.replace(dataTableRegex, 
`{loading ? (
          <div className="p-8 text-center text-gray-500 font-semibold">Loading...</div>
        ) : (
          <>
            <DataTable columns={columns} rows={filteredRows} />
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </>
        )}`);
  }

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
