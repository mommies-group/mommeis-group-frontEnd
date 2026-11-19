import { Icon } from '../components/icons/Icon'
import { buttonStyles } from '../components/ui/buttonStyles'
import { ROUTES } from '../router/routes'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-black tracking-tight text-slate-200">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        The screen you requested does not exist in the Specialist Portal. Use
        the dashboard to continue.
      </p>
      <a
        className={`${buttonStyles({ variant: 'primary' })} mt-6`}
        href={`#${ROUTES.dashboard}`}
      >
        <Icon name="arrow-left" size={15} />
        Back to dashboard
      </a>
    </div>
  )
}
