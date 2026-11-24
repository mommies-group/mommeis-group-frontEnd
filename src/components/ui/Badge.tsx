import type { ReactNode } from 'react'

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'violet'

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'border-slate-300 bg-slate-100 text-slate-600',
  brand: 'border-teal-200 bg-teal-50 text-teal-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
  info: 'border-sky-200 bg-sky-50 text-sky-700',
  violet: 'border-violet-200 bg-violet-50 text-violet-700',
}

type BadgeProps = {
  children: ReactNode
  tone?: BadgeTone
  dot?: boolean
  className?: string
}

export function Badge({
  children,
  tone = 'neutral',
  dot = false,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold leading-4 tracking-wide ${toneClasses[tone]} ${className}`.trim()}
    >
      {dot ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  )
}
