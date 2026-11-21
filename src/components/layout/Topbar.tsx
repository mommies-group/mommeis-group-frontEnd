import { Link } from 'react-router-dom'
import { ROUTES } from '../../router/routes'
import { Icon } from '../icons/Icon'
import { Logo } from '../ui/Logo'

type TopbarProps = {
  title: string
  onMenu: () => void
  menuOpen: boolean
}

export function Topbar({ title, onMenu, menuOpen }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md lg:h-[68px] lg:px-8">
      <button
        type="button"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 lg:hidden"
        aria-label="Open navigation"
        aria-expanded={menuOpen}
        onClick={onMenu}
      >
        <Icon name="menu" size={20} />
      </button>

      <span className="min-w-0 lg:hidden">
        <Logo tagline="" />
      </span>

      <nav
        className="hidden min-w-0 items-center gap-1.5 text-xs text-slate-500 lg:flex"
        aria-label="Breadcrumb"
      >
        <span>Specialist Portal</span>
        <Icon name="chevron-right" size={12} />
        <span className="truncate font-semibold text-slate-800">{title}</span>
      </nav>

      <Link
        className="ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        to={ROUTES.privacy}
      >
        <Icon name="shield" size={14} />
        Privacy
      </Link>
    </header>
  )
}
