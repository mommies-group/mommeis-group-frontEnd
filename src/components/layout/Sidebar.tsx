import { Link } from 'react-router-dom'
import { useLogout } from '../../hooks/mutations/auth/auth.mutations'
import { useCurrentUser } from '../../hooks/queries/auth/auth.queries'
import { NAV_GROUPS, ROUTES, isNavActive } from '../../router/routes'
import { Icon } from '../icons/Icon'
import { Avatar } from '../ui/Avatar'
import { Logo } from '../ui/Logo'
import { Skeleton } from '../ui/Skeleton'

type SidebarProps = {
  path: string
  open: boolean
  onClose: () => void
}

export function Sidebar({ path, open, onClose }: SidebarProps) {
  const currentUser = useCurrentUser()
  const logout = useLogout()

  const handleSignOut = () => {
    onClose()
    logout()
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[min(300px,86vw)] flex-col border-r border-slate-300 bg-white shadow-2xl transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 lg:shadow-none ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-label="Main navigation"
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-300 px-4 lg:h-[68px]">
          <Link
            to={ROUTES.dashboard}
            onClick={onClose}
            className="min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            title="MindBloom Specialist Portal dashboard"
          >
            <Logo />
          </Link>
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
                    <Link
                      key={item.path}
                      to={item.path}
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
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-300 p-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-300 bg-slate-50/70 p-2.5">
            <Avatar
              size="sm"
              label="Signed-in specialist"
              src={currentUser.data?.profileImageUrl}
            />
            <div className="min-w-0 flex-1">
              {currentUser.isLoading ? (
                <div className="grid gap-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              ) : (
                <>
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {currentUser.data?.fullName ?? 'Specialist account'}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500">
                    {currentUser.data?.specialty ?? 'MindBloom Specialist'}
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              aria-label="Sign out"
              title="Sign out"
              onClick={handleSignOut}
            >
              <Icon name="logout" size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
