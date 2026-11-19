import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/icons/Icon";
import { ApiErrorNotice } from "../components/ui/ApiErrorNotice";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { buttonStyles } from "../components/ui/buttonStyles";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Field, Input, Textarea } from "../components/ui/Field";
import { InlineNotice } from "../components/ui/InlineNotice";
import { PageHeader } from "../components/ui/PageHeader";
import { Skeleton } from "../components/ui/Skeleton";
import { useUpdateProfile } from "../hooks/mutations/profile/profile.mutations";
import { useProfile } from "../hooks/queries/profile/profile.queries";
import { getApiErrorMessage } from "../lib/api-error";
import { ROUTES } from "../router/routes";

type ProfileForm = {
  fullName: string;
  specialty: string;
  licenseNumber: string;
  phone: string;
  email: string;
  bio: string;
};

const emptyForm: ProfileForm = {
  fullName: "",
  specialty: "",
  licenseNumber: "",
  phone: "",
  email: "",
  bio: "",
};

export function ProfilePage() {
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const initialized = useRef(false);

  useEffect(() => {
    if (profile.data && !initialized.current) {
      initialized.current = true;
      setForm({
        fullName: profile.data.fullName,
        specialty: profile.data.specialty,
        licenseNumber: profile.data.licenseNumber ?? "",
        phone: profile.data.phone ?? "",
        email: profile.data.email,
        bio: profile.data.bio ?? "",
      });
    }
  }, [profile.data]);

  const dirty =
    Boolean(profile.data) &&
    (form.fullName !== profile.data?.fullName ||
      form.phone !== (profile.data?.phone ?? "") ||
      form.bio !== (profile.data?.bio ?? ""));

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setNotice("");
    setFormError("");
    updateProfile.reset();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    setFormError("");
    updateProfile.reset();

    if (!form.fullName.trim()) {
      setFormError("Full name is required.");
      return;
    }

    updateProfile.mutate(
      {
        fullName: form.fullName.trim(),
        specialty: form.specialty.trim(),
        email: form.email.trim(),
        licenseNumber: form.licenseNumber.trim() || null,
        phone: form.phone.trim() || null,
        bio: form.bio.trim() || null,
      },
      {
        onSuccess: (updated) => {
          setForm({
            fullName: updated.fullName,
            specialty: updated.specialty,
            licenseNumber: updated.licenseNumber ?? "",
            phone: updated.phone ?? "",
            email: updated.email,
            bio: updated.bio ?? "",
          });
          setNotice("Specialist profile saved.");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Practice settings"
        title="Specialist profile"
        description="Manage the professional details supported by the MindBloom specialist profile API."
        actions={
          <Button
            type="submit"
            form="profile-form"
            variant="primary"
            disabled={!dirty || updateProfile.isPending}
            aria-busy={updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <>
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"
                  aria-hidden="true"
                />
                Saving…
              </>
            ) : (
              <>
                <Icon name="check" size={15} />
                Save profile
              </>
            )}
          </Button>
        }
      />

      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}

      {formError ? (
        <InlineNotice tone="warning">{formError}</InlineNotice>
      ) : null}

      {updateProfile.isError ? (
        <InlineNotice tone="danger">
          {getApiErrorMessage(updateProfile.error)}
        </InlineNotice>
      ) : null}

      {profile.isError ? (
        <ApiErrorNotice
          error={profile.error}
          title="Could not load your profile"
          onRetry={() => {
            void profile.refetch();
          }}
        />
      ) : null}

      {profile.isLoading ? (
        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <Card className="p-5">
            <Skeleton className="mx-auto h-24 w-24 rounded-full" />
            <Skeleton className="mx-auto mt-4 h-4 w-40" />
            <Skeleton className="mx-auto mt-2 h-3 w-28" />
          </Card>
          <div className="grid gap-5">
            <Card className="p-5">
              <Skeleton className="h-4 w-40" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </Card>
            <Card className="p-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-4 h-28 w-full rounded-lg" />
            </Card>
          </div>
        </div>
      ) : null}

      {profile.data ? (
        <form id="profile-form" onSubmit={handleSubmit}>
          <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
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
                    <p className="mt-2 max-w-full truncate text-[11px] text-slate-500">
                      {profile.data.email}
                    </p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="Professional registration"
                  action={
                    profile.data.licenseNumber ? (
                      <Badge tone="success">On file</Badge>
                    ) : (
                      <Badge tone="neutral">Not provided</Badge>
                    )
                  }
                />
                <CardBody>
                  <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
                      <Icon name="shield" size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        License number
                      </p>
                      <p className="mt-0.5 break-words text-[11px] leading-4 text-slate-500">
                        {profile.data.licenseNumber ?? "Not provided"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] leading-4 text-slate-500">
                    Registration details are updated through the profile form.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Booking availability" />
                <CardBody>
                  <p className="text-[11px] leading-4 text-slate-500">
                    Weekly bookable windows are managed on the Availability
                    page.
                  </p>
                  <Link
                    className={`${buttonStyles({ variant: "secondary", size: "sm" })} mt-3`}
                    to={ROUTES.availability}
                  >
                    <Icon name="clock" size={13} />
                    Manage availability
                  </Link>
                </CardBody>
              </Card>
            </div>

            <div className="flex flex-col gap-5">
              <Card>
                <CardHeader
                  title="Account details"
                  description="These fields are saved to your specialist profile."
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
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" htmlFor="profile-full-name">
                      <Input
                        id="profile-full-name"
                        value={form.fullName}
                        disabled={updateProfile.isPending}
                        onChange={(event) =>
                          updateField("fullName", event.target.value)
                        }
                      />
                    </Field>
                    <Field label="Specialty" htmlFor="profile-specialty">
                      <Input
                        id="profile-specialty"
                        value={form.specialty}
                        readOnly
                        disabled
                      />
                    </Field>
                    <Field label="Email address" htmlFor="profile-email">
                      <Input
                        id="profile-email"
                        type="email"
                        value={form.email}
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
                          updateField("phone", event.target.value)
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
                        value={form.licenseNumber}
                        readOnly
                        disabled
                      />
                    </Field>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="Professional biography"
                  description="Introduce your experience and approach to family-centred care."
                />
                <CardBody>
                  <Field
                    label="Biography"
                    htmlFor="profile-bio"
                    hint="This text is stored with your specialist profile."
                  >
                    <Textarea
                      id="profile-bio"
                      value={form.bio}
                      disabled={updateProfile.isPending}
                      onChange={(event) =>
                        updateField("bio", event.target.value)
                      }
                      placeholder="Describe your professional background, clinical approach, and the families you support."
                      rows={6}
                    />
                  </Field>
                </CardBody>
              </Card>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}
