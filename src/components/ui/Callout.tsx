import type { ReactNode } from 'react'
import { Icon, type IconName } from '../icons/Icon'

export type CalloutTone =
  | 'info'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'

const defaultIcons: Record<CalloutTone, IconName> = {
  info: 'info',
  brand: 'shield',
  success: 'check',
  warning: 'alert',
  danger: 'lock',
  neutral: 'info',
}

const toneClasses: Record<CalloutTone, string> = {
  info: 'border-sky-200 bg-sky-50/80 text-sky-950',
  brand: 'border-teal-200 bg-teal-50/80 text-teal-950',
  success: 'border-emerald-200 bg-emerald-50/80 text-emerald-950',
  warning: 'border-amber-200 bg-amber-50/80 text-amber-950',
  danger: 'border-rose-200 bg-rose-50/80 text-rose-950',
  neutral: 'border-slate-300 bg-slate-50 text-slate-800',
}

const iconClasses: Record<CalloutTone, string> = {
  info: 'text-sky-600',
  brand: 'text-teal-700',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-rose-600',
  neutral: 'text-slate-500',
}

type CalloutProps = {
  children: ReactNode
  tone?: CalloutTone
  title?: ReactNode
  icon?: IconName
  className?: string
}

export function Callout({
  children,
  tone = 'info',
  title,
  icon,
  className = '',
}: CalloutProps) {
  return (
    <div
      className={`flex gap-3 rounded-xl border px-4 py-3 text-xs leading-5 [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2 ${toneClasses[tone]} ${className}`.trim()}
      role="note"
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/70 ${iconClasses[tone]}`}
      >
        <Icon name={icon ?? defaultIcons[tone]} size={17} />
      </span>
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="text-current/80">{children}</div>
      </div>
    </div>
  )
}
