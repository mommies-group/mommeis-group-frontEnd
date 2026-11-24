import type { ReactNode } from 'react'
import { Icon, type IconName } from '../icons/Icon'

type PageHeaderProps = {
  title: string
  description?: ReactNode
  eyebrow?: string
  icon?: IconName
  actions?: ReactNode
}

export function PageHeader({
  title,
  description,
  eyebrow,
  icon,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-slate-300 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-0.5 flex min-w-0 items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
          {icon ? (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <Icon name={icon} size={17} />
            </span>
          ) : null}
          <span className="min-w-0 truncate">{title}</span>
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  )
}
