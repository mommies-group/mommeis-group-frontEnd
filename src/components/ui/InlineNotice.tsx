import type { ReactNode } from 'react'
import { Icon, type IconName } from '../icons/Icon'

type InlineNoticeProps = {
  children: ReactNode
  tone?: 'success' | 'info' | 'warning' | 'danger'
  icon?: IconName
}

const defaultIcons: Record<string, IconName> = {
  success: 'check',
  info: 'info',
  warning: 'alert',
  danger: 'alert',
}

const toneClasses = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-rose-200 bg-rose-50 text-rose-900',
}

export function InlineNotice({
  children,
  tone = 'success',
  icon,
}: InlineNoticeProps) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-5 ${toneClasses[tone]}`}
      role="status"
    >
      <span className="mt-0.5 shrink-0">
        <Icon name={icon ?? defaultIcons[tone]} size={14} />
      </span>
      <span>{children}</span>
    </div>
  )
}
