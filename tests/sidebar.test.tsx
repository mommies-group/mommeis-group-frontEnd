import { describe, expect, it, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from '../src/components/layout/Sidebar'

const mockLogout = jest.fn()

jest.mock('../src/hooks/queries/auth/auth.queries', () => ({
  useCurrentUser: () => ({
    data: {
      id: 'spec-1',
      email: 'specialist@mindbloom.test',
      fullName: 'Dr. Amelia Grant',
      specialty: 'Pediatric Psychology',
      licenseNumber: 'PSY-48291',
      phone: null,
      bio: null,
      profileImageUrl: 'https://example.test/specialist.png',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    isLoading: false,
    isError: false,
  }),
}))

jest.mock('../src/hooks/mutations/auth/auth.mutations', () => ({
  useLogout: () => mockLogout,
}))

describe('Sidebar specialist footer', () => {
  it('shows the specialist photo without the workspace caption', () => {
    render(
      <MemoryRouter>
        <Sidebar path="/dashboard" open onClose={jest.fn()} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('img', { name: 'Signed-in specialist' })).toHaveAttribute(
      'src',
      'https://example.test/specialist.png',
    )
    expect(screen.queryByText('Specialist workspace')).not.toBeInTheDocument()
    expect(screen.getByText('Dr. Amelia Grant')).toBeInTheDocument()
  })
})
