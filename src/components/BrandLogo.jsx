export default function BrandLogo({ size = 38, className = '' }) {
  return (
    <svg
      className={`brand-logo ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="ShopMetrics"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="brand-surface" x1="5" y1="4" x2="43" y2="45" gradientUnits="userSpaceOnUse">
          <stop stopColor="#123c4a" />
          <stop offset="1" stopColor="#0b202e" />
        </linearGradient>
        <linearGradient id="brand-accent" x1="15" y1="31" x2="36" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58e1ca" />
          <stop offset="1" stopColor="#90f0cb" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="14" fill="url(#brand-surface)" />
      <rect x="1.5" y="1.5" width="45" height="45" rx="13.5" stroke="#72d9d0" strokeOpacity=".42" />
      <path d="M13 20h22l-1.7 17H14.7L13 20Z" fill="#153c49" stroke="#c6f8ee" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M18 20v-2.2a6 6 0 0 1 12 0V20" stroke="#c6f8ee" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 32v-4m6 4v-8m6 8v-6" stroke="url(#brand-accent)" strokeWidth="3" strokeLinecap="round" />
      <path d="m17.5 24 6 2.2 6.8-5" stroke="#f7c978" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30.3" cy="21.2" r="1.8" fill="#f7c978" />
    </svg>
  );
}
