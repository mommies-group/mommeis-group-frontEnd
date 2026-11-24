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

export function Pagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  total,
  onPageChange,
  label = 'list',
  compact = false,
  flush = false,
}: PaginationProps) {
  if (total === 0) {
    return null
  }

  const suffix = ` (${label})`

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
        <div className="flex items-center gap-1">
          <Button
            aria-label={`Previous page${suffix}`}
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Icon name="chevron-left" size={13} />
          </Button>
          {!compact || totalPages <= 3
            ? Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <Button
                    aria-current={pageNumber === page ? 'page' : undefined}
                    aria-label={`Page ${pageNumber}${suffix}`}
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    size="sm"
                    type="button"
                    variant={pageNumber === page ? 'primary' : 'ghost'}
                  >
                    {pageNumber}
                  </Button>
                ),
              )
            : null}
          <Button
            aria-label={`Next page${suffix}`}
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Icon name="chevron-right" size={13} />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
