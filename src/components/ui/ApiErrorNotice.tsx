import type { ReactNode } from 'react'
import { Icon, type IconName } from '../icons/Icon'
import { Button } from './Button'
import { getLoadErrorInfo, type LoadErrorContext } from '../../lib/api-error'

type ApiErrorNoticeProps = {
  error: unknown
  context?: LoadErrorContext
  title?: string
  icon?: IconName
  onRetry?: () => void
  action?: ReactNode
  className?: string
}

const iconToneClasses = {
  neutral: 'border-slate-300 bg-white text-slate-500',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-600',
} as const

export function ApiErrorNotice({
  error,
  context,
  title,
  icon,
  onRetry,
  action,
  className = '',
}: ApiErrorNoticeProps) {
  const info = getLoadErrorInfo(error, context, title)
  const resolvedIcon = icon ?? info.icon
  const showRetry = Boolean(onRetry) && info.canRetry

  return (
    <div
      className={`mx-auto flex w-full max-w-lg flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 px-6 py-7 text-center ${className}`.trim()}
      role="alert"
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full border ${iconToneClasses[info.tone]}`}
      >
        <Icon name={resolvedIcon} size={20} />
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-900">{info.title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-600">
        {info.description}
      </p>
      {showRetry || action ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {showRetry ? (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              <Icon name="repeat" size={12} />
              Try again
            </Button>
          ) : null}
          {action}
        </div>
      ) : null}
    </div>
  )
}
