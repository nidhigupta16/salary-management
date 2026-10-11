class Employee < ApplicationRecord
  has_one :salary, dependent: :restrict_with_error

  STATUSES = %w[active inactive on_leave].freeze

  validates :employee_code, presence: true, uniqueness: true
  validates :first_name, :last_name, :email, :country,
            :department, :job_title, presence: true

  validates :email,
            format: { with: URI::MailTo::EMAIL_REGEXP }

  validates :employment_status,
            inclusion: { in: STATUSES }

  scope :active, -> { where(employment_status: "active") }
  scope :search, ->(term) {
    where(
      "employee_code ILIKE :term OR first_name ILIKE :term OR " \
      "last_name ILIKE :term OR email ILIKE :term",
      term: "%#{sanitize_sql_like(term)}%"
    )
  }
end
