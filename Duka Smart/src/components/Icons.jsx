// small line icons used across the app
const PATHS = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  sales: "M4 6h16l-1.5 9h-13L4 6zM4 6L3 3H1M9 20a1 1 0 100-2 1 1 0 000 2zM17 20a1 1 0 100-2 1 1 0 000 2z",
  box: "M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10",
  expenses: "M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6",
  reports: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  truck: "M2 6h12v10H2zM14 9h4l3 3v4h-7M6 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  settings: "M4 7h10M18 7h2M4 17h2M10 17h10M16 4v6M8 14v6",
  bell: "M6 17V11a6 6 0 0112 0v6l2 2H4l2-2zM10 21h4",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5",
  plus: "M12 5v14M5 12h14",
  scan: "M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M4 12h16",
  filter: "M3 5h18l-7 8v6l-4-2v-4L3 5z",
  alert: "M12 4l9 16H3L12 4zM12 10v4M12 17h.01",
  check: "M5 12l5 5L20 7",
  minus: "M5 12h14",
  cash: "M3 7h18v10H3zM12 14a2 2 0 100-4 2 2 0 000 4z",
  phone: "M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1zM11 18h2",
  card: "M3 6h18v12H3zM3 10h18",
  pause: "M8 5v14M16 5v14",
  trend: "M7 17L17 7M9 7h8v8",
  out: "M9 4H5v16h4M16 8l4 4-4 4M20 12H9",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  swap: "M4 8h14l-3-3M20 16H6l3 3",
};

export function Icon({ name, className = "nav-ic" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={PATHS[name] || ""} />
    </svg>
  );
}
