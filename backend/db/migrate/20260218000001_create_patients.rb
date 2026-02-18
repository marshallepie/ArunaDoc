class CreatePatients < ActiveRecord::Migration[7.1]
  def change
    create_table :patients do |t|
      t.string :name, null: false
      t.date :date_of_birth
      t.string :email
      t.string :phone
      t.text :address
      t.text :medical_history
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end

    add_index :patients, :email
    add_index :patients, [:user_id, :name]
  end
end
