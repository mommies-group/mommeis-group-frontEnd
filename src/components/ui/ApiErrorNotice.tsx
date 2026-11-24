import type { ReactNode } from 'react'
import { Icon } from '../icons/Icon'
import { Button } from './Button'
import { getApiErrorMessage } from '../../lib/api-error'

type ApiErrorNoticeProps = {
  error: unknown
  title?: string
  onRetry?: () => void
  action?: ReactNode
  className?: string
}

export function ApiErrorNotice({
  error,
  title = 'Could not load this information',
  onRetry,
  action,
  className = '',
}: ApiErrorNoticeProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-950 sm:flex-row sm:items-start sm:justify-between ${className}`.trim()}
      role="alert"
    >
      <div className="flex min-w-0 gap-2.5">
        <span className="mt-0.5 shrink-0 text-rose-600">
          <Icon name="alert" size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs leading-5 text-rose-900">
            {getApiErrorMessage(error)}
          </p>
        </div>
      </div>
      {onRetry || action ? (
        <div className="flex shrink-0 flex-wrap gap-2">
          {onRetry ? (
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
