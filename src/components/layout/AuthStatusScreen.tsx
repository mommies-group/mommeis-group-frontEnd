import { Icon } from '../icons/Icon'
import { Button } from '../ui/Button'
import { Logo } from '../ui/Logo'
import { getApiErrorMessage } from '../../lib/api-error'

type AuthStatusScreenProps = {
  mode: 'loading' | 'error'
  message?: string
  error?: unknown
  onRetry?: () => void
  onSignOut?: () => void
}

export function AuthStatusScreen({
  mode,
  message,
  error,
  onRetry,
  onSignOut,
}: AuthStatusScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          {mode === 'loading' ? (
            <>
              <span
                className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-700"
                aria-hidden="true"
              >
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
              </span>
              <h1 className="mt-4 text-base font-semibold text-slate-900">
                {message ?? 'Checking your specialist session'}
              </h1>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                MindBloom is confirming your access before loading clinical
                information.
              </p>
            </>
          ) : (
            <>
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600">
                <Icon name="alert" size={20} />
              </span>
              <h1 className="mt-4 text-base font-semibold text-slate-900">
                We could not verify your session
              </h1>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {getApiErrorMessage(error)}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {onRetry ? (
                  <Button variant="secondary" size="sm" onClick={onRetry}>
                    <Icon name="repeat" size={13} />
                    Try again
                  </Button>
                ) : null}
                {onSignOut ? (
                  <Button variant="danger" size="sm" onClick={onSignOut}>
                    <Icon name="logout" size={13} />
                    Sign out
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
