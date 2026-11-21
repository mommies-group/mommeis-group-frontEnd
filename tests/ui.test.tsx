import { describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen } from '@testing-library/react'
import { Icon } from '../src/components/icons/Icon'
import { ApiErrorNotice } from '../src/components/ui/ApiErrorNotice'
import { Avatar } from '../src/components/ui/Avatar'
import { Badge } from '../src/components/ui/Badge'
import { Button } from '../src/components/ui/Button'
import { Callout } from '../src/components/ui/Callout'
import { Card, CardBody, CardFooter, CardHeader } from '../src/components/ui/Card'
import { EmptyState } from '../src/components/ui/EmptyState'
import { Field, Input, Select, Textarea } from '../src/components/ui/Field'
import { InlineNotice } from '../src/components/ui/InlineNotice'
import { Logo } from '../src/components/ui/Logo'
import { PageHeader } from '../src/components/ui/PageHeader'
import { Skeleton } from '../src/components/ui/Skeleton'
import { SourceBadge } from '../src/components/ui/SourceBadge'
import { StatusRow } from '../src/components/ui/StatusRow'
import { Toggle } from '../src/components/ui/Toggle'

describe('Badge', () => {
  it('renders its label and optional dot', () => {
    const { container } = render(<Badge tone="success" dot>Eligible</Badge>)

    expect(screen.getByText('Eligible')).toBeInTheDocument()
    expect(container.querySelector('.bg-current')).toBeInTheDocument()
  })
})

describe('Button', () => {
  it('renders the requested variant and fires its click handler', () => {
    const onClick = jest.fn()
    render(
      <Button variant="primary" onClick={onClick}>
        Save
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Save' })
    expect(button.className).toContain('bg-teal-700')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('Card', () => {
  it('renders header, body and footer content', () => {
    render(
      <Card>
        <CardHeader title="Session" description="Upcoming appointment" />
        <CardBody>Body content</CardBody>
        <CardFooter>Footer content</CardFooter>
      </Card>,
    )

    expect(
      screen.getByRole('heading', { name: 'Session' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Upcoming appointment')).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })
})

describe('EmptyState', () => {
  it('renders its title, description and action', () => {
    render(
      <EmptyState
        title="No notes"
        description="Saved notes appear here."
        icon="notes"
        action={<button type="button">Create</button>}
      />,
    )

    expect(screen.getByText('No notes')).toBeInTheDocument()
    expect(screen.getByText('Saved notes appear here.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })
})

describe('Field controls', () => {
  it('connects the label, hint and input', () => {
    render(
      <Field label="Email" htmlFor="email" hint="Work email" optional>
        <Input id="email" />
      </Field>,
    )

    const input = screen.getByLabelText(/Email/)
    expect(input).toBeInTheDocument()
    expect(screen.getByText('Optional')).toBeInTheDocument()
    expect(screen.getByText('Work email')).toBeInTheDocument()
  })

  it('renders textarea and select controls', () => {
    render(
      <>
        <Field label="Note" htmlFor="note">
          <Textarea id="note" />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status">
            <option value="ACTIVE">Active</option>
          </Select>
        </Field>
      </>,
    )

    expect(screen.getByLabelText('Note').tagName).toBe('TEXTAREA')
    expect(screen.getByLabelText('Status').tagName).toBe('SELECT')
  })
})

describe('PageHeader', () => {
  it('renders the icon next to the title and the actions slot', () => {
    render(
      <PageHeader
        title="Dashboard"
        icon="dashboard"
        eyebrow="Overview"
        actions={<button type="button">Action</button>}
      />,
    )

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Dashboard')
    expect(heading.parentElement?.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })
})

describe('Avatar', () => {
  it('exposes an accessible label when requested', () => {
    render(<Avatar label="Signed-in specialist" />)
    expect(
      screen.getByRole('img', { name: 'Signed-in specialist' }),
    ).toBeInTheDocument()
  })
})

describe('InlineNotice', () => {
  it('renders a status message', () => {
    render(<InlineNotice tone="warning">Consent required</InlineNotice>)
    expect(screen.getByRole('status')).toHaveTextContent('Consent required')
  })
})

describe('ApiErrorNotice', () => {
  it('renders the error and retries', () => {
    const onRetry = jest.fn()
    render(
      <ApiErrorNotice
        error={new Error('Service unavailable')}
        title="Could not load"
        onRetry={onRetry}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load')
    expect(screen.getByRole('alert')).toHaveTextContent('Service unavailable')
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

describe('Callout', () => {
  it('renders a note with a title', () => {
    render(
      <Callout tone="brand" title="Access">
        Consent is active
      </Callout>,
    )

    const note = screen.getByRole('note')
    expect(note).toHaveTextContent('Access')
    expect(note).toHaveTextContent('Consent is active')
  })
})

describe('StatusRow', () => {
  it('renders label and value', () => {
    render(<StatusRow label="License" value="PSY-48291" icon="shield" />)
    expect(screen.getByText('License')).toBeInTheDocument()
    expect(screen.getByText('PSY-48291')).toBeInTheDocument()
  })
})

describe('Toggle', () => {
  it('reflects state and calls onChange with the next value', () => {
    const onChange = jest.fn()
    render(
      <Toggle
        checked={false}
        onChange={onChange}
        label="Notifications"
        description="Email updates"
      />,
    )

    const toggle = screen.getByRole('switch', { name: 'Notifications' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    fireEvent.click(toggle)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('can be disabled', () => {
    render(
      <Toggle
        checked
        onChange={() => undefined}
        label="Locked"
        disabled
      />,
    )

    expect(screen.getByRole('switch', { name: 'Locked' })).toBeDisabled()
  })
})

describe('SourceBadge', () => {
  it('describes the data source', () => {
    render(<SourceBadge source="parent" />)
    expect(screen.getByText(/Parent-provided/)).toBeInTheDocument()
  })
})

describe('Skeleton', () => {
  it('is hidden from assistive technology', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('Logo', () => {
  it('renders the brand name and tagline', () => {
    render(<Logo tagline="Specialist Portal" />)
    expect(screen.getByText('MindBloom')).toBeInTheDocument()
    expect(screen.getByText('Specialist Portal')).toBeInTheDocument()
  })
})

describe('Icon', () => {
  it('renders a decorative svg', () => {
    const { container } = render(<Icon name="calendar" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
