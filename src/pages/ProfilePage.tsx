import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/icons/Icon'
import { ApiErrorNotice } from '../components/ui/ApiErrorNotice'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Field, Input, Textarea } from '../components/ui/Field'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { useUpdateProfile } from '../hooks/mutations/profile/profile.mutations'
import { useProfile } from '../hooks/queries/profile/profile.queries'
import { notifyError, notifySuccess } from '../lib/toast'
import { ROUTES } from '../router/routes'

type ProfileForm = {
  phone: string
  bio: string
}

const emptyForm: ProfileForm = {
  phone: '',
  bio: '',
}

export function ProfilePage() {
  const profile = useProfile()
  const updateProfile = useUpdateProfile()
  const [form, setForm] = useState<ProfileForm>(emptyForm)
  const initialized = useRef(false)

  useEffect(() => {
    if (profile.data && !initialized.current) {
      initialized.current = true
      setForm({
        phone: profile.data.phone ?? '',
        bio: profile.data.bio ?? '',
      })
    }
  }, [profile.data])

  const dirty =
    Boolean(profile.data) &&
    (form.phone !== (profile.data?.phone ?? '') ||
      form.bio !== (profile.data?.bio ?? ''))

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    updateProfile.reset()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateProfile.reset()

    updateProfile.mutate(
      {
        phone: form.phone.trim() || null,
        bio: form.bio.trim() || null,
      },
      {
        onSuccess: (updated) => {
          setForm({
            phone: updated.phone ?? '',
            bio: updated.bio ?? '',
          })
          notifySuccess('Profile saved.')
        },
        onError: (error) => notifyError(error),
      },
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Specialist Profile"
        icon="id-card"
        actions={
          <Button
            type="submit"
            form="profile-form"
            variant="primary"
            size="sm"
            disabled={!dirty || updateProfile.isPending}
            aria-busy={updateProfile.isPending}
          >
            <Icon name="check" size={13} />
            {updateProfile.isPending ? 'Saving…' : 'Save'}
          </Button>
        }
      />

      {profile.isError ? (
        <ApiErrorNotice
          error={profile.error}
          title="Could not load your profile"
          onRetry={() => {
            void profile.refetch()
          }}
        />
      ) : null}

      {profile.isLoading ? (
        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="p-5">
            <Skeleton className="mx-auto h-24 w-24 rounded-full" />
            <Skeleton className="mx-auto mt-4 h-4 w-40" />
          </Card>
          <Card className="p-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-24 w-full rounded-lg" />
          </Card>
        </div>
      ) : null}

      {profile.data ? (
        <form id="profile-form" onSubmit={handleSubmit}>
          <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
            <div className="flex flex-col gap-5">
              <Card>
                <CardBody>
                  <div className="flex flex-col items-center text-center">
                    <Avatar size="lg" label="Specialist profile" />
                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      {profile.data.fullName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {profile.data.specialty}
                    </p>
                    <p className="mt-1 max-w-full truncate text-[11px] text-slate-500">
                      {profile.data.email}
                    </p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="Registration"
                  action={
                    profile.data.licenseNumber ? (
                      <Badge tone="success">On file</Badge>
                    ) : (
                      <Badge tone="neutral">Not provided</Badge>
                    )
                  }
                />
                <CardBody>
                  <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
                      <Icon name="shield" size={14} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        License
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-700">
                        {profile.data.licenseNumber ?? '—'}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Link
                className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                to={ROUTES.availability}
              >
                <Icon name="clock" size={13} />
                Availability
              </Link>
            </div>

            <div className="flex flex-col gap-5">
              <Card>
                <CardHeader
                  title="Account"
                  action={
                    dirty ? (
                      <Badge tone="info" dot>
                        Unsaved changes
                      </Badge>
                    ) : (
                      <Badge tone="neutral">Saved</Badge>
                    )
                  }
                />
                <CardBody>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Full name" htmlFor="profile-full-name">
                      <Input
                        id="profile-full-name"
                        value={profile.data.fullName}
                        readOnly
                        disabled
                      />
                    </Field>
                    <Field label="Specialty" htmlFor="profile-specialty">
                      <Input
                        id="profile-specialty"
                        value={profile.data.specialty}
                        readOnly
                        disabled
                      />
                    </Field>
                    <Field label="Email" htmlFor="profile-email">
                      <Input
                        id="profile-email"
                        type="email"
                        value={profile.data.email}
                        readOnly
                        disabled
                      />
                    </Field>
                    <Field label="Phone" htmlFor="profile-phone" optional>
                      <Input
                        id="profile-phone"
                        type="tel"
                        value={form.phone}
                        disabled={updateProfile.isPending}
                        onChange={(event) =>
                          updateField('phone', event.target.value)
                        }
                      />
                    </Field>
                    <Field
                      label="License number"
                      htmlFor="profile-license"
                      optional
                    >
                      <Input
                        id="profile-license"
                        value={profile.data.licenseNumber ?? ''}
                        readOnly
                        disabled
                      />
                    </Field>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Biography" />
                <CardBody>
                  <Field label="Bio" htmlFor="profile-bio" optional>
                    <Textarea
                      id="profile-bio"
                      value={form.bio}
                      disabled={updateProfile.isPending}
                      onChange={(event) =>
                        updateField('bio', event.target.value)
                      }
                      placeholder="Professional background and approach"
                      rows={5}
                    />
                  </Field>
                </CardBody>
              </Card>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  )
}
