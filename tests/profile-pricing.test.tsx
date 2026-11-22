import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProfilePage } from '../src/pages/ProfilePage'

const mockUpdatePricing = jest.fn()
const mockUpdateProfile = jest.fn()

jest.mock('../src/hooks/queries/profile/profile.queries', () => ({
  useProfile: () => ({
    data: {
      id: 'spec-1',
      email: 'specialist@mindbloom.test',
      fullName: 'Dr. Amelia Grant',
      specialty: 'Pediatric Psychology',
      specialties: ['Pediatric Psychology', 'Child Development'],
      licenseNumber: 'PSY-48291',
      phone: '01203009255',
      bio: 'Child development specialist.',
      profileImageUrl: null,
      yearsExperience: 12,
      consultationFee: 320,
      sessionFee: 999,
      currency: 'EGP',
      verificationStatus: 'VERIFIED',
      createdAt: '2026-11-21T00:00:00.000Z',
      updatedAt: '2026-11-21T00:00:00.000Z',
    },
    isLoading: false,
    isError: false,
  }),
  usePricing: () => ({
    data: { consultationFee: 320, sessionFee: 999, currency: 'EGP' },
    isLoading: false,
    isError: false,
  }),
}))

jest.mock('../src/hooks/mutations/profile/profile.mutations', () => ({
  useUpdatePricing: () => ({
    mutate: mockUpdatePricing,
    isPending: false,
    reset: jest.fn(),
  }),
  useUpdateProfile: () => ({
    mutate: mockUpdateProfile,
    isPending: false,
    reset: jest.fn(),
  }),
}))

describe('profile pricing data', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows experience, verification and pricing', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('12 years')).toBeInTheDocument()
    expect(screen.getByText('VERIFIED')).toBeInTheDocument()
    expect(screen.getByLabelText('Consultation fee')).toHaveValue(320)
    expect(screen.getByLabelText('Consultation fee')).toHaveAttribute(
      'step',
      '10',
    )
    expect(screen.getByLabelText('Consultation fee')).toHaveAttribute(
      'min',
      '310',
    )
    expect(screen.getByLabelText('Session fee')).toHaveValue(999)
    expect(screen.getByLabelText('Session fee')).toHaveAttribute('step', '10')
    expect(screen.getByLabelText('Session fee')).toHaveAttribute('min', '989')
    expect(screen.getByLabelText('Currency')).toHaveValue('EGP')
    expect(screen.getByLabelText('Currency')).toBeDisabled()
    expect(document.getElementById('pricing-form')).toHaveAttribute(
      'novalidate',
    )
  })

  it('saves pricing through the pricing endpoint', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Consultation fee'), {
      target: { value: '350' },
    })
    expect(screen.getByLabelText('Consultation fee')).toHaveAttribute(
      'min',
      '340',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Save pricing' }))

    expect(mockUpdatePricing).toHaveBeenCalledWith(
      { consultationFee: 350, sessionFee: 999 },
      expect.anything(),
    )
    expect(mockUpdateProfile).not.toHaveBeenCalled()
  })
})
