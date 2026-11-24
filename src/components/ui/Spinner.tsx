type SpinnerProps = {
  label?: string
  className?: string
}

export function Spinner({ label = 'Loading…', className = '' }: SpinnerProps) {
  return (
    <div
      aria-live="polite"
      className={`flex items-center justify-center gap-2 text-xs text-slate-500 ${className}`.trim()}
      role="status"
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-teal-700 border-t-transparent"
      />
      <span>{label}</span>
    </div>
  )
}
