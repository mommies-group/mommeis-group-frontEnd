import { Icon } from '../icons/Icon'

type AvatarProps = {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  src?: string | null
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-24 w-24',
}

export function Avatar({ size = 'md', label, src }: AvatarProps) {
  if (src) {
    return (
      <img
        alt={label ?? 'Avatar'}
        className={`shrink-0 rounded-full border border-slate-200 bg-slate-100 object-cover ${sizeClasses[size]}`}
        src={src}
      />
    )
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-500 ${sizeClasses[size]}`}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      <Icon name="user" size={size === 'lg' ? 34 : size === 'sm' ? 15 : 19} />
    </span>
  )
}
