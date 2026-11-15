export default function Logo({ size = 34 }) {
  return (
    <div className="logo">
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <rect x="6" y="14" width="28" height="22" rx="4" fill="#DDF6EA" />
        <path d="M4 8h32l-2 8a4 4 0 0 1-8 0 4 4 0 0 1-8 0 4 4 0 0 1-8 0 4 4 0 0 1-8 0z" fill="#3EB489" />
        <path d="M4 8h8l-1.5 8A4 4 0 0 1 3 16zM20 8h8l-.5 8a4 4 0 0 1-7.5 0z" fill="#12805C" />
        <path d="M14 26l4 4 8-9" stroke="#12805C" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span><b>Duka</b>Smart</span>
    </div>
  );
}
