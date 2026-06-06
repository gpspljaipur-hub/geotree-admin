import { navigation } from '../data/portalData'
import Icon from './Icon'
import Logo from './Logo'

export default function Sidebar({ activeId, open, onClose, onNavigate }) {
  const handleNavigate = (id) => {
    onNavigate(id)
    onClose()
  }

  return (
    <>
      <aside className={`fixed top-0 left-0 bottom-0 z-40 w-[280px] bg-white border-r border-gray-100 flex flex-col pt-[35px] transition-transform duration-250 ease-in-out ${open ? 'translate-x-0 shadow-[10px_0_30px_rgba(10,20,40,0.15)]' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-10 mb-8"><Logo /></div>
        <nav className="flex-1 overflow-y-auto px-[22px] py-2">
          {navigation.map((item) => (
            <button
              className={`flex items-center gap-[14px] w-full h-[44px] px-[16px] mb-[6px] border-0 rounded-[11px] text-[12px] font-[800] tracking-[0.5px] transition-all cursor-pointer ${item.id === activeId ? 'text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              style={item.id === activeId ? { background: 'linear-gradient(90deg, #df3b91 0%, #28479d 100%)' } : undefined}
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              type="button"
            >
              <Icon name={item.icon} />
              <span className="whitespace-nowrap truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      {open && <button className="fixed inset-0 z-30 bg-slate-900/40 border-0 cursor-pointer lg:hidden" aria-label="Close navigation" onClick={onClose} type="button" />}
    </>
  )
}
