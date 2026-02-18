class Transcript < ApplicationRecord
  belongs_to :consultation

  enum processing_status: {
    pending: 0,
    processing: 1,
    completed: 2,
    failed: 3
  }

  # Structured data will contain:
  # {
  #   presenting_complaint: "...",
  #   history: "...",
  #   examination_findings: "...",
  #   diagnosis: "...",
  #   treatment_plan: "...",
  #   follow_up_plan: "...",
  #   billing_triggers: [...],
  #   letters_required: [...]
  # }

  def presenting_complaint
    structured_data&.dig('presenting_complaint')
  end

  def diagnosis
    structured_data&.dig('diagnosis')
  end

  def treatment_plan
    structured_data&.dig('treatment_plan')
  end
end
