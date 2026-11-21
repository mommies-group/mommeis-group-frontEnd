import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen } from '@testing-library/react'
import { AvailabilityPage } from '../src/pages/AvailabilityPage'
import type {
  AvailabilitySlot,
  DayOfWeek,
} from '../src/types/profile.types'

const mockCreateSlot = jest.fn()
const mockUpdateSlot = jest.fn()
const mockNotifyError = jest.fn()
const mockNotifySuccess = jest.fn()

let mockSlots: AvailabilitySlot[] = []

jest.mock('../src/hooks/queries/profile/profile.queries', () => ({
  useAvailability: () => ({
    data: mockSlots,
    isLoading: false,
    isError: false,
  }),
}))

jest.mock('../src/hooks/mutations/profile/profile.mutations', () => ({
  useCreateAvailabilitySlot: () => ({
    mutate: mockCreateSlot,
    isPending: false,
    reset: jest.fn(),
  }),
  useUpdateAvailabilitySlot: () => ({
    mutate: mockUpdateSlot,
    isPending: false,
    reset: jest.fn(),
  }),
  useDeleteAvailabilitySlot: () => ({ mutate: jest.fn(), isPending: false }),
}))

jest.mock('../src/lib/toast', () => ({
  notifyError: (error: unknown, fallback?: string) =>
    mockNotifyError(error, fallback),
  notifySuccess: (message: string) => mockNotifySuccess(message),
}))

function slot(
  dayOfWeek: DayOfWeek,
  startTime: string,
  endTime: string,
): AvailabilitySlot {
  return {
    id: `slot-${dayOfWeek}-${startTime}`,
    specialistId: 'specialist-1',
    dayOfWeek,
    startTime,
    endTime,
    status: 'ACTIVE',
  }
}

function fillTimes(start: string, end: string) {
  fireEvent.change(screen.getByLabelText('Start'), {
    target: { value: start },
  })
  fireEvent.change(screen.getByLabelText('End'), { target: { value: end } })
}

function submitForm(buttonName = 'Add slot') {
  const form = screen
    .getByRole('button', { name: buttonName })
    .closest('form')
  if (!form) {
    throw new Error(`${buttonName} form not found`)
  }
  fireEvent.submit(form)
}

describe('availability slots', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSlots = []
  })

  it('starts with empty time fields and requires both times', () => {
    render(<AvailabilityPage />)

    expect(screen.getByLabelText('Start')).toHaveValue('')
    expect(screen.getByLabelText('End')).toHaveValue('')

    fillTimes('09:00', '')

    expect(screen.getByLabelText('End')).toHaveValue('')
    submitForm()

    expect(mockNotifyError).toHaveBeenCalledWith(
      null,
      'Choose a start and end time.',
    )
    expect(mockCreateSlot).not.toHaveBeenCalled()
  })

  it('rejects a time that overlaps an existing slot on the same day', () => {
    mockSlots = [slot(1, '09:00', '10:00')]
    render(<AvailabilityPage />)

    fillTimes('09:30', '10:00')
    submitForm()

    expect(mockNotifyError).toHaveBeenCalledWith(
      null,
      'This time overlaps an existing slot — edit it instead.',
    )
    expect(mockCreateSlot).not.toHaveBeenCalled()
  })

  it('allows a time that starts exactly when an existing slot ends', () => {
    mockSlots = [slot(1, '09:00', '10:00')]
    render(<AvailabilityPage />)

    fillTimes('10:00', '11:00')
    submitForm()

    expect(mockNotifyError).not.toHaveBeenCalled()
    expect(mockCreateSlot).toHaveBeenCalledWith(
      {
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '11:00',
        status: 'ACTIVE',
      },
      expect.anything(),
    )
  })

  it('shows saved and selected times with AM/PM on a 12-hour clock', () => {
    mockSlots = [slot(1, '09:00', '13:00')]
    render(<AvailabilityPage />)

    expect(screen.getByText(/9:00\s?AM\s*–\s*1:00\s?PM/)).toBeInTheDocument()

    fillTimes('09:30', '10:30')

    expect(
      screen.getByText(/Selected:\s*9:30\s?AM\s*–\s*10:30\s?AM/),
    ).toBeInTheDocument()
  })

  it('allows the same time on a different day', () => {
    mockSlots = [slot(1, '09:00', '10:00')]
    render(<AvailabilityPage />)

    fireEvent.change(screen.getByLabelText('Day'), {
      target: { value: '2' },
    })
    fillTimes('09:00', '10:00')
    submitForm()

    expect(mockNotifyError).not.toHaveBeenCalled()
    expect(mockCreateSlot).toHaveBeenCalledWith(
      expect.objectContaining({ dayOfWeek: 2 }),
      expect.anything(),
    )
  })

  it('switches the right panel to edit mode and patches start, end and status', () => {
    mockSlots = [slot(1, '09:00', '10:00')]
    render(<AvailabilityPage />)

    fireEvent.click(screen.getByRole('button', { name: /Edit Monday/ }))

    expect(screen.getByText('Edit slot')).toBeInTheDocument()
    expect(screen.getByLabelText('Start')).toHaveValue('09:00')
    expect(screen.getByLabelText('End')).toHaveValue('10:00')
    expect(screen.getByLabelText('Day')).toBeDisabled()

    fillTimes('09:30', '10:30')
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'INACTIVE' },
    })
    submitForm('Save changes')

    expect(mockNotifyError).not.toHaveBeenCalled()
    expect(mockUpdateSlot).toHaveBeenCalledWith(
      {
        id: 'slot-1-09:00',
        payload: {
          startTime: '09:30',
          endTime: '10:30',
          status: 'INACTIVE',
        },
      },
      expect.anything(),
    )
    expect(mockCreateSlot).not.toHaveBeenCalled()
  })

  it('ignores the slot being edited when checking overlap', () => {
    mockSlots = [slot(1, '09:00', '10:00')]
    render(<AvailabilityPage />)

    fireEvent.click(screen.getByRole('button', { name: /Edit Monday/ }))
    fillTimes('09:30', '10:00')
    submitForm('Save changes')

    expect(mockNotifyError).not.toHaveBeenCalled()
    expect(mockUpdateSlot).toHaveBeenCalled()
  })

  it('still rejects an edit that overlaps another slot', () => {
    mockSlots = [slot(1, '09:00', '10:00'), slot(1, '11:00', '12:00')]
    render(<AvailabilityPage />)

    fireEvent.click(
      screen.getByRole('button', { name: /Edit Monday.*11:00/ }),
    )
    fillTimes('09:30', '10:30')
    submitForm('Save changes')

    expect(mockNotifyError).toHaveBeenCalledWith(
      null,
      'This time overlaps an existing slot — edit it instead.',
    )
    expect(mockUpdateSlot).not.toHaveBeenCalled()
  })
})
