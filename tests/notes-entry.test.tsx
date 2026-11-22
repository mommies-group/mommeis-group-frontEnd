import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PatientsPage } from '../src/pages/PatientsPage'

const mockCreateNote = jest.fn()

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

jest.mock('../src/hooks/queries/clinical-notes/clinical-notes.queries', () => ({
  useClinicalNotes: () => ({ data: [], isLoading: false, isError: false }),
  useClinicalNote: () => ({ data: null, isLoading: false, isError: false }),
}))

jest.mock(
  '../src/hooks/queries/activities/activity-catalog.queries',
  () => ({
    useCatalogActivities: () => ({
      data: [
        {
          id: 'act-1',
          title: 'Daily reading practice',
          isActive: true,
          source: 'GLOBAL',
          durationMinutes: 10,
        },
      ],
      isLoading: false,
      isError: false,
    }),
  }),
)

jest.mock('../src/hooks/queries/bookings/bookings.queries', () => ({
  useBookings: () => ({ data: [], isLoading: false, isError: false }),
}))

jest.mock('../src/hooks/mutations/clinical-notes/clinical-notes.mutations', () => ({
  useCreateClinicalNote: () => ({
    mutate: mockCreateNote,
    isPending: false,
    reset: jest.fn(),
  }),
  useUpdateClinicalNote: () => ({
    mutate: jest.fn(),
    isPending: false,
    reset: jest.fn(),
  }),
  useDeleteClinicalNote: () => ({
    mutate: jest.fn(),
    isPending: false,
    reset: jest.fn(),
  }),
}))

jest.mock('../src/hooks/mutations/bookings/bookings.mutations', () => ({
  useCompleteBooking: () => ({
    mutate: jest.fn(),
    isPending: false,
    reset: jest.fn(),
  }),
}))

describe('patients notes entry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('opens the notes dialog from the patient row, not from the page header', () => {
    render(
      <MemoryRouter>
        <PatientsPage />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: /Notes/i })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Notes' })).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: 'Notes' }))

    expect(
      screen.getByRole('dialog', { name: 'Clinical notes' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText(/Ava Smith/).length).toBeGreaterThan(0)
    expect(
      screen.getByLabelText('Select Daily reading practice'),
    ).toBeInTheDocument()
  })

  it('sends selected catalog activities with the note', () => {
    render(
      <MemoryRouter>
        <PatientsPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Notes' }))
    fireEvent.change(screen.getByLabelText('Note'), {
      target: { value: 'Session notes' },
    })
    fireEvent.click(screen.getByLabelText('Select Daily reading practice'))
    fireEvent.change(screen.getByLabelText('Note for Daily reading practice'), {
      target: { value: 'Start with familiar cards.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }))

    expect(mockCreateNote).toHaveBeenCalledWith(
      expect.objectContaining({
        childId: 'child-1',
        payload: expect.objectContaining({
          activityIds: ['act-1'],
          specialistNotes: { 'act-1': 'Start with familiar cards.' },
        }),
      }),
      expect.anything(),
    )
  })
})
