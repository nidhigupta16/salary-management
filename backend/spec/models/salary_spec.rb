require "rails_helper"

RSpec.describe Salary, type: :model do
  let(:employee) do
    Employee.create!(
      employee_code: "EMP-2001",
      first_name: "Priya",
      last_name: "Verma",
      email: "priya@example.com",
      country: "India",
      department: "Finance",
      job_title: "Analyst",
      employment_status: "active"
    )
  end

  let(:salary) do
    described_class.new(
      employee: employee,
      amount: 75_000.00,
      currency: "INR"
    )
  end

  it "is valid with an employee, amount and supported currency" do
    expect(salary).to be_valid
  end

  it "rejects a negative salary" do
    salary.amount = -100

    expect(salary).not_to be_valid
    expect(salary.errors[:amount]).to be_present
  end

  it "rejects an unsupported currency" do
    salary.currency = "XYZ"

    expect(salary).not_to be_valid
    expect(salary.errors[:currency]).to be_present
  end

  it "belongs to an employee" do
    expect(described_class.reflect_on_association(:employee).macro).to eq(:belongs_to)
  end
end
