
import { useEffect, useState } from 'react'
import './App.css'

const PAGE_SIZE = 10

const formatNumber = (value) =>
  Number(value).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })

function App() {
  const [view, setView] = useState('employees')

  const [employees, setEmployees] = useState([])
  const [statusCounts, setStatusCounts] = useState({
    active: 0,
    inactive: 0,
    on_leave: 0,
  })

  const [meta, setMeta] = useState({
    page: 1,
    per_page: PAGE_SIZE,
    total_count: 0,
    total_pages: 0,
  })

  const [salarySummary, setSalarySummary] = useState([])
  const [byCountry, setByCountry] = useState([])
  const [byDepartment, setByDepartment] = useState([])

  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(false)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [error, setError] = useState('')
  const [analyticsError, setAnalyticsError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [analyticsRetryKey, setAnalyticsRetryKey] = useState(0)

  // Fetch employees with server-side filtering and pagination.
  useEffect(() => {
    const controller = new AbortController()

    async function fetchEmployees() {
      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: String(PAGE_SIZE),
        })

        if (search.trim()) params.set('search', search.trim())
        if (country) params.set('country', country)
        if (department) params.set('department', department)
        if (status) params.set('status', status)

        const response = await fetch(
          `/api/v1/employees?${params.toString()}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`)
        }

        const result = await response.json()
        setEmployees(result.data)
        setMeta(result.meta)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(
            'Unable to load employees. Check the backend server and retry.',
          )
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchEmployees()
    return () => controller.abort()
  }, [page, search, country, department, status, retryKey])

  // Fetch employee status counts, salary summaries and workforce breakdowns.
  useEffect(() => {
    const controller = new AbortController()

    async function fetchAnalytics() {
      setAnalyticsLoading(true)
      setAnalyticsError('')

      try {
        const [salaryResponse, breakdownResponse] = await Promise.all([
          fetch('/api/v1/analytics/salary_summary', {
            signal: controller.signal,
          }),
          fetch('/api/v1/analytics/employee_breakdown', {
            signal: controller.signal,
          }),
        ])

        if (!salaryResponse.ok || !breakdownResponse.ok) {
          throw new Error('Unable to fetch analytics')
        }

        const [salaryResult, breakdownResult] = await Promise.all([
          salaryResponse.json(),
          breakdownResponse.json(),
        ])

        setSalarySummary(salaryResult.data || [])
        setByCountry(breakdownResult.by_country || [])
        setByDepartment(breakdownResult.by_department || [])
        setStatusCounts(
          breakdownResult.status_counts || {
            active: 0,
            inactive: 0,
            on_leave: 0,
          },
        )
      } catch (err) {
        if (err.name !== 'AbortError') {
          setAnalyticsError(
            'Unable to load analytics. Please check the backend and retry.',
          )
        }
      } finally {
        if (!controller.signal.aborted) setAnalyticsLoading(false)
      }
    }

    fetchAnalytics()
    return () => controller.abort()
  }, [analyticsRetryKey])

  function resetFilters() {
    setSearch('')
    setCountry('')
    setDepartment('')
    setStatus('')
    setPage(1)
  }

  function changeFilter(setter, value) {
    setter(value)
    setPage(1)
  }

  function renderEmployeeDirectory() {
    return (
      <>
        <section className="page-heading">
          <div>
            <p className="eyebrow">PEOPLE OPERATIONS</p>
            <h1>Employees</h1>
            <p className="subtitle">
              Manage your workforce and review current salary information.
            </p>
          </div>
          <div className="employee-total">
            <span>Total matching employees</span>
            <strong>{meta.total_count.toLocaleString()}</strong>
          </div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-icon purple">♙</span>
            <p>Matching employees</p>
            <strong>{meta.total_count.toLocaleString()}</strong>
            <span className="stat-caption">Based on current filters</span>
          </article>

          <article className="stat-card">
            <span className="stat-icon green">✓</span>
            <p>Active employees</p>
            <strong>{statusCounts.active.toLocaleString()}</strong>
            <span className="stat-caption">
              {statusCounts.inactive.toLocaleString()} inactive ·{' '}
              {statusCounts.on_leave.toLocaleString()} on leave
            </span>
          </article>

          <article className="stat-card">
            <span className="stat-icon orange">◎</span>
            <p>Records per page</p>
            <strong>{PAGE_SIZE}</strong>
            <span className="stat-caption">Paginated API results</span>
          </article>
        </section>

        <section className="table-card">
          <div className="table-heading">
            <div>
              <h2>Employee directory</h2>
              <p>Search, filter and review employee details.</p>
            </div>
            <span className="record-count">
              {meta.total_count.toLocaleString()} records
            </span>
          </div>

          <div className="filters">
            <label className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search name, code or email..."
                value={search}
                onChange={(event) =>
                  changeFilter(setSearch, event.target.value)
                }
              />
            </label>

            <select
              aria-label="Filter by country"
              value={country}
              onChange={(event) =>
                changeFilter(setCountry, event.target.value)
              }
            >
              <option value="">All countries</option>
              <option>Australia</option>
              <option>Canada</option>
              <option>Germany</option>
              <option>India</option>
              <option>United Kingdom</option>
              <option>United States</option>
            </select>

            <select
              aria-label="Filter by department"
              value={department}
              onChange={(event) =>
                changeFilter(setDepartment, event.target.value)
              }
            >
              <option value="">All departments</option>
              <option>Engineering</option>
              <option>Finance</option>
              <option>Human Resources</option>
              <option>Sales</option>
              <option>Marketing</option>
              <option>Operations</option>
              <option>Customer Support</option>
              <option>Legal</option>
            </select>

            <select
              aria-label="Filter by employment status"
              value={status}
              onChange={(event) =>
                changeFilter(setStatus, event.target.value)
              }
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On leave</option>
            </select>

            <button className="reset-button" onClick={resetFilters}>
              Reset
            </button>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
              <button onClick={() => setRetryKey((key) => key + 1)}>
                Retry
              </button>
            </div>
          )}

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>DEPARTMENT</th>
                  <th>COUNTRY</th>
                  <th>STATUS</th>
                  <th>CURRENT SALARY</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="table-message">
                      Loading employees...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="table-message">
                      Employee data could not be loaded.
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="table-message">
                      No employees found. Try changing your filters.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div className="employee-cell">
                          <div className="employee-avatar">
                            {employee.first_name?.[0]}
                            {employee.last_name?.[0]}
                          </div>
                          <div>
                            <strong>
                              {employee.first_name} {employee.last_name}
                            </strong>
                            <span>{employee.employee_code}</span>
                            <small>{employee.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="department-name">
                          {employee.department}
                        </span>
                        <span className="job-title">{employee.job_title}</span>
                      </td>
                      <td>{employee.country}</td>
                      <td>
                        <span className={`badge ${employee.employment_status}`}>
                          {employee.employment_status === 'on_leave'
                            ? 'On leave'
                            : employee.employment_status}
                        </span>
                      </td>
                      <td>
                        {employee.salary ? (
                          <div className="salary-cell">
                            <strong>
                              {Number(employee.salary.amount).toLocaleString(
                                'en-US',
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )}{' '}
                              {employee.salary.currency}
                            </strong>
                            <span>Current salary</span>
                          </div>
                        ) : (
                          <span className="job-title">Not provided</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <footer className="pagination">
            <span>
              Showing{' '}
              {meta.total_count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
              {'–'}
              {Math.min(page * PAGE_SIZE, meta.total_count)} of{' '}
              {meta.total_count.toLocaleString()} employees
            </span>
            <div className="pagination-controls">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>
              <span>
                Page {page} of {Math.max(meta.total_pages, 1).toLocaleString()}
              </span>
              <button
                disabled={page >= meta.total_pages || loading}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </footer>
        </section>
      </>
    )
  }

  function renderSalaryAnalytics() {
    const totalEmployees = salarySummary.reduce(
      (total, item) => total + item.employee_count,
      0,
    )

    const maxCountryCount = Math.max(
      1,
      ...byCountry.map((item) => item.employee_count),
    )
    const maxDepartmentCount = Math.max(
      1,
      ...byDepartment.map((item) => item.employee_count),
    )

    return (
      <>
        <section className="page-heading">
          <div>
            <p className="eyebrow">WORKFORCE INSIGHTS</p>
            <h1>Salary analytics</h1>
            <p className="subtitle">
              Explore current salary ranges and workforce distribution.
            </p>
          </div>
          <div className="employee-total">
            <span>Employees with salary records</span>
            <strong>{totalEmployees.toLocaleString()}</strong>
          </div>
        </section>

        {analyticsError && (
          <div className="error-message" role="alert">
            {analyticsError}
            <button
              onClick={() => setAnalyticsRetryKey((key) => key + 1)}
            >
              Retry
            </button>
          </div>
        )}

        {analyticsLoading ? (
          <section className="table-card">
            <p>Loading salary analytics...</p>
          </section>
        ) : (
          <>
            <section className="stats-grid">
              <article className="stat-card">
                <span className="stat-icon purple">¤</span>
                <p>Supported currencies in use</p>
                <strong>{salarySummary.length}</strong>
                <span className="stat-caption">
                  Salary figures remain currency-specific
                </span>
              </article>
              <article className="stat-card">
                <span className="stat-icon green">♙</span>
                <p>Active employees</p>
                <strong>{statusCounts.active.toLocaleString()}</strong>
                <span className="stat-caption">Current workforce</span>
              </article>
              <article className="stat-card">
                <span className="stat-icon orange">◎</span>
                <p>Countries</p>
                <strong>{byCountry.length}</strong>
                <span className="stat-caption">Employee distribution</span>
              </article>
            </section>

            <section className="table-card analytics-card">
              <div className="table-heading">
                <div>
                  <h2>Salary summary by currency</h2>
                  <p>
                    Average, minimum and maximum current salary per currency.
                  </p>
                </div>
              </div>

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>CURRENCY</th>
                      <th>EMPLOYEES</th>
                      <th>AVERAGE SALARY</th>
                      <th>MINIMUM SALARY</th>
                      <th>MAXIMUM SALARY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salarySummary.map((item) => (
                      <tr key={item.currency}>
                        <td><strong>{item.currency}</strong></td>
                        <td>{item.employee_count.toLocaleString()}</td>
                        <td>{formatNumber(item.average_salary)} {item.currency}</td>
                        <td>{formatNumber(item.minimum_salary)} {item.currency}</td>
                        <td>{formatNumber(item.maximum_salary)} {item.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="analytics-note">
                Currency values are not converted or added together. Compare
                salary statistics within the same currency only.
              </p>
            </section>

            <section className="analytics-grid">
              <article className="table-card analytics-card">
                <div className="table-heading">
                  <div>
                    <h2>Employees by country</h2>
                    <p>Distribution across countries.</p>
                  </div>
                </div>

                <div className="distribution-list">
                  {byCountry.map((item) => (
                    <div className="distribution-item" key={item.country}>
                      <div className="distribution-label">
                        <span>{item.country}</span>
                        <strong>{item.employee_count.toLocaleString()}</strong>
                      </div>
                      <div className="distribution-track">
                        <div
                          className="distribution-fill"
                          style={{
                            width: `${(item.employee_count / maxCountryCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="table-card analytics-card">
                <div className="table-heading">
                  <div>
                    <h2>Employees by department</h2>
                    <p>Distribution across business teams.</p>
                  </div>
                </div>

                <div className="distribution-list">
                  {byDepartment.map((item) => (
                    <div className="distribution-item" key={item.department}>
                      <div className="distribution-label">
                        <span>{item.department}</span>
                        <strong>{item.employee_count.toLocaleString()}</strong>
                      </div>
                      <div className="distribution-track">
                        <div
                          className="distribution-fill"
                          style={{
                            width: `${(item.employee_count / maxDepartmentCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        )}
      </>
    )
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <strong>SalaryFlow</strong>
            <span>HR Management</span>
          </div>
        </div>

        <p className="nav-heading">WORKSPACE</p>

        <button
          className={`nav-item ${view === 'employees' ? 'active' : ''}`}
          onClick={() => setView('employees')}
        >
          <span>▦</span> Employees
        </button>

        <button
          className={`nav-item ${view === 'analytics' ? 'active' : ''}`}
          onClick={() => setView('analytics')}
        >
          <span>▤</span> Salary analytics
        </button>

        <div className="sidebar-bottom">
          <div className="avatar">HR</div>
          <div>
            <strong>HR Manager</strong>
            <span>Workspace admin</span>
          </div>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <span>
            Workspace / {view === 'employees' ? 'Employees' : 'Salary analytics'}
          </span>
          <span className="status-pill">
            <span className="status-dot" /> System connected
          </span>
        </header>

        {view === 'employees'
          ? renderEmployeeDirectory()
          : renderSalaryAnalytics()}

        <footer className="app-footer">
          SalaryFlow · Workforce data management
          <span>Current salary · Currency-aware records</span>
        </footer>
      </section>
    </main>
  )
}

export default App
