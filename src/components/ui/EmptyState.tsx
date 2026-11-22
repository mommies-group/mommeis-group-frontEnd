import type { ReactNode } from 'react'
import { Icon, type IconName } from '../icons/Icon'

type EmptyStateProps = {
  title: string
  description?: ReactNode
  icon?: IconName
  action?: ReactNode
  compact?: boolean
}

export function EmptyState({
  title,
  description,
  icon = 'inbox',
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'gap-1.5 py-6' : 'gap-2 py-10'
      }`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-500">
        <Icon name={icon} size={21} />
      </span>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {description ? (
        <p className="max-w-sm text-xs leading-5 text-slate-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
