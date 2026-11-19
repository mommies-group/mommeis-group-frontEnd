import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import { Icon } from '../components/icons/Icon'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { InlineNotice } from '../components/ui/InlineNotice'
import { PageHeader } from '../components/ui/PageHeader'
import { Toggle } from '../components/ui/Toggle'

type SessionFormatRow = {
  id: number
  format: string
  duration: string
  rate: string
}

function TagEditor({
  items,
  draft,
  inputId,
  placeholder,
  emptyLabel,
  onChangeDraft,
  onAdd,
  onRemove,
}: {
  items: string[]
  draft: string
  inputId: string
  placeholder: string
  emptyLabel: string
  onChangeDraft: (value: string) => void
  onAdd: () => void
  onRemove: (item: string) => void
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onAdd()
    }
  }

  return (
    <div className="grid gap-2">
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 py-1 pl-2.5 pr-1 text-[11px] font-medium text-teal-800"
              key={item}
            >
              {item}
              <button
                type="button"
                className="flex h-4 w-4 items-center justify-center rounded-full text-teal-700 transition hover:bg-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                aria-label={`Remove ${item}`}
                onClick={() => onRemove(item)}
              >
                <Icon name="close" size={10} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[11px] leading-4 text-slate-500">{emptyLabel}</p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="min-w-0 flex-1">
          <Input
            id={inputId}
            value={draft}
            placeholder={placeholder}
            onChange={(event) => onChangeDraft(event.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button variant="secondary" onClick={onAdd} disabled={!draft.trim()}>
          <Icon name="plus" size={14} />
          Add
        </Button>
      </div>
    </div>
  )
}

export function ProfilePage() {
  const [bio, setBio] = useState('')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [specialtyDraft, setSpecialtyDraft] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [languageDraft, setLanguageDraft] = useState('')
  const [formats, setFormats] = useState<SessionFormatRow[]>([])
  const [unavailable, setUnavailable] = useState(false)
  const [photoName, setPhotoName] = useState('')
  const [credentials, setCredentials] = useState<string[]>([])
  const [notice, setNotice] = useState('')
  const nextFormatId = useRef(1)

  const addSpecialty = () => {
    const value = specialtyDraft.trim()
    if (!value || specialties.includes(value)) {
      return
    }
    setSpecialties((current) => [...current, value])
    setSpecialtyDraft('')
  }

  const addLanguage = () => {
    const value = languageDraft.trim()
    if (!value || languages.includes(value)) {
      return
    }
    setLanguages((current) => [...current, value])
    setLanguageDraft('')
  }

  const addFormat = () => {
    const id = nextFormatId.current
    nextFormatId.current += 1
    setFormats((current) => [
      ...current,
      { id, format: '', duration: '', rate: '' },
    ])
  }

  const updateFormat = (
    id: number,
    field: 'format' | 'duration' | 'rate',
    value: string,
  ) => {
    setFormats((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  const removeFormat = (id: number) => {
    setFormats((current) => current.filter((row) => row.id !== id))
  }

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPhotoName(file.name)
    }
  }

  const handleCredentialChange = (event: ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(event.target.files ?? []).map((file) => file.name)
    if (names.length > 0) {
      setCredentials((current) => [...current, ...names])
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice(
      'Preview only — profile changes are not saved. No data was sent to a server.',
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Practice settings"
        title="Specialist profile"
        description="Manage your professional details, session formats, and verification status. Profiles stay hidden from public search until an administrator approves them."
        actions={
          <Button type="submit" form="profile-form" variant="primary">
            <Icon name="check" size={15} />
            Save profile
          </Button>
        }
      />

      {notice ? <InlineNotice tone="info">{notice}</InlineNotice> : null}

      <form id="profile-form" onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            <Card>
              <CardBody>
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <Avatar size="lg" label="Profile photo placeholder" />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-teal-700 text-white shadow-sm"
                      aria-hidden="true"
                    >
                      <Icon name="camera" size={13} />
                    </span>
                  </div>
                  <label className="mt-3 inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-teal-600 focus-within:ring-offset-2">
                    <Icon name="upload" size={14} />
                    Upload photo
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handlePhotoChange}
                    />
                  </label>
                  <p className="mt-2 text-[11px] leading-4 text-slate-500">
                    JPG or PNG. A clear, professional headshot works best.
                  </p>
                  {photoName ? (
                    <p className="mt-1.5 rounded-md bg-slate-50 px-2 py-1 text-[10px] text-slate-500">
                      Selected for preview: {photoName} (not uploaded)
                    </p>
                  ) : null}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Verification status"
                action={<Badge tone="neutral">Status not available</Badge>}
              />
              <CardBody>
                <div className="space-y-3">
                  <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
                      <Icon name="shield" size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        Credential review
                      </p>
                      <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                        Verification status will appear here after credential
                        documents are submitted and reviewed.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
                      <Icon name="lock" size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        Public search visibility
                      </p>
                      <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                        Hidden until an administrator approves your profile.
                        This portal does not include the admin review screens.
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Temporary availability"
                action={
                  unavailable ? (
                    <Badge tone="warning">Temporarily unavailable</Badge>
                  ) : (
                    <Badge tone="success">Available</Badge>
                  )
                }
              />
              <CardBody>
                <Toggle
                  checked={unavailable}
                  onChange={setUnavailable}
                  label="Mark profile as temporarily unavailable"
                  description="Use this when you are not accepting new booking requests. Existing appointments are not affected."
                />
                <p className="mt-3 text-[11px] leading-4 text-slate-500">
                  Preview control only — this does not update a public profile.
                </p>
              </CardBody>
            </Card>
          </div>

          <div className="flex flex-col gap-5">
            <Card>
              <CardHeader
                title="Professional biography"
                description="Introduce your experience and approach to family-centred care."
              />
              <CardBody>
                <Field
                  label="Biography"
                  htmlFor="profile-bio"
                  hint="This text will appear on your approved public profile."
                >
                  <Textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    placeholder="Describe your professional background, clinical approach, and the families you support."
                    rows={5}
                  />
                </Field>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Clinical specialties"
                description="Add the areas you are qualified and available to support."
              />
              <CardBody>
                <TagEditor
                  items={specialties}
                  draft={specialtyDraft}
                  inputId="profile-specialty"
                  placeholder="Add a clinical specialty"
                  emptyLabel="No clinical specialties added yet."
                  onChangeDraft={setSpecialtyDraft}
                  onAdd={addSpecialty}
                  onRemove={(item) =>
                    setSpecialties((current) =>
                      current.filter((entry) => entry !== item),
                    )
                  }
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Session formats and rates"
                description="Define the formats you offer and the rate for each."
                action={
                  <Button variant="secondary" size="sm" onClick={addFormat}>
                    <Icon name="plus" size={13} />
                    Add format
                  </Button>
                }
              />
              <CardBody>
                {formats.length === 0 ? (
                  <p className="text-[11px] leading-4 text-slate-500">
                    No session formats added yet. Add a format to begin.
                  </p>
                ) : (
                  <div>
                    <div className="grid gap-3">
                      {formats.map((row) => (
                        <div
                          className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:grid-cols-[minmax(0,1.4fr)_100px_100px_auto] sm:items-end"
                          key={row.id}
                        >
                          <Field label="Format" htmlFor={`format-${row.id}`}>
                            <Select
                              id={`format-${row.id}`}
                              value={row.format}
                              onChange={(event) =>
                                updateFormat(
                                  row.id,
                                  'format',
                                  event.target.value,
                                )
                              }
                            >
                              <option value="">Select format</option>
                              <option value="video">Video consultation</option>
                              <option value="in-person">
                                In-person consultation
                              </option>
                            </Select>
                          </Field>
                          <Field
                            label="Duration"
                            htmlFor={`duration-${row.id}`}
                          >
                            <span className="relative block">
                              <Input
                                id={`duration-${row.id}`}
                                type="number"
                                min={1}
                                value={row.duration}
                                placeholder="—"
                                className="pr-9"
                                onChange={(event) =>
                                  updateFormat(
                                    row.id,
                                    'duration',
                                    event.target.value,
                                  )
                                }
                              />
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                                min
                              </span>
                            </span>
                          </Field>
                          <Field label="Rate" htmlFor={`rate-${row.id}`}>
                            <Input
                              id={`rate-${row.id}`}
                              type="number"
                              min={0}
                              value={row.rate}
                              placeholder="—"
                              onChange={(event) =>
                                updateFormat(
                                  row.id,
                                  'rate',
                                  event.target.value,
                                )
                              }
                            />
                          </Field>
                          <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                            aria-label="Remove session format"
                            onClick={() => removeFormat(row.id)}
                          >
                            <Icon name="trash" size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2.5 text-[11px] leading-4 text-slate-500">
                      Currency follows your account billing settings.
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Languages"
                description="Languages you can use in sessions and written notes."
              />
              <CardBody>
                <TagEditor
                  items={languages}
                  draft={languageDraft}
                  inputId="profile-language"
                  placeholder="Add a language"
                  emptyLabel="No languages added yet."
                  onChangeDraft={setLanguageDraft}
                  onAdd={addLanguage}
                  onRemove={(item) =>
                    setLanguages((current) =>
                      current.filter((entry) => entry !== item),
                    )
                  }
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Credential documents"
                description="Required professional documents for administrator review."
                action={
                  <label className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-teal-600 focus-within:ring-offset-2">
                    <Icon name="plus" size={13} />
                    Add document
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="sr-only"
                      onChange={handleCredentialChange}
                    />
                  </label>
                }
              />
              <CardBody>
                {credentials.length === 0 ? (
                  <p className="text-[11px] leading-4 text-slate-500">
                    No credential documents added yet. Accepted formats: PDF,
                    JPG, or PNG.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {credentials.map((name, index) => (
                      <div
                        className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                        key={`${name}-${index}`}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200">
                          <Icon name="file" size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-slate-800">
                            {name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Selected for preview — not uploaded
                          </p>
                        </div>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                          aria-label={`Remove ${name}`}
                          onClick={() =>
                            setCredentials((current) =>
                              current.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                        >
                          <Icon name="close" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-2.5 text-[11px] leading-4 text-slate-500">
                  Documents are not uploaded in this static preview.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
