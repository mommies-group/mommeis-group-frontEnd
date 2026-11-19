import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  as?: 'section' | 'div' | 'article'
}

export function Card({ children, className = '', as = 'section' }: CardProps) {
  const Tag = as
  return (
    <Tag
      className={`min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`.trim()}
    >
      {children}
    </Tag>
  )
}

type CardHeaderProps = {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  id?: string
}

export function CardHeader({
  title,
  description,
  action,
  id,
}: CardHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2
          className="text-sm font-semibold tracking-tight text-slate-900"
          id={id}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        ) : null}
      </div>
      {action ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>
      ) : null}
    </div>
  )
}

export function CardBody({
  children,
  className = '',
  flush = false,
}: {
  children: ReactNode
  className?: string
  flush?: boolean
}) {
  return (
    <div className={`${flush ? '' : 'p-5'} ${className}`.trim()}>{children}</div>
  )
}

export function CardFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-3">
      {children}
    </div>
  )
}
