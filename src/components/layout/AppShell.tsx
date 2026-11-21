import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { getPageTitle } from '../../router/routes'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

type AppShellProps = {
  path?: string
  title?: string
  children?: ReactNode
}

export function AppShell({ path, title, children }: AppShellProps) {
  const location = useLocation()
  const currentPath = path ?? location.pathname
  const currentTitle = title ?? getPageTitle(currentPath)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', sidebarOpen)
    return () => document.body.classList.remove('overflow-hidden')
  }, [sidebarOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <a
        className="sr-only rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100]"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to content
      </a>

      <Sidebar
        path={currentPath}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <button
        type="button"
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden ${
          sidebarOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        aria-label="Close navigation"
        tabIndex={sidebarOpen ? 0 : -1}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-col">
        <Topbar
          title={currentTitle}
          menuOpen={sidebarOpen}
          onMenu={() => setSidebarOpen(true)}
        />
        <main
          className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-5 pb-12 sm:px-6 lg:px-8 lg:py-6"
          id="main-content"
          tabIndex={-1}
        >
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  )
}
