class CreateConsultations < ActiveRecord::Migration[7.1]
  def change
    create_table :consultations do |t|
      t.references :patient, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.date :consultation_date, null: false
      t.time :consultation_time, null: false
      t.string :consultation_type
      t.integer :status, default: 0, null: false
      t.string :recording_url
      t.integer :processing_status, default: 0, null: false
      t.text :notes

      t.timestamps
    end

    add_index :consultations, [:patient_id, :consultation_date]
    add_index :consultations, [:user_id, :status]
    add_index :consultations, :processing_status
  end
end
