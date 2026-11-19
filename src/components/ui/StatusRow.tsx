import type { ReactNode } from 'react'
import { Icon, type IconName } from '../icons/Icon'

type StatusRowProps = {
  label: string
  value: ReactNode
  icon?: IconName
}

export function StatusRow({ label, value, icon }: StatusRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 first:pt-0 last:border-0 last:pb-0">
      <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
        {icon ? (
          <span className="text-slate-500">
            <Icon name={icon} size={15} />
          </span>
        ) : null}
        {label}
      </span>
      <span className="text-xs font-medium text-slate-900">{value}</span>
    </div>
  )
}
