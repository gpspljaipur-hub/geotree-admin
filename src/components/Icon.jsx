const paths = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  map: <><path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3Z"/><path d="M8 3v15M16 6v15"/></>,
  tree: <path d="m12 3-4 6h2l-4 6h5v6h2v-6h5l-4-6h2Z"/>,
  table: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0Z"/><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6"/></>,
  shield: <path d="M12 3 20 6v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6Z"/>,
  gamepad: <><rect x="3" y="7" width="18" height="11" rx="4"/><path d="M8 10v5M5.5 12.5h5M16 11h.01M19 14h.01"/></>,
  sprout: <><path d="M12 22v-9M12 16c-5 0-7-3-7-7 5 0 7 3 7 7ZM12 13c0-5 3-7 7-7 0 5-3 7-7 7Z"/><path d="M5 22h14"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3-7 8-7s8 3 8 7"/></>,
  users: <><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7M16 5a4 4 0 0 1 0 7M18 15c2.5.7 4 2.8 4 6"/></>,
  chart: <><path d="M4 20V4M4 20h17M8 16v-5M13 16V7M18 16v-8"/></>,
  pulse: <path d="M2 13h4l3-8 5 15 3-10 2 3h3"/>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></>,
  certificate: <><path d="M6 3h9l3 3v15H6Z"/><path d="M15 3v4h4M9 12l2 2 4-4"/></>,
  medal: <><circle cx="12" cy="9" r="5"/><path d="m9 14-2 7 5-3 5 3-2-7"/></>,
  box: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9M8 5l8 4.5"/></>,
  crown: <><path d="m4 7 4 4 4-7 4 7 4-4-2 11H6Z"/><path d="M7 21h10"/></>,
  sparkle: <><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  edit: <><path d="m4 20 4-1 11-11-3-3L5 16Z"/><path d="m14 6 3 3"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19 15a2 2 0 0 0 .4 2.2l-2.2 2.2A2 2 0 0 0 15 19l-1 .4V22h-4v-2.6L9 19a2 2 0 0 0-2.2.4l-2.2-2.2A2 2 0 0 0 5 15l-.4-1H2v-4h2.6L5 9a2 2 0 0 0-.4-2.2l2.2-2.2A2 2 0 0 0 9 5l1-.4V2h4v2.6l1 .4a2 2 0 0 0 2.2-.4l2.2 2.2A2 2 0 0 0 19 9l.4 1H22v4h-2.6Z"/></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></>,
  eye: <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>,
  check: <path d="m5 12 4 4L19 6"/>,
  x: <path d="M6 6l12 12M18 6 6 18"/>,
}

export default function Icon({ name, size = 22, strokeWidth = 1.8 }) {
  return (
    <svg
      className="shrink-0"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.grid}
    </svg>
  )
}
