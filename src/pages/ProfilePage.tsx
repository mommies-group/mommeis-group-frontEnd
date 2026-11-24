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
import {
  useUpdatePricing,
  useUpdateProfile,
} from '../hooks/mutations/profile/profile.mutations'
import {
  usePricing,
  useProfile,
} from '../hooks/queries/profile/profile.queries'
import { getActionErrorMessage } from '../lib/api-error'
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

type PricingForm = {
  consultationFee: string
  sessionFee: string
  currency: string
}

const emptyPricingForm: PricingForm = {
  consultationFee: '',
  sessionFee: '',
  currency: '',
}

// Keep the native stepper anchored to the current value so every arrow click
// adds/subtracts exactly 10, even when the saved fee is not a multiple of 10.
const feeStepBase = (value: string) =>
  Math.max(0, (Number(value) || 0) - 10)

export function ProfilePage() {
  const profile = useProfile()
  const pricing = usePricing()
  const updateProfile = useUpdateProfile()
  const updatePricing = useUpdatePricing()
  const [form, setForm] = useState<ProfileForm>(emptyForm)
  const [pricingForm, setPricingForm] = useState<PricingForm>(emptyPricingForm)
  const initialized = useRef(false)
  const pricingInitialized = useRef(false)

  useEffect(() => {
    if (profile.data && !initialized.current) {
      initialized.current = true
      setForm({
        phone: profile.data.phone ?? '',
        bio: profile.data.bio ?? '',
      })
    }
  }, [profile.data])

  useEffect(() => {
    if (pricing.data && !pricingInitialized.current) {
      pricingInitialized.current = true
      setPricingForm({
        consultationFee: String(pricing.data.consultationFee),
        sessionFee: String(pricing.data.sessionFee),
        currency: pricing.data.currency,
      })
    }
  }, [pricing.data])

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
        onError: (error) =>
          notifyError(error, getActionErrorMessage(error, 'profile.update')),
      },
    )
  }

  const pricingDirty =
    Boolean(pricing.data) &&
    (pricingForm.consultationFee !== String(pricing.data?.consultationFee) ||
      pricingForm.sessionFee !== String(pricing.data?.sessionFee))

  const updatePricingField = (field: keyof PricingForm, value: string) => {
    setPricingForm((current) => ({ ...current, [field]: value }))
    updatePricing.reset()
  }

  const handlePricingSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updatePricing.reset()

    const consultationFee = Number(pricingForm.consultationFee)
    const sessionFee = Number(pricingForm.sessionFee)

    if (
      !Number.isFinite(consultationFee) ||
      !Number.isFinite(sessionFee) ||
      consultationFee < 0 ||
      sessionFee < 0
    ) {
      notifyError(null, 'Enter valid fees.')
      return
    }

    updatePricing.mutate(
      {
        consultationFee,
        sessionFee,
      },
      {
        onSuccess: (updated) => {
          setPricingForm({
            consultationFee: String(updated.consultationFee),
            sessionFee: String(updated.sessionFee),
            currency: updated.currency,
          })
          notifySuccess('Pricing saved.')
        },
        onError: (error) =>
          notifyError(error, getActionErrorMessage(error, 'pricing.update')),
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
        <div>
          <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
            <div className="flex flex-col gap-5">
              <Card>
                <CardBody>
                  <div className="flex flex-col items-center text-center">
                    <Avatar
                      size="lg"
                      label="Specialist profile"
                      src={profile.data.profileImageUrl}
                    />
                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      {profile.data.fullName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {profile.data.specialty}
                    </p>
                    {profile.data.specialties?.length ? (
                      <div className="mt-2 flex flex-wrap justify-center gap-1">
                        {profile.data.specialties.map((specialty) => (
                          <Badge key={specialty} tone="info">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <p className="mt-1 max-w-full truncate text-xs text-slate-500">
                      {profile.data.email}
                    </p>
                    {profile.data.verificationStatus ? (
                      <Badge
                        className="mt-2"
                        tone={
                          profile.data.verificationStatus === 'VERIFIED'
                            ? 'success'
                            : 'neutral'
                        }
                      >
                        {profile.data.verificationStatus}
                      </Badge>
                    ) : null}
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
                  <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-300">
                      <Icon name="shield" size={14} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        License
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-700">
                        {profile.data.licenseNumber ?? '—'}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Practice" />
                <CardBody>
                  <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-300">
                      <Icon name="briefcase" size={14} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Experience
                      </p>
                      <p className="mt-0.5 text-xs text-slate-700">
                        {profile.data.yearsExperience !== null &&
                        profile.data.yearsExperience !== undefined
                          ? `${profile.data.yearsExperience} years`
                          : 'Not provided'}
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
              <form
                className="flex flex-col gap-5"
                id="profile-form"
                onSubmit={handleSubmit}
              >
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
              </form>

              <Card>
                <CardHeader
                  title="Pricing"
                  action={
                    pricingDirty ? (
                      <Badge tone="info" dot>
                        Unsaved changes
                      </Badge>
                    ) : (
                      <Badge tone="neutral">Saved</Badge>
                    )
                  }
                />
                <form
                  id="pricing-form"
                  noValidate
                  onSubmit={handlePricingSubmit}
                >
                  <CardBody>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field
                        label="Consultation fee"
                        htmlFor="pricing-consultation"
                      >
                        <Input
                          disabled={updatePricing.isPending || !pricing.data}
                          id="pricing-consultation"
                          min={feeStepBase(pricingForm.consultationFee)}
                          onChange={(event) =>
                            updatePricingField(
                              'consultationFee',
                              event.target.value,
                            )
                          }
                          step="10"
                          type="number"
                          value={pricingForm.consultationFee}
                        />
                      </Field>
                      <Field label="Session fee" htmlFor="pricing-session">
                        <Input
                          disabled={updatePricing.isPending || !pricing.data}
                          id="pricing-session"
                          min={feeStepBase(pricingForm.sessionFee)}
                          onChange={(event) =>
                            updatePricingField('sessionFee', event.target.value)
                          }
                          step="10"
                          type="number"
                          value={pricingForm.sessionFee}
                        />
                      </Field>
                      <Field label="Currency" htmlFor="pricing-currency">
                        <Input
                          disabled
                          id="pricing-currency"
                          placeholder="EGP"
                          value={pricingForm.currency}
                        />
                      </Field>
                    </div>
                    {pricing.isError ? (
                      <div className="mt-3">
                        <ApiErrorNotice
                          error={pricing.error}
                          title="Could not load pricing"
                          onRetry={() => {
                            void pricing.refetch()
                          }}
                        />
                      </div>
                    ) : null}
                  </CardBody>
                  <div className="flex justify-end border-t border-slate-300 bg-slate-50/60 px-5 py-3">
                    <Button
                      aria-busy={updatePricing.isPending}
                      disabled={
                        !pricingDirty ||
                        !pricing.data ||
                        updatePricing.isPending
                      }
                      size="sm"
                      type="submit"
                      variant="primary"
                    >
                      <Icon name="check" size={13} />
                      {updatePricing.isPending ? 'Saving…' : 'Save pricing'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
