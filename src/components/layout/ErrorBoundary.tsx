import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Icon } from '../icons/Icon'
import { Button } from '../ui/Button'
import { buttonStyles } from '../ui/buttonStyles'
import { Logo } from '../ui/Logo'
import { ROUTES } from '../../router/routes'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled portal error:', error, info)
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>

          <section
            className="rounded-2xl border border-slate-300 bg-white p-6 text-center shadow-sm"
            role="alert"
          >
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600">
              <Icon name="alert" size={20} />
            </span>
            <h1 className="mt-4 text-base font-semibold text-slate-900">
              Something went wrong
            </h1>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              An unexpected error occurred while rendering this page. Reload to
              continue.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <Icon name="repeat" size={13} />
                Reload page
              </Button>
              <a
                className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                href={ROUTES.dashboard}
              >
                <Icon name="arrow-left" size={13} />
                Back to dashboard
              </a>
            </div>
          </section>
        </div>
      </main>
    )
  }
}
