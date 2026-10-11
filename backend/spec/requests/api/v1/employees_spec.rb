
require "rails_helper"

RSpec.describe "Api::V1::Employees", type: :request do
  before do
    [
      ["EMP-9201", "Aarav", "India", "Engineering", "active"],
      ["EMP-9202", "Priya", "India", "Finance", "inactive"],
      ["EMP-9203", "John", "United States", "Engineering", "active"]
    ].each do |code, first_name, country, department, status|
      employee = Employee.create!(
        employee_code: code,
        first_name: first_name,
        last_name: "Test",
        email: "#{code.downcase}@example.com",
        country: country,
        department: department,
        job_title: "Analyst",
        employment_status: status
      )

      Salary.create!(
        employee: employee,
        amount: 50_000,
        currency: country == "India" ? "INR" : "USD"
      )
    end
  end

  describe "GET /api/v1/employees" do
    it "returns paginated employees with salary data" do
      get "/api/v1/employees", params: { per_page: 2 }

      expect(response).to have_http_status(:ok)

      result = JSON.parse(response.body)

      expect(result.fetch("data").size).to eq(2)
      expect(result.dig("data", 0, "salary", "currency")).to be_present
      expect(result.dig("meta", "total_count")).to eq(3)
      expect(result.dig("meta", "total_pages")).to eq(2)
    end

    it "filters employees by country" do
      get "/api/v1/employees", params: { country: "India" }

      result = JSON.parse(response.body)

      expect(result.dig("meta", "total_count")).to eq(2)
      expect(result.fetch("data").all? { |item| item["country"] == "India" })
        .to be(true)
    end

    it "searches employees by employee code" do
      get "/api/v1/employees", params: { search: "EMP-9203" }

      result = JSON.parse(response.body)

      expect(result.dig("meta", "total_count")).to eq(1)
      expect(result.dig("data", 0, "employee_code")).to eq("EMP-9203")
    end
  end
end
