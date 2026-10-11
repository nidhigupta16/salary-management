class CreateSalaries < ActiveRecord::Migration[7.2]
  def change
    create_table :salaries do |t|
      t.references :employee, null: false, foreign_key: true, index: false
      t.decimal :amount, precision: 15, scale: 2, null: false
      t.string :currency, null: false

      t.timestamps
    end

    add_index :salaries, :employee_id, unique: true
    add_index :salaries, :currency
  end
end
