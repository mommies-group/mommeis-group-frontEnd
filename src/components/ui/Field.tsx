import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { Icon } from '../icons/Icon'

const controlClasses =
  'block w-full min-w-0 rounded-lg border border-slate-400 bg-white text-sm text-slate-900 shadow-sm transition placeholder:text-slate-500 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'

type FieldProps = {
  label: ReactNode
  htmlFor?: string
  hint?: ReactNode
  optional?: boolean
  className?: string
  children: ReactNode
}

export function Field({
  label,
  htmlFor,
  hint,
  optional = false,
  className = '',
  children,
}: FieldProps) {
  return (
    <div className={`grid min-w-0 gap-1.5 ${className}`.trim()}>
      <label
        className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-800"
        htmlFor={htmlFor}
      >
        {label}
        {optional ? (
          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Optional
          </span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p className="text-xs leading-5 text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`${controlClasses} h-10 px-3 ${className}`.trim()}
      {...rest}
    />
  )
}

export function Textarea({
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${controlClasses} min-h-24 resize-y px-3 py-2.5 leading-6 ${className}`.trim()}
      {...rest}
    />
  )
}

export function Select({
  className = '',
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block min-w-0">
      <select
        className={`${controlClasses} h-10 appearance-none px-3 pr-9 ${className}`.trim()}
        {...rest}
      >
        {children}
      </select>
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
        aria-hidden="true"
      >
        <Icon name="chevron-down" size={15} />
      </span>
    </span>
  )
}
