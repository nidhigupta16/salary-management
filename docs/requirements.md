# Salary Management System — Requirements

## Goal
Build a web-based salary management system for ACME's HR Manager to manage salary information for 10,000 employees across multiple countries and understand how the organization pays its workforce.

## Primary User
HR Manager. Authentication is not required for this assessment, as confirmed by Incubyte.

## In Scope
- Seed 10,000 deterministic employee records.
- Browse employees with pagination, search and filters.
- View employee details and current salary.
- Create and update employee information and salary.
- Store salary amounts with their currencies.
- Show employee counts, average/minimum/maximum salaries, country-wise and department-wise breakdowns, and salary-range distributions.
- Keep salary analytics currency-aware; do not combine unlike currencies into misleading totals.
- Deliver a React UI, Rails API, PostgreSQL database, automated tests, and a publicly deployed application.

## Deliberately Out of Scope
- Authentication and multiple user roles: not required by Incubyte.
- Permanent employee deletion: not required; avoid destructive deletion.
- Salary history and effective dates: current salary is sufficient.
- Live exchange-rate integration: currency-wise reporting avoids unnecessary external dependencies.
- Payroll execution, tax calculations, payslips and payment processing: outside the core problem.
- Microservices and complex infrastructure: unnecessary for this application.

## Design and Quality
Use a modular Rails API, React frontend and PostgreSQL. Apply appropriate validations, database constraints and indexes. Paginate results and perform analytics in the database. Maintain deterministic seed data, meaningful automated tests and incremental Git commits. Document architecture, AI usage, trade-offs and performance decisions.

## Success Criteria
The HR Manager can browse and search 10,000 employees, view and update salary information, access accurate currency-aware analytics, and use the deployed application. The repository includes setup instructions, tests, seed instructions, design artifacts and a demo video.
