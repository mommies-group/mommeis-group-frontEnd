import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PatientsPage } from '../src/pages/PatientsPage'

const mockUpdateNote = jest.fn()
const mockDeleteNote = jest.fn()
const mockRefetchNotes = jest.fn()

const savedNote = {
  id: 'note-1',
  childId: 'child-1',
  specialistId: 'spec-1',
  content: 'Original note',
  recommendation: 'Original recommendation',
  booking: { id: 'booking-1', scheduledAt: '2026-12-01T10:00:00.000Z' },
  activities: [
    {
      activityId: 'act-1',
      title: 'Daily reading practice',
      durationMinutes: 10,
      specialistNotes: 'Start slow',
    },
  ],
  createdAt: '2026-11-20T10:00:00.000Z',
  updatedAt: '2026-11-20T10:00:00.000Z',
}

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
  useClinicalNotes: () => ({
    data: [savedNote],
    isLoading: false,
    isError: false,
    refetch: mockRefetchNotes,
  }),
  useClinicalNote: () => ({
    data: savedNote,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
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
        {
          id: 'act-2',
          title: 'Picture naming',
          isActive: true,
          source: 'CUSTOM',
          durationMinutes: 5,
        },
      ],
      isLoading: false,
      isError: false,
    }),
  }),
)

jest.mock('../src/hooks/queries/bookings/bookings.queries', () => ({
  useBookings: () => ({
    data: [
      {
        id: 'booking-1',
        childId: 'child-1',
        scheduledAt: '2026-12-01T10:00:00.000Z',
        status: 'CONFIRMED',
      },
    ],
    isLoading: false,
    isError: false,
  }),
}))

jest.mock('../src/hooks/mutations/clinical-notes/clinical-notes.mutations', () => ({
  useCreateClinicalNote: () => ({
    mutate: jest.fn(),
    isPending: false,
    reset: jest.fn(),
  }),
  useUpdateClinicalNote: () => ({
    mutate: mockUpdateNote,
    isPending: false,
    reset: jest.fn(),
  }),
  useDeleteClinicalNote: () => ({
    mutate: mockDeleteNote,
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

function openNotesDialog() {
  render(
    <MemoryRouter>
      <PatientsPage />
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Notes' }))
}

describe('clinical note edit and delete', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('opens a prefilled popup and updates the note through PUT', () => {
    openNotesDialog()

    fireEvent.click(screen.getByRole('button', { name: /^Edit note from/ }))

    const dialog = screen.getByRole('dialog', { name: 'Edit clinical note' })
    expect(within(dialog).getByLabelText('Note')).toHaveValue('Original note')
    expect(
      within(dialog).getByLabelText('Note for Daily reading practice'),
    ).toHaveValue('Start slow')
    expect(within(dialog).getByLabelText('Select Picture naming')).not.toBeChecked()

    fireEvent.change(within(dialog).getByLabelText('Note'), {
      target: { value: 'Updated note' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }))

    expect(mockUpdateNote).toHaveBeenCalledWith(
      {
        noteId: 'note-1',
        payload: expect.objectContaining({
          content: 'Updated note',
          recommendation: 'Original recommendation',
          bookingId: 'booking-1',
          specialistNotes: { 'act-1': 'Start slow' },
        }),
      },
      expect.anything(),
    )
  })

  it('asks for confirmation before deleting a note', () => {
    openNotesDialog()

    fireEvent.click(screen.getByRole('button', { name: /^Delete note from/ }))

    const dialog = screen.getByRole('dialog', { name: 'Delete clinical note' })
    expect(within(dialog).getByText(/Delete this note\?/)).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete note' }))

    expect(mockDeleteNote).toHaveBeenCalledWith(
      { noteId: 'note-1' },
      expect.anything(),
    )
  })
})
