const fs = require('fs')
const path = require('path')

const resourceConfigs = {
  states: {
    title: 'State Selection',
    description: 'Manage states, regions, and plantation availability.',
    actionLabel: 'ADD STATE',
    search: 'Search States...',
    modalTitle: 'Register New State',
    submitLabel: 'REGISTER STATE',
    fields: [
      { label: 'State Name', required: true, placeholder: 'e.g. Maharashtra' },
      { label: 'Region Banner Upload', type: 'file' },
      { label: 'Status', type: 'select', options: ['Active', 'Inactive'], placeholder: 'Active' },
      { label: 'Description', type: 'textarea', placeholder: 'Enter regional details...', full: true },
    ],
    columns: ['State Details', 'Region', 'Plantation Sites', 'Status', 'Actions'],
    rows: [
      ['Maharashtra', 'Western India', '4 Active Sites'],
      ['Gujarat', 'Western India', '3 Active Sites'],
      ['Rajasthan', 'Northern India', '5 Active Sites'],
      ['Karnataka', 'Southern India', '2 Active Sites'],
      ['Haryana', 'Northern India', '1 Active Site'],
    ],
  },
  'plantation-sites': {
    title: 'Plantation Sites',
    description: 'Detailed management of plantation areas and tree counts',
    actionLabel: 'ADD PLANTATION SITE',
    search: 'Search Plantation Sites...',
    modalTitle: 'Register New Plantation Site',
    submitLabel: 'REGISTER PLANTATION SITE',
    wide: true,
    fields: [
      { label: 'Site Name', required: true, placeholder: 'e.g. Green Valley Site A' },
      { label: 'State', required: true, type: 'select', options: ['Maharashtra', 'Gujarat', 'Rajasthan', 'Karnataka'] },
      { label: 'District', required: true, type: 'select', options: ['Chandigarh', 'Bhavnagar', 'Gadchiroli', 'Jaipur'] },
      { label: 'Block', placeholder: 'e.g. Mulshi' },
      { label: 'Gram Panchayat', placeholder: 'e.g. Hinjavadi' },
      { label: 'Village', placeholder: 'e.g. Hinjavadi Site 1' },
      { label: 'Plantation Type', type: 'select', options: ['Miyawaki', 'Block Plantation'] },
      { label: 'Capacity', placeholder: 'Total Capacity' },
      { label: 'Area (in HA)', placeholder: 'e.g. 2.5' },
      { label: 'Site Image URL', type: 'file' },
      { label: 'Description', type: 'textarea', placeholder: 'Optional details...', full: true },
    ],
    columns: ['Site Details', 'Plantation', 'Land Info', 'Status', 'Actions'],
    rows: [
      ['Bangalore Urban Forest Zone', 'Miyawaki', '358.92187493338633'],
      ['Gujrat zone-1', 'Miyawaki', '1126.4413873956348'],
      ['HR Zone sector-5', 'Miyawaki', '174.37256316051946'],
      ['MH eco zone', 'Miyawaki', '346.19930802643336'],
      ['MP Bio Zone', 'Miyawaki', '620.992347233824'],
      ['Rajasthan Eco world', 'Miyawaki', '1542.3761308545738'],
    ],
  },
  species: {
    title: 'Species',
    description: 'Manage species, carbon sequestration and nursery pricing.',
    actionLabel: 'ADD SPECIES',
    search: 'Search Species...',
    modalTitle: 'Register New Species',
    submitLabel: 'REGISTER SPECIES',
    fields: [
      { label: 'Species Name', required: true, placeholder: 'e.g. Neem' },
      { label: 'Scientific Name', placeholder: 'e.g. Azadirachta indica' },
      { label: 'Sequestration (KGS/YEAR)', placeholder: 'e.g. 22.5' },
      { label: 'Maturity Period', placeholder: 'e.g. 10-15 Years' },
      { label: 'Species Image Upload', type: 'file', full: true },
      { label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
      { label: 'Description', type: 'textarea', placeholder: 'Brief description...', full: true },
    ],
    columns: ['Species', 'Scientific Name', 'Sequestration', 'Height & Price', 'Status', 'Actions'],
    rows: [
      ['Neem', 'Azadirachta indica', '22.5 kg/year', '10-15 Years'],
      ['Mango', 'Mangifera indica', '20 kg/year', '8-12 Years'],
      ['Peepal', 'Ficus religiosa', '26 kg/year', '15-20 Years'],
      ['Banyan', 'Ficus benghalensis', '30 kg/year', '20-25 Years'],
    ],
  },
  categories: {
    title: 'Categories',
    description: 'Organize trees and initiatives into reusable categories.',
    actionLabel: 'ADD CATEGORY',
    search: 'Search Categories...',
    modalTitle: 'Register New Category',
    submitLabel: 'REGISTER CATEGORY',
    fields: [
      { label: 'Category Name', required: true, placeholder: 'e.g. Ornamental' },
      { label: 'Category Type', required: true, type: 'select', options: ['Species', 'Occasion', 'Plantation'] },
      { label: 'Category Image Upload', type: 'file', full: true },
      { label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
      { label: 'Description', type: 'textarea', placeholder: 'Brief description...', full: true },
    ],
    columns: ['Category', 'Category Type', 'Description', 'Status', 'Actions'],
    rows: [
      ['Native Trees', 'Species', 'Locally adapted tree varieties'],
      ['Fruit Bearing', 'Species', 'Trees supporting food systems'],
      ['Celebrations', 'Occasion', 'Plantations for special moments'],
    ],
  },
  occasions: {
    title: 'Occasions',
    description: 'Configure special moments for meaningful tree plantations.',
    actionLabel: 'ADD OCCASION',
    search: 'Search Occasions...',
    modalTitle: 'Register New Occasion',
    submitLabel: 'REGISTER OCCASION',
    fields: [
      { label: 'Occasion Name', required: true, placeholder: 'e.g. Birthday, Anniversary' },
      { label: 'Display Image Upload', required: true, type: 'file' },
      { label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
      { label: 'Description', type: 'textarea', placeholder: 'Enter occasion details...', full: true },
    ],
    columns: ['Occasion', 'Description', 'Plantation Orders', 'Status', 'Actions'],
    rows: [
      ['Achievement', 'Celebrate personal milestones', '8 Orders'],
      ['Birthday', 'A living birthday gift', '12 Orders'],
      ['House Decoration', 'Grow with a new home', '5 Orders'],
      ['Anniversary', 'Mark another year together', '3 Orders'],
    ],
  },
  tournaments: {
    title: 'Tournaments',
    description: 'Manage sports tournaments and sustainability campaigns.',
    actionLabel: 'ADD TOURNAMENT',
    search: 'Search Tournaments...',
    modalTitle: 'Register New Tournament',
    submitLabel: 'REGISTER TOURNAMENT',
    fields: [
      { label: 'Tournament Name', required: true, placeholder: 'e.g. IPL 2024' },
      { label: 'Short Name', required: true, placeholder: 'e.g. IPL' },
      { label: 'Logo', type: 'file' },
      { label: 'Tournament Status', type: 'select', options: ['Upcoming', 'Live', 'Completed'] },
      { label: 'Start Date', required: true, type: 'date' },
      { label: 'End Date', required: true, type: 'date' },
      { label: 'Venue / Country', required: true, placeholder: 'e.g. India' },
      { label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
      { label: 'Description', type: 'textarea', placeholder: 'Brief about the tournament...', full: true },
    ],
    columns: ['Tournament', 'Schedule', 'Teams', 'Status', 'Actions'],
    rows: [
      ['Indian Premier League', '27 May - 3 Jun 2026', '8 Teams'],
      ['Green Champions Cup', '12 Jul - 24 Jul 2026', '6 Teams'],
    ],
  },
  teams: {
    title: 'Teams',
    description: 'Manage tournament teams, branding, and supporters.',
    actionLabel: 'ADD TEAM',
    search: 'Search Teams...',
    modalTitle: 'Register New Team',
    submitLabel: 'REGISTER TEAM',
    fields: [
      { label: 'Team Name', required: true, placeholder: 'e.g. Rajasthan Royals' },
      { label: 'Team Short Name', placeholder: 'e.g. RR' },
      { label: 'Team Logo Upload', type: 'file' },
      { label: 'Branding Hex Color', placeholder: '#E73895' },
      { label: 'Tournament', required: true, type: 'select', options: ['Indian Premier League'] },
      { label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
      { label: 'Description', type: 'textarea', placeholder: 'About the team...', full: true },
    ],
    columns: ['Team', 'Short Name', 'Tournament', 'Brand Color', 'Status', 'Actions'],
    rows: [
      ['Rajasthan Royals', 'RR', 'Indian Premier League', '#E73895'],
      ['Sunrisers Hyderabad', 'SRH', 'Indian Premier League', '#F26522'],
      ['Gujarat Titans', 'GT', 'Indian Premier League', '#1C1C1C'],
      ['Mumbai Indians', 'MI', 'Indian Premier League', '#004BA0'],
      ['Royal Challengers Bengaluru', 'RCB', 'Indian Premier League', '#EC1C24'],
    ],
  },
  nurseries: {
    title: 'Nurseries',
    description: 'Track partner nurseries, ownership, and available inventory.',
    actionLabel: 'ADD NURSERY',
    search: 'Search Nurseries...',
    modalTitle: 'Register New Nursery',
    submitLabel: 'REGISTER NURSERY',
    wide: true,
    fields: [
      { label: 'Nursery Name', required: true, placeholder: 'e.g. Green Valley Nursery' },
      { label: 'Image Upload', type: 'file' },
      { label: 'Coordinates (LAT, LONG)', required: true, placeholder: 'e.g. 18.5204, 73.8567' },
      { label: 'Ownership Type', type: 'select', options: ['Private', 'Government', 'Leased', 'NGO'] },
      { label: 'Khasra ID / Plot No', required: true, placeholder: 'e.g. KH-9021' },
      { label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
      { label: 'Full Address', type: 'textarea', placeholder: 'Enter physical address...', full: true },
      { label: 'Description', type: 'textarea', placeholder: 'General info...', full: true },
    ],
    columns: ['Nursery', 'Ownership', 'Location', 'Species Inventory', 'Status', 'Actions'],
    rows: [
      ['Green Valley Nursery', 'Private', 'Pune, Maharashtra', '12 Species'],
      ['Aravalli Native Plants', 'NGO', 'Jaipur, Rajasthan', '8 Species'],
      ['Gujarat Forest Nursery', 'Government', 'Bhavnagar, Gujarat', '15 Species'],
    ],
  },
  admins: {
    title: 'Admins',
    description: 'Control administrator access, permissions, and field operations.',
    actionLabel: 'ADD ADMIN',
    search: 'Search Admins...',
    modalTitle: 'Register New Admin',
    submitLabel: 'REGISTER ADMIN',
    fields: [
      { label: 'Admin Name', required: true, placeholder: 'Full Name' },
      { label: 'Profile Photo', type: 'file' },
      { label: 'Email ID', required: true, type: 'email', placeholder: 'admin@geotree.com' },
      { label: 'Password', type: 'password', placeholder: 'Password' },
      { label: 'System Role', required: true, type: 'select', options: ['Super Admin', 'Finance Admin', 'Field Officer'] },
      { label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    columns: ['Admin Identity', 'Email', 'System Role', 'Status', 'Actions'],
    rows: [
      ['Super Admin', 'admin@geotree.com', 'Super Admin'],
      ['Anita Sharma', 'anita@geotree.com', 'Finance Admin'],
      ['Ravi Kumar', 'ravi@geotree.com', 'Field Officer'],
    ],
  },
  'emission-factors': {
    title: 'Emission Factors',
    description: 'Manage and update carbon emission factors and metrics.',
    actionLabel: 'ADD EMISSION FACTOR',
    search: 'Search factors...',
    modalTitle: 'Register New Emission Factor',
    submitLabel: 'REGISTER EMISSION FACTOR',
    fields: [
      { label: 'Factor Name', required: true },
      { label: 'Category', type: 'select', options: ['Transport', 'Energy', 'Food', 'Waste'] },
      { label: 'Display Image', type: 'file', full: true },
      { label: 'Unit', placeholder: 'e.g. kg/km, kg/kWh' },
      { label: 'Factor Value', placeholder: 'e.g. 0.21' },
      { label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    columns: ['Factor', 'Category', 'Unit', 'Factor Value', 'Status', 'Actions'],
    rows: [
      ['Electricity', 'energy', 'kg/kwh', '0.82 kg/kwh'],
      ['LPG', 'energy', 'kg/kg', '2.983 kg/kg'],
      ['Non-Vegetarian', 'food', 'kg/kg', '7 kg/kg'],
      ['Vegan', 'food', 'kg/kg', '1.1 kg/kg'],
      ['Vegetarian', 'food', 'kg/kg', '5 kg/kg'],
      ['Bus', 'transport', 'kg/km', '-3 kg/km'],
      ['Car (Diesel)', 'transport', 'kg/km', '0.171 kg/km'],
    ],
  },
}

const mapFiles = {
  'AdminsPage.jsx': 'admins',
  'CategoriesPage.jsx': 'categories',
  'EmissionFactorsPage.jsx': 'emission-factors',
  'NurseriesPage.jsx': 'nurseries',
  'OccasionsPage.jsx': 'occasions',
  'PlantationSitesPage.jsx': 'plantation-sites',
  'SpeciesPage.jsx': 'species',
  'StateSelectionPage.jsx': 'states',
  'TeamsPage.jsx': 'teams',
  'TournamentsPage.jsx': 'tournaments'
}

for (const [filename, configKey] of Object.entries(mapFiles)) {
  const config = resourceConfigs[configKey]
  const componentName = filename.replace('.jsx', '')
  
  const fieldsJSX = config.fields.map((f, i) => {
    let props = `label="${f.label}"`
    if (f.required) props += ' required'
    if (f.type) props += ` type="${f.type}"`
    if (f.placeholder) props += ` placeholder="${f.placeholder}"`
    if (f.full) props += ' full'
    if (f.options) props += ` options={[${f.options.map(o => `'${o}'`).join(', ')}]}`
    return `            <Field ${props} value={formValues[${i}]} onChange={(val) => setFormValues(c => ({...c, [${i}]: val}))} />`
  }).join('\n')

  // Generate the columns logic
  const numDataCols = config.columns.length - 2
  const columnsJSX = config.columns.map((label, index) => {
    const key = `col-${index}`
    if (label === 'Actions') {
      return `    {
      key: '${key}',
      label: 'Actions',
      render: (row) => (
        <Actions
          onEdit={() => openEdit(row)}
          onDelete={() => setRows((current) => current.filter((item) => item.id !== row.id))}
        />
      ),
    }`
    }
    if (label === 'Status') {
      return `    { key: '${key}', label: 'Status', render: () => <StatusToggle /> }`
    }
    if (/category|type|role/i.test(label)) {
      return `    { key: '${key}', label: '${label}', render: (row) => <Badge>{row.values[Math.min(${index}, row.values.length - 1)]}</Badge> }`
    }
    if (index === 0) {
      return `    { key: '${key}', label: '${label}', render: (row) => <EntityCell title={row.values[0]} /> }`
    }
    const isAccent = /value|sequestration|land/i.test(label)
    const classNameStr = isAccent ? ' className="text-pink font-black text-[13px]"' : ''
    return `    { key: '${key}', label: '${label}', render: (row) => <span${classNameStr}>{row.values[Math.min(${index}, row.values.length - 1)] || '—'}</span> }`
  }).join(',\n')

  const code = `import { useMemo, useState } from 'react'
import { Actions, Badge, DataTable, EntityCell, Field, Modal, PageHeader, SearchBar, StatusToggle, TableCard } from '../components/ui'

const initialRows = ${JSON.stringify(config.rows)}.map((row, index) => ({ id: '${componentName}-' + index, values: row }))

export default function ${componentName}() {
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState(initialRows)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formValues, setFormValues] = useState({})

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
    row.values.slice(0, ${numDataCols}).forEach((val, i) => {
      initialValues[i] = val || ''
    })
    setFormValues(initialValues)
    setModalOpen(true)
  }

  const saveRecord = () => {
    const nextValues = []
    for (let i = 0; i < ${numDataCols}; i++) {
      nextValues.push(formValues[i] || (i === 0 ? 'New ${config.title.replace(/s$/, '')}' : '—'))
    }
    if (editingId) {
      setRows((current) => current.map((row) => row.id === editingId ? { ...row, values: nextValues } : row))
    } else {
      setRows((current) => [...current, { id: '${componentName}-' + Date.now(), values: nextValues }])
    }
    setModalOpen(false)
  }

  const columns = [
${columnsJSX}
  ]

  return (
    <>
      <PageHeader title="${config.title}" description="${config.description}" actionLabel="${config.actionLabel}" onAction={openCreate} />
      <TableCard>
        <SearchBar placeholder="${config.search}" value={query} onChange={setQuery} />
        <DataTable columns={columns} rows={filteredRows} />
      </TableCard>
      {modalOpen && (
        <Modal
          title={editingId ? 'Edit ${config.title.replace(/s$/, '')}' : '${config.modalTitle}'}
          submitLabel={editingId ? 'SAVE CHANGES' : '${config.submitLabel}'}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={${config.wide || false}}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
${fieldsJSX}
          </div>
        </Modal>
      )}
    </>
  )
}
`

  fs.writeFileSync(path.join(__dirname, 'src', 'pages', filename), code)
  console.log('Generated', filename)
}
