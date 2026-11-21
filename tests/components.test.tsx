import { describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthStatusScreen } from '../src/components/layout/AuthStatusScreen'
import { Topbar } from '../src/components/layout/Topbar'
import { MonthCalendar } from '../src/components/bookings/MonthCalendar'
import { BookingStatusBadge } from '../src/components/bookings/bookingStatus'

describe('Topbar', () => {
  it('renders the page title, menu button and privacy link', () => {
    const onMenu = jest.fn()

    render(
      <MemoryRouter>
        <Topbar title="Dashboard" menuOpen={false} onMenu={onMenu} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /privacy/i })).toHaveAttribute(
      'href',
      '/privacy',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
    expect(onMenu).toHaveBeenCalledTimes(1)
  })
})

describe('MonthCalendar', () => {
  it('changes month through the navigation controls', () => {
    const onMonthOffsetChange = jest.fn()

    render(
      <MonthCalendar
        monthOffset={0}
        onMonthOffsetChange={onMonthOffsetChange}
        events={[]}
        isLoading={false}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
    expect(onMonthOffsetChange).toHaveBeenCalledWith(1)

    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(onMonthOffsetChange).toHaveBeenCalledWith(-1)
  })

  it('exposes the loaded session count', () => {
    render(
      <MonthCalendar
        monthOffset={0}
        onMonthOffsetChange={() => undefined}
        events={[]}
        isLoading={false}
      />,
    )

    expect(screen.getByLabelText(/Calendar for/)).toHaveAttribute(
      'aria-label',
      expect.stringContaining('0 sessions loaded'),
    )
  })
})

describe('BookingStatusBadge', () => {
  it('renders the human readable status', () => {
    render(<BookingStatusBadge status="COMPLETED" />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })
})

describe('AuthStatusScreen', () => {
  it('renders the loading state', () => {
    render(<AuthStatusScreen mode="loading" message="Checking your session" />)
    expect(screen.getByText('Checking your session')).toBeInTheDocument()
  })

  it('renders an error and retries', () => {
    const onRetry = jest.fn()

    render(
      <AuthStatusScreen
        mode="error"
        error={new Error('Session expired')}
        onRetry={onRetry}
      />,
    )

    expect(screen.getByText('Session expired')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
