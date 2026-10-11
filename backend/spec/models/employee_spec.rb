require "rails_helper"

RSpec.describe Employee, type: :model do
  let(:employee) do
    described_class.new(
      employee_code: "EMP-1001",
      first_name: "Aarav",
      last_name: "Sharma",
      email: "aarav@example.com",
      country: "India",
      department: "Engineering",
      job_title: "Software Engineer",
      employment_status: "active"
    )
  end

  it "is valid with valid attributes" do
    expect(employee).to be_valid
  end

  it "requires an employee code" do
    employee.employee_code = nil

    expect(employee).not_to be_valid
    expect(employee.errors[:employee_code]).to include("can't be blank")
  end

  it "requires a valid email format" do
    employee.email = "invalid-email"

    expect(employee).not_to be_valid
    expect(employee.errors[:email]).to include("is invalid")
  end

  it "rejects an unsupported employment status" do
    employee.employment_status = "terminated"

    expect(employee).not_to be_valid
    expect(employee.errors[:employment_status]).to include("is not included in the list")
  end

  it "searches by employee code" do
    employee.save!

    expect(described_class.search("EMP-1001")).to include(employee)
  end
end
