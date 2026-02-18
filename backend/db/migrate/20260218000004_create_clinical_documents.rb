class CreateClinicalDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :clinical_documents do |t|
      t.references :consultation, null: false, foreign_key: true
      t.string :document_type, null: false
      t.text :content
      t.integer :status, default: 0, null: false
      t.integer :version, default: 1, null: false
      t.datetime :approved_at
      t.references :approved_by, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :clinical_documents, [:consultation_id, :document_type]
    add_index :clinical_documents, :status
  end
end
