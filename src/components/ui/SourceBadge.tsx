import { Icon } from '../icons/Icon'

export type DataSource = 'parent' | 'ai' | 'specialist'

const labels: Record<DataSource, string> = {
  parent: 'Parent-provided · Read-only',
  ai: 'AI-generated · Read-only',
  specialist: 'Specialist-authored',
}

const toneClasses: Record<DataSource, string> = {
  parent: 'border-sky-200 bg-sky-50 text-sky-700',
  ai: 'border-violet-200 bg-violet-50 text-violet-700',
  specialist: 'border-teal-200 bg-teal-50 text-teal-800',
}

type SourceBadgeProps = {
  source: DataSource
}

export function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-semibold ${toneClasses[source]}`}
    >
      <Icon name={source === 'specialist' ? 'notes' : 'lock'} size={11} />
      {labels[source]}
    </span>
  )
}
