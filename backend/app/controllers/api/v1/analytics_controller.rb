module Api
  module V1
    class AnalyticsController < ApplicationController
      def salary_summary
        summary = Salary
          .group(:currency)
          .select(
            "currency",
            "COUNT(*) AS employee_count",
            "AVG(amount) AS average_salary",
            "MIN(amount) AS minimum_salary",
            "MAX(amount) AS maximum_salary"
          )
          .order(:currency)

        render json: {
          data: summary.map do |record|
            {
              currency: record.currency,
              employee_count: record.employee_count.to_i,
              average_salary: record.average_salary.to_f.round(2),
              minimum_salary: record.minimum_salary.to_f.round(2),
              maximum_salary: record.maximum_salary.to_f.round(2)
            }
          end
        }
      end


		def employee_breakdown
			by_country = Employee
				.group(:country)
				.count
				.sort
				.map do |country, count|
					{ country: country, employee_count: count }
				end

			by_department = Employee
				.group(:department)
				.count
				.sort
				.map do |department, count|
					{ department: department, employee_count: count }
				end

			render json: {
				by_country: by_country,
				by_department: by_department
			}
		end



    end
  end
end
