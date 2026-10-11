import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import App from '../App'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const mockEmployees = {
  data: [
    {
      id: 1,
      employee_code: 'EMP00001',
      first_name: 'Amit',
      last_name: 'Sharma',
      email: 'amit@example.com',
      country: 'India',
      department: 'Engineering',
      job_title: 'Software Engineer',
      employment_status: 'active',
      salary: {
        amount: '85000.00',
        currency: 'INR',
      },
    },
  ],
  meta: {
    page: 1,
    per_page: 10,
    total_count: 1,
    total_pages: 1,
  },
}

const mockSalarySummary = {
  data: [
    {
      currency: 'INR',
      employee_count: 1,
      average_salary: '85000.00',
      minimum_salary: '85000.00',
      maximum_salary: '85000.00',
    },
  ],
}

const mockBreakdown = {
  by_country: [{ country: 'India', employee_count: 1 }],
  by_department: [{ department: 'Engineering', employee_count: 1 }],
  status_counts: {
    active: 1,
    inactive: 0,
    on_leave: 0,
  },
}

function mockApiResponses() {
  vi.stubGlobal(
    'fetch',
    vi.fn((url) => {
      if (url.includes('/employees')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockEmployees),
        })
      }

      if (url.includes('/salary_summary')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSalarySummary),
        })
      }

      if (url.includes('/employee_breakdown')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBreakdown),
        })
      }

      return Promise.reject(new Error(`Unexpected API URL: ${url}`))
    }),
  )
}

describe('SalaryFlow dashboard', () => {
  it('renders the employee directory', async () => {
    mockApiResponses()

    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Employees' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: 'Employee directory' }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Amit Sharma')).toBeInTheDocument()
    })
  })

  it('displays employee details and current salary from the API', async () => {
    mockApiResponses()

    render(<App />)

    expect(await screen.findByText('amit@example.com')).toBeInTheDocument()
    expect(screen.getByText('EMP00001')).toBeInTheDocument()
    expect(
    screen.getByText('Engineering', { selector: '.department-name' }),
    ).toBeInTheDocument()
    expect(
    screen.getByText('India', { selector: 'td' }),
    ).toBeInTheDocument()
    expect(screen.getByText('85,000.00 INR')).toBeInTheDocument()
  })

  it('sends the search term to the employees API', async () => {
    mockApiResponses()

    render(<App />)

    const searchInput = screen.getByPlaceholderText(
      'Search name, code or email...',
    )

    fireEvent.change(searchInput, {
      target: { value: 'Amit' },
    })

    await waitFor(() => {
      expect(
        fetch.mock.calls.some(([url]) =>
          url.includes('search=Amit'),
        ),
      ).toBe(true)
    })
  })

  it('sends the selected country to the employees API', async () => {
    mockApiResponses()

    render(<App />)

    const countryFilter = screen.getByLabelText(/country/i)

    fireEvent.change(countryFilter, {
      target: { value: 'India' },
    })

    await waitFor(() => {
      expect(
        fetch.mock.calls.some(([url]) =>
          url.includes('country=India'),
        ),
      ).toBe(true)
    })
  })

  it('sends the selected department to the employees API', async () => {
    mockApiResponses()

    render(<App />)

    const departmentFilter = screen.getByLabelText(/department/i)

    fireEvent.change(departmentFilter, {
      target: { value: 'Engineering' },
    })

    await waitFor(() => {
      expect(
        fetch.mock.calls.some(([url]) =>
          url.includes('department=Engineering'),
        ),
      ).toBe(true)
    })
  })

  it('sends the selected employment status to the employees API', async () => {
    mockApiResponses()

    render(<App />)

    const statusFilter = screen.getByLabelText(/status/i)

    fireEvent.change(statusFilter, {
      target: { value: 'active' },
    })

    await waitFor(() => {
      expect(
        fetch.mock.calls.some(([url]) =>
          url.includes('status=active'),
        ),
      ).toBe(true)
    })
  })

  it('displays salary analytics when the Analytics tab is selected', async () => {
    mockApiResponses()

    render(<App />)

    fireEvent.click(
      screen.getByRole('button', { name: /analytics/i }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Employees by department',
      }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(
        fetch.mock.calls.some(([url]) =>
          url.includes('/analytics/salary_summary'),
        ),
      ).toBe(true)
    })

    expect(screen.getByText('INR')).toBeInTheDocument()
  })
})