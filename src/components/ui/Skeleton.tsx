type SkeletonProps = {
  className?: string
}

export function Skeleton({
  className = 'h-3.5 w-full',
}: SkeletonProps) {
  return (
    <span
      className={`block animate-pulse rounded-md bg-slate-200/80 ${className}`.trim()}
      aria-hidden="true"
    />
  )
}
