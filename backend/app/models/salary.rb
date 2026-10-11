class Salary < ApplicationRecord
  belongs_to :employee

  SUPPORTED_CURRENCIES = %w[INR USD GBP EUR CAD AUD].freeze

  validates :amount,
            numericality: { greater_than_or_equal_to: 0 }

  validates :currency,
            inclusion: { in: SUPPORTED_CURRENCIES }
end
