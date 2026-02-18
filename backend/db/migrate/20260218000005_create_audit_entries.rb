class CreateAuditEntries < ActiveRecord::Migration[7.1]
  def change
    create_table :audit_entries do |t|
      t.references :user, null: false, foreign_key: true
      t.string :action, null: false
      t.string :auditable_type
      t.bigint :auditable_id
      t.json :changes
      t.string :ip_address
      t.text :user_agent

      t.timestamps
    end

    add_index :audit_entries, [:auditable_type, :auditable_id]
    add_index :audit_entries, :action
    add_index :audit_entries, :created_at
  end
end
