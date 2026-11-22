import { useMemo, useState } from 'react'

export const PAGE_SIZE = 5

export function usePagination<T>(
  items: T[],
  pageSize: number = PAGE_SIZE,
  resetKey?: string | number,
) {
  const [state, setState] = useState({ page: 1, resetKey })

  if (state.resetKey !== resetKey) {
    setState({ page: 1, resetKey })
  }

  const page = state.resetKey === resetKey ? state.page : 1
  const setPage = (next: number) => {
    setState((current) => ({ ...current, page: next }))
  }

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const visibleItems = useMemo(
    () => items.slice(pageStart, pageStart + pageSize),
    [items, pageStart, pageSize],
  )
  const rangeStart = items.length ? pageStart + 1 : 0
  const rangeEnd = Math.min(pageStart + pageSize, items.length)

  return {
    page: currentPage,
    setPage,
    totalPages,
    visibleItems,
    rangeStart,
    rangeEnd,
    total: items.length,
  }
}
