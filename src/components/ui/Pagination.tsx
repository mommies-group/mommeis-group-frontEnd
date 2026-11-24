import { Icon } from '../icons/Icon'
import { Button } from './Button'

type PaginationProps = {
  page: number
  totalPages: number
  rangeStart: number
  rangeEnd: number
  total: number
  onPageChange: (page: number) => void
  label?: string
  compact?: boolean
  flush?: boolean
}

function getVisiblePages(
  page: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages]
  }

  if (page >= totalPages - 3) {
    return [
      1,
      'ellipsis',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages]
}

export function Pagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  total,
  onPageChange,
  label = 'list',
  flush = false,
}: PaginationProps) {
  if (total === 0) {
    return null
  }

  const suffix = ` (${label})`
  const visiblePages = getVisiblePages(page, totalPages)

  return (
    <div
      className={[
        'flex flex-wrap items-center justify-between gap-2 border-t border-slate-300 bg-slate-50/60',
        flush ? '-mx-6 -mb-6 mt-auto px-6 py-3' : 'px-4 py-2.5',
      ].join(' ')}
    >
      <p className="text-xs text-slate-500">
        Showing {rangeStart}–{rangeEnd} of {total}
      </p>
      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center gap-1">
          <Button
            aria-label={`Previous page${suffix}`}
            className="h-8 w-8 px-0 text-slate-500"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Icon name="chevron-left" size={14} />
          </Button>
          {visiblePages.map((entry, index) =>
            entry === 'ellipsis' ? (
              <span
                aria-hidden="true"
                className="px-1 text-xs text-slate-400"
                key={`ellipsis-${index}`}
              >
                …
              </span>
            ) : (
              <Button
                aria-current={entry === page ? 'page' : undefined}
                aria-label={`Page ${entry}${suffix}`}
                className={
                  entry === page
                    ? 'h-8 min-w-8 px-2.5'
                    : 'h-8 min-w-8 px-2.5 text-slate-700 hover:bg-slate-200/70'
                }
                key={entry}
                onClick={() => onPageChange(entry)}
                size="sm"
                type="button"
                variant={entry === page ? 'primary' : 'ghost'}
              >
                {entry}
              </Button>
            ),
          )}
          <Button
            aria-label={`Next page${suffix}`}
            className="h-8 w-8 px-0 text-slate-500"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Icon name="chevron-right" size={14} />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
