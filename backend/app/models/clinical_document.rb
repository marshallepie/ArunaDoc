class ClinicalDocument < ApplicationRecord
  belongs_to :consultation
  belongs_to :approved_by, class_name: 'User', optional: true

  enum status: {
    draft: 0,
    approved: 1,
    sent: 2
  }

  enum document_type: {
    soap_note: 0,
    patient_letter: 1,
    gp_letter: 2,
    referral_letter: 3,
    insurance_letter: 4
  }

  validates :document_type, presence: true
  validates :content, presence: true

  def approve!(user)
    update!(
      status: :approved,
      approved_by: user,
      approved_at: Time.current
    )
  end
end
