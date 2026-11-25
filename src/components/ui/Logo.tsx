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
        className={
          light
            ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/95 p-1 shadow-sm'
            : 'flex h-10 w-10 shrink-0 items-center justify-center'
        }
        aria-hidden="true"
      >
        <img
          src="/mindbloom-logo.png"
          alt=""
          className={
            light
              ? 'h-full w-full object-contain'
              : 'h-10 w-10 object-contain'
          }
        />
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
