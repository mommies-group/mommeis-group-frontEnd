import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen } from '@testing-library/react'
import { TreatmentPlanFormModal } from '../src/components/treatment-plans/TreatmentPlanFormModal'

const mockCreatePlan = jest.fn()
const mockUpdatePlan = jest.fn()

jest.mock('../src/hooks/queries/profile/profile.queries', () => ({
  usePricing: () => ({
    data: { consultationFee: 500, sessionFee: 250, currency: 'EGP' },
    isLoading: false,
    isError: false,
  }),
}))

jest.mock('../src/hooks/queries/patients/patients.queries', () => ({
  usePatients: () => ({
    data: [
      {
        id: 'child-1',
        firstName: 'Ava',
        lastName: 'Smith',
        dateOfBirth: '2018-01-01',
        parentId: 'parent-1',
        parent: {
          id: 'parent-1',
          fullName: 'Jordan Smith',
          email: 'jordan@example.test',
        },
      },
    ],
    isLoading: false,
    isError: false,
  }),
}))

jest.mock('../src/hooks/queries/treatment-plans/treatment-plans.queries', () => ({
  useTreatmentPlan: () => ({ data: undefined, isLoading: false, isError: false }),
}))

jest.mock(
  '../src/hooks/mutations/treatment-plans/treatment-plans.mutations',
  () => ({
    useCreateTreatmentPlan: () => ({
      mutate: mockCreatePlan,
      isPending: false,
      reset: jest.fn(),
    }),
    useUpdateTreatmentPlan: () => ({
      mutate: mockUpdatePlan,
      isPending: false,
      reset: jest.fn(),
    }),
  }),
)

jest.mock('../src/lib/toast', () => ({
  notifyError: jest.fn(),
  notifySuccess: jest.fn(),
}))

function fillValidPlan() {
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Speech plan' },
  })
  fireEvent.change(screen.getByLabelText('Description'), {
    target: { value: 'Weekly speech sessions' },
  })
  fireEvent.change(screen.getByLabelText('Treatment goals'), {
    target: { value: 'Improve articulation' },
  })
}

describe('TreatmentPlanFormModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses Session fee pre-filled from specialist sessionFee instead of consultationFee', () => {
    render(
      <TreatmentPlanFormModal
        open
        childId="child-1"
        onClose={jest.fn()}
      />,
    )

    expect(screen.getByLabelText('Session fee')).toHaveValue(250)
    expect(screen.queryByLabelText('Consultation fee')).not.toBeInTheDocument()
    const minuteInputs = screen.getAllByLabelText('Minutes')
    expect(minuteInputs).toHaveLength(2)
    minuteInputs.forEach((input) => {
      expect(input).toHaveValue(30)
      expect(input).toBeDisabled()
    })
  })

  it('closes on successful creation and stays open when creation fails', () => {
    const onClose = jest.fn()

    mockCreatePlan.mockImplementationOnce(
      (_payload: unknown, options?: { onError?: (err: unknown) => void }) => {
        options?.onError?.(new Error('Request failed'))
      },
    )

    render(
      <TreatmentPlanFormModal
        open
        childId="child-1"
        onClose={onClose}
      />,
    )

    fillValidPlan()
    fireEvent.click(screen.getByRole('button', { name: 'Create draft plan' }))

    expect(mockCreatePlan).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()

    mockCreatePlan.mockImplementationOnce(
      (_payload: unknown, options?: { onSuccess?: (plan: unknown) => void }) => {
        options?.onSuccess?.({ id: 'plan-1' })
      },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Create draft plan' }))

    expect(mockCreatePlan).toHaveBeenCalledTimes(2)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('subtracts discount from Total, validates discount <= subtotal, and sends wall-clock scheduledAt', () => {
    render(
      <TreatmentPlanFormModal
        open
        childId="child-1"
        onClose={jest.fn()}
      />,
    )

    fillValidPlan()
    fireEvent.change(screen.getByLabelText(/Discount/i), {
      target: { value: '50' },
    })

    expect(screen.getByText(/Total:\s*EGP\s*450/)).toBeInTheDocument()
    expect(screen.getByText(/2 × 250 − 50/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Create draft plan' }))

    expect(mockCreatePlan).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionFee: 250,
        discount: 50,
        sessions: expect.arrayContaining([
          expect.objectContaining({
            sessionNumber: 1,
            scheduledAt: expect.stringMatching(/T10:00:00\.000Z$/),
          }),
        ]),
      }),
      expect.anything(),
    )

    fireEvent.change(screen.getByLabelText(/Discount/i), {
      target: { value: '500' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create draft plan' }))

    fireEvent.change(screen.getByLabelText(/Discount/i), {
      target: { value: '600' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create draft plan' }))

    expect(mockCreatePlan).toHaveBeenCalledTimes(1)
  })
})
