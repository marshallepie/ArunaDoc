class Patient < ApplicationRecord
  belongs_to :user
  has_many :consultations, dependent: :destroy

  validates :name, presence: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :phone, format: { with: /\A[\d\s\-\+\(\)]+\z/ }, allow_blank: true

  def age
    return nil unless date_of_birth

    today = Date.today
    age = today.year - date_of_birth.year
    age -= 1 if today < date_of_birth + age.years
    age
  end
end
