class Consultation < ApplicationRecord
  belongs_to :patient
  belongs_to :user
  has_one :transcript, dependent: :destroy
  has_many :clinical_documents, dependent: :destroy

  enum status: {
    scheduled: 0,
    in_progress: 1,
    completed: 2,
    cancelled: 3
  }

  enum processing_status: {
    pending: 0,
    transcribing: 1,
    extracting: 2,
    generating_documents: 3,
    ready_for_review: 4,
    approved: 5,
    failed: 6
  }

  validates :consultation_date, presence: true
  validates :consultation_time, presence: true
  validates :consultation_type, presence: true

  scope :upcoming, -> { where('consultation_date >= ?', Date.today).order(:consultation_date, :consultation_time) }
  scope :past, -> { where('consultation_date < ?', Date.today).order(consultation_date: :desc) }
  scope :by_status, ->(status) { where(status: status) if status.present? }

  def formatted_datetime
    "#{consultation_date.strftime('%d %b %Y')} at #{consultation_time.strftime('%H:%M')}"
  end
end
