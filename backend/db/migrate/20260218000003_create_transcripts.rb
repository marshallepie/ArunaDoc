class CreateTranscripts < ActiveRecord::Migration[7.1]
  def change
    create_table :transcripts do |t|
      t.references :consultation, null: false, foreign_key: true
      t.text :raw_transcript
      t.json :speaker_labels
      t.json :structured_data
      t.integer :processing_status, default: 0, null: false
      t.text :error_message

      t.timestamps
    end

    add_index :transcripts, :processing_status
  end
end
