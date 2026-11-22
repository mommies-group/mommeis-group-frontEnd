import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen } from '@testing-library/react'
import { ActivitiesPage } from '../src/pages/ActivitiesPage'
import type { CatalogActivity } from '../src/types/activity-catalog.types'

const mockUpdateActivity = jest.fn()
const mockCreateActivity = jest.fn()
const mockDeactivateActivity = jest.fn()
let mockCatalogActivities: CatalogActivity[] = []

function makeActivity(index: number): CatalogActivity {
  const isGlobal = index % 2 === 0

  return {
    id: `act-${index}`,
    title: `Activity ${index}`,
    description: null,
    instructions: 'Follow the instructions.',
    category: 'GENERAL',
    developmentalArea: null,
    minAge: null,
    maxAge: null,
    durationMinutes: 10,
    difficultyLevel: 'EASY',
    materials: null,
    mediaReference: null,
    createdBySpecialistId: isGlobal ? null : 'spec-1',
    isGlobal,
    isActive: true,
    source: isGlobal ? 'GLOBAL' : 'CUSTOM',
    createdAt: '2026-11-21T00:00:00.000Z',
    updatedAt: '2026-11-21T00:00:00.000Z',
  }
}

jest.mock('../src/hooks/queries/activities/activity-catalog.queries', () => ({
  useCatalogActivities: () => ({
    data: mockCatalogActivities,
    isLoading: false,
    isError: false,
  }),
}))

jest.mock('../src/hooks/mutations/activities/activity-catalog.mutations', () => ({
  useUpdateCustomActivity: () => ({
    mutate: mockUpdateActivity,
    isPending: false,
    reset: jest.fn(),
  }),
  useCreateCustomActivity: () => ({
    mutate: mockCreateActivity,
    isPending: false,
    reset: jest.fn(),
  }),
  useDeactivateCustomActivity: () => ({
    mutate: mockDeactivateActivity,
    isPending: false,
    reset: jest.fn(),
  }),
}))

describe('activity catalog page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCatalogActivities = [
      {
        ...makeActivity(1),
        id: 'act-1',
        title: 'Daily reading practice',
        category: 'LANGUAGE',
      },
      {
        ...makeActivity(2),
        id: 'custom-1',
        title: 'Bead sequencing',
        description: 'Sequence beads.',
        instructions: 'Copy the pattern.',
        category: 'FINE_MOTOR',
        developmentalArea: 'Fine Motor Coordination',
        minAge: 36,
        maxAge: 84,
        durationMinutes: 12,
        difficultyLevel: 'MEDIUM',
        materials: 'Beads and cord',
        createdBySpecialistId: 'spec-1',
        isGlobal: false,
        source: 'CUSTOM',
      },
    ]
  })

  it('does not expose the old patient-assignment fields', () => {
    render(<ActivitiesPage />)

    expect(screen.getByText('Activity library')).toBeInTheDocument()
    expect(screen.queryByLabelText('Frequency')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Patient')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Due date')).not.toBeInTheDocument()
  })

  it('edits a custom activity using the new catalog payload', () => {
    render(<ActivitiesPage />)

    fireEvent.click(screen.getByLabelText('Edit Bead sequencing'))

    expect(screen.getByText('Edit custom activity')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('Bead sequencing')
    expect(screen.getByLabelText(/Min age/)).toHaveValue(36)
    expect(screen.getByLabelText(/Max age/)).toHaveValue(84)

    fireEvent.change(screen.getByLabelText('Duration'), {
      target: { value: '15' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(mockUpdateActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'custom-1',
        payload: expect.objectContaining({
          durationMinutes: 15,
          category: 'FINE_MOTOR',
          developmentalArea: 'Fine Motor Coordination',
        }),
      }),
      expect.anything(),
    )
    expect(mockCreateActivity).not.toHaveBeenCalled()
  })

  it('shows five activities per page with working pagination', () => {
    mockCatalogActivities = Array.from({ length: 7 }, (_, index) =>
      makeActivity(index + 1),
    )
    render(<ActivitiesPage />)

    expect(screen.getByText('Showing 1–5 of 7')).toBeInTheDocument()
    expect(screen.getByText('Activity 5')).toBeInTheDocument()
    expect(screen.queryByText('Activity 6')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next page (Activities)' }))

    expect(screen.getByText('Showing 6–7 of 7')).toBeInTheDocument()
    expect(screen.getByText('Activity 7')).toBeInTheDocument()
    expect(screen.queryByText('Activity 1')).not.toBeInTheDocument()
  })
})
