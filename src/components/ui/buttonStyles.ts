export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'soft'
  | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-teal-700 text-white shadow-sm hover:bg-teal-800 disabled:hover:bg-teal-700',
  secondary:
    'border-slate-300 bg-white text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-50',
  ghost:
    'border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  soft: 'border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100',
  danger:
    'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-11 gap-2 px-5 text-sm',
}

type ButtonStyleOptions = {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  className?: string
}

export function buttonStyles({
  variant = 'secondary',
  size = 'md',
  block = false,
  className = '',
}: ButtonStyleOptions = {}) {
  return [
    'inline-flex shrink-0 items-center justify-center rounded-lg border font-semibold transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    block ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}
