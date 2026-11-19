import { Icon } from '../icons/Icon'
import { Logo } from '../ui/Logo'
import { NAV_GROUPS, isNavActive } from '../../router/routes'

type SidebarProps = {
  path: string
  open: boolean
  onClose: () => void
}

export function Sidebar({ path, open, onClose }: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[min(300px,86vw)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 lg:shadow-none ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-label="Main navigation"
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 lg:h-[68px]">
          <a
            href="#/dashboard"
            onClick={onClose}
            className="min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            aria-label="MindBloom Specialist Portal dashboard"
          >
            <Logo />
          </a>
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 lg:hidden"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <Icon name="close" size={19} />
          </button>
        </div>

        <nav
          className="flex-1 space-y-5 overflow-y-auto px-3 py-5"
          aria-label="Portal sections"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isNavActive(item.path, path)
                  return (
                    <a
                      key={item.path}
                      href={`#${item.path}`}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                        active
                          ? 'bg-teal-50 text-teal-900 ring-1 ring-teal-100'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      aria-current={active ? 'page' : undefined}
                      onClick={onClose}
                    >
                      <span
                        className={
                          active ? 'text-teal-700' : 'text-slate-500'
                        }
                      >
                        <Icon name={item.icon} size={17} />
                      </span>
                      {item.label}
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-200 p-3">
          <div className="rounded-xl border border-teal-100 bg-teal-50/70 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-900">
              <Icon name="shield" size={14} />
              Consent-aware access
            </p>
            <p className="mt-1.5 text-[10px] leading-4 text-teal-900/70">
              Clinical records require both active consent and an active or
              recently completed appointment.
            </p>
            <a
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-teal-800 hover:text-teal-950"
              href="#/privacy"
              onClick={onClose}
            >
              Review access rules
              <Icon name="arrow-right" size={12} />
            </a>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            Static UI preview — no live data
          </p>
        </div>
      </div>
    </aside>
  )
}
