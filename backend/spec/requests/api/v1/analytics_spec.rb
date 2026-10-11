require "rails_helper"

RSpec.describe "Api::V1::Analytics", type: :request do
  describe "GET /api/v1/analytics/salary_summary" do
    before do
      Salary.delete_all
      Employee.delete_all

      [
        ["EMP-9001", "India", "INR", 50_000],
        ["EMP-9002", "India", "INR", 70_000],
        ["EMP-9003", "United States", "USD", 5_000]
      ].each do |code, country, currency, amount|
        employee = Employee.create!(
          employee_code: code,
          first_name: "Test",
          last_name: "Employee",
          email: "#{code.downcase}@example.com",
          country: country,
          department: "Engineering",
          job_title: "Software Engineer",
          employment_status: "active"
        )

        Salary.create!(
          employee: employee,
          amount: amount,
          currency: currency
        )
      end
    end

    it "returns salary summary grouped by currency" do
      get "/api/v1/analytics/salary_summary"

      expect(response).to have_http_status(:ok)

      result = JSON.parse(response.body)
      data = result.fetch("data")

      expect(data.size).to eq(2)

      inr = data.find { |item| item["currency"] == "INR" }
      usd = data.find { |item| item["currency"] == "USD" }

      expect(inr["employee_count"]).to eq(2)
      expect(inr["average_salary"]).to eq(60_000.0)
      expect(inr["minimum_salary"]).to eq(50_000.0)
      expect(inr["maximum_salary"]).to eq(70_000.0)

      expect(usd["employee_count"]).to eq(1)
      expect(usd["average_salary"]).to eq(5_000.0)
    end
  end


  describe "GET /api/v1/analytics/employee_breakdown" do
    before do
      [
        ["EMP-9101", "India", "Engineering"],
        ["EMP-9102", "India", "Finance"],
        ["EMP-9103", "United States", "Engineering"]
      ].each do |code, country, department|
        Employee.create!(
          employee_code: code,
          first_name: "Test",
          last_name: "Employee",
          email: "#{code.downcase}@example.com",
          country: country,
          department: department,
          job_title: "Software Engineer",
          employment_status: "active"
        )
      end
    end

    it "returns employee counts by country and department" do
      get "/api/v1/analytics/employee_breakdown"

      expect(response).to have_http_status(:ok)

      result = JSON.parse(response.body)

      india = result.fetch("by_country")
                   .find { |item| item["country"] == "India" }

      engineering = result.fetch("by_department")
                          .find { |item| item["department"] == "Engineering" }

      expect(india["employee_count"]).to eq(2)
      expect(engineering["employee_count"]).to eq(2)

      expect(result.fetch("by_country").sum { |item| item["employee_count"] })
        .to eq(3)

      expect(result.fetch("by_department").sum { |item| item["employee_count"] })
        .to eq(3)
    end
  end

end
