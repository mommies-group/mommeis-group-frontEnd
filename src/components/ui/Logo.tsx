type LogoProps = {
  light?: boolean
  tagline?: string
  className?: string
}

export function Logo({
  light = false,
  tagline = 'Specialist Portal',
  className = '',
}: LogoProps) {
  return (
    <span
      className={`inline-flex min-w-0 items-center gap-3 ${className}`.trim()}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          light
            ? 'border border-white/15 bg-white/10 text-white'
            : 'bg-teal-700 text-white shadow-sm'
        }`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path
            d="M12 21v-8.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M12 12.5C7.7 12.5 6 9.6 6 6.5c4.3 0 6 2.7 6 6Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M12 12.5c4.3 0 6-2.9 6-6-4.3 0-6 2.7-6 6Z"
            fill="currentColor"
            opacity="0.65"
          />
          <path
            d="M12 8.2c-1.8-2.2-1-4.4 0-5.7 1 1.3 1.8 3.5 0 5.7Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          className={`text-[15px] font-bold leading-5 tracking-tight ${
            light ? 'text-white' : 'text-slate-900'
          }`}
        >
          MindBloom
        </span>
        {tagline ? (
          <span
            className={`truncate text-[11px] font-semibold uppercase tracking-[0.14em] ${
              light ? 'text-teal-100/80' : 'text-slate-500'
            }`}
          >
            {tagline}
          </span>
        ) : null}
      </span>
    </span>
  )
}
