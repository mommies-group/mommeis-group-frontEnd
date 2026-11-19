import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/icons/Icon'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Field'
import { InlineNotice } from '../components/ui/InlineNotice'
import { Logo } from '../components/ui/Logo'
import { useLogin } from '../hooks/mutations/auth/auth.mutations'
import { getApiErrorMessage } from '../lib/api-error'
import { ROUTES } from '../router/routes'

const brandPoints = [
  {
    icon: 'shield' as const,
    text: 'Consent-aware clinical access for every specialist–child relationship.',
  },
  {
    icon: 'users' as const,
    text: 'Patients, bookings, and availability organised in one workspace.',
  },
  {
    icon: 'activity' as const,
    text: 'Therapeutic activities that families can follow at home.',
  },
]

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const loginMutation = useLogin()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    loginMutation.reset()

    if (!email.trim() || !password) {
      setFormError('Enter your specialist email address and password.')
      return
    }

    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => navigate(ROUTES.dashboard, { replace: true }),
      },
    )
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section
        className="relative hidden overflow-hidden bg-teal-900 px-10 py-10 text-white lg:flex lg:flex-col xl:px-14"
        aria-label="About the Specialist Portal"
      >
        <span
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-teal-700/40 blur-3xl"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-full flex-col">
          <Logo light />

          <div className="mt-16 max-w-lg">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-50">
              <Icon name="shield" size={12} />
              Specialist workspace
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white xl:text-[2.75rem] xl:leading-[1.1]">
              Clinical care, clearly coordinated.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-teal-100/80">
              MindBloom gives specialists a focused space for sessions,
              clinical notes, and family-centred care plans — with privacy
              rules built into the experience.
            </p>

            <div className="mt-9 grid gap-3">
              {brandPoints.map((point) => (
                <div
                  className="flex items-start gap-3 text-xs leading-5 text-teal-50/90"
                  key={point.text}
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-teal-50">
                    <Icon name={point.icon} size={13} />
                  </span>
                  <span>{point.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/10 pt-6 text-[10px] font-medium uppercase tracking-[0.12em] text-teal-100/80">
            <span>MindBloom Specialist Portal</span>
            <span>Secure specialist access</span>
          </div>
        </div>
      </section>

      <section
        className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:bg-white lg:px-10"
        aria-labelledby="login-title"
      >
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
            Specialist access
          </p>
          <h2
            className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
            id="login-title"
          >
            Sign in to your workspace
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter your specialist account details to continue.
          </p>

          <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
            <Field label="Email address" htmlFor="login-email">
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@organisation.com"
                value={email}
                required
                disabled={loginMutation.isPending}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setFormError('')
                  loginMutation.reset()
                }}
              />
            </Field>

            <Field label="Password" htmlFor="login-password">
              <span className="relative block">
                <Input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  required
                  disabled={loginMutation.isPending}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setFormError('')
                    loginMutation.reset()
                  }}
                  className="pr-11"
                />
                <button
                  type="button"
                  className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  disabled={loginMutation.isPending}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={17}
                  />
                </button>
              </span>
            </Field>

            {formError ? (
              <InlineNotice tone="warning">{formError}</InlineNotice>
            ) : null}

            {loginMutation.isError ? (
              <InlineNotice tone="danger">
                {getApiErrorMessage(loginMutation.error)}
              </InlineNotice>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              block
              disabled={loginMutation.isPending}
              aria-busy={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    aria-hidden="true"
                  />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <Icon name="arrow-right" size={16} />
                </>
              )}
            </Button>
          </form>

          <p className="mt-5 text-[10px] leading-4 text-slate-500">
            Access to clinical information is limited to authorised
            specialists. MindBloom is not a substitute for emergency care.
          </p>
        </div>
      </section>
    </main>
  )
}
