import logo from '../assets/Geotree logo.png'

export default function Logo() {
  return (
    <div className="flex items-center select-none cursor-default" aria-label="GeoTree">
      <img src={logo} alt="GeoTree Logo" className="h-10 object-contain" />
    </div>
  )
}
