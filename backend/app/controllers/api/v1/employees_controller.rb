module Api
  module V1
    class EmployeesController < ApplicationController
      def index
        employees = Employee.includes(:salary)

        if params[:search].present?
          employees = employees.search(params[:search])
        end

        if params[:country].present?
          employees = employees.where(country: params[:country])
        end

        if params[:department].present?
          employees = employees.where(department: params[:department])
        end

        if params[:status].present?
          employees = employees.where(employment_status: params[:status])
        end

        page = params.fetch(:page, 1).to_i
        per_page = params.fetch(:per_page, 20).to_i

        page = 1 if page < 1
        per_page = 20 if per_page < 1
        per_page = 100 if per_page > 100

        total_count = employees.count
        employees = employees.order(:id)
                             .limit(per_page)
                             .offset((page - 1) * per_page)

        render json: {
          data: employees.as_json(
            only: %i[
              id employee_code first_name last_name email country
              department job_title employment_status
            ],
            include: {
              salary: {
                only: %i[id amount currency]
              }
            }
          ),
          meta: {
            page: page,
            per_page: per_page,
            total_count: total_count,
            total_pages: (total_count.to_f / per_page).ceil
          }
        }
      end
    end
  end
end