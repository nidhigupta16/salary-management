# Reproducible seed data for the Salary Management System.
# Safe to rerun: employee_code is the stable identifier.

puts "Seeding 10,000 employees and current salaries..."

COUNTRIES = {
  "India" => { currency: "INR", code: "IN" },
  "United States" => { currency: "USD", code: "US" },
  "United Kingdom" => { currency: "GBP", code: "UK" },
  "Germany" => { currency: "EUR", code: "DE" },
  "Canada" => { currency: "CAD", code: "CA" },
  "Australia" => { currency: "AUD", code: "AU" }
}.freeze

DEPARTMENTS = [
  "Engineering",
  "Finance",
  "Human Resources",
  "Sales",
  "Marketing",
  "Operations",
  "Customer Support",
  "Legal"
].freeze

JOB_TITLES = [
  "Software Engineer",
  "Senior Engineer",
  "Analyst",
  "Manager",
  "HR Specialist",
  "Account Executive",
  "Marketing Specialist",
  "Operations Associate"
].freeze

FIRST_NAMES = %w[
  Aarav Aditi Arjun Ananya Dev Diya Ishaan Isha Kabir Kavya
  Liam Olivia Noah Emma Ethan Sophia Lucas Amelia Mason Mia
  Oliver Ava Elijah Isabella James Charlotte Benjamin Harper
].freeze

LAST_NAMES = %w[
  Sharma Verma Patel Singh Gupta Mehta Shah Kumar Brown Smith
  Johnson Wilson Taylor Anderson Thomas Jackson White Harris
  Martin Clark Lewis Walker
].freeze

rng = Random.new(20_261_011)

10_000.times do |index|
  number = index + 1
  employee_code = format("EMP-%05d", number)

  country_name = COUNTRIES.keys[(number - 1) % COUNTRIES.size]
  country_info = COUNTRIES.fetch(country_name)

  first_name = FIRST_NAMES[rng.rand(FIRST_NAMES.length)]
  last_name = LAST_NAMES[rng.rand(LAST_NAMES.length)]
  department = DEPARTMENTS[(number - 1) % DEPARTMENTS.length]
  job_title = JOB_TITLES[(number - 1) % JOB_TITLES.length]

  employee = Employee.find_or_initialize_by(employee_code: employee_code)

  employee.assign_attributes(
    first_name: first_name,
    last_name: last_name,
    email: "employee#{number}@example.com",
    country: country_name,
    department: department,
    job_title: job_title,
    employment_status: %w[active active active inactive on_leave][number % 5]
  )

  employee.save!

  salary_amount = case country_info[:currency]
                  when "INR" then rng.rand(30_000..250_000)
                  when "USD" then rng.rand(3_000..15_000)
                  when "GBP" then rng.rand(2_000..10_000)
                  when "EUR" then rng.rand(2_500..12_000)
                  when "CAD" then rng.rand(3_000..14_000)
                  when "AUD" then rng.rand(3_000..14_000)
                  end

  salary = Salary.find_or_initialize_by(employee_id: employee.id)
  salary.update!(
    amount: salary_amount,
    currency: country_info[:currency]
  )

  puts "Seeded #{number} employees..." if (number % 1_000).zero?
end

puts "Seed complete: #{Employee.count} employees, #{Salary.count} salaries."
