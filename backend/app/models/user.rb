class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  # Enums for roles and status
  enum role: { consultant: 0, secretary: 1, admin: 2 }
  enum status: { active: 0, inactive: 1, suspended: 2 }

  # Validations
  validates :email, presence: true, uniqueness: true
  validates :role, presence: true
  validates :status, presence: true

  # Scopes
  scope :active, -> { where(status: :active) }
  scope :consultants, -> { where(role: :consultant) }

  # Methods
  def full_name
    "#{first_name} #{last_name}".strip.presence || email
  end

  def active_for_authentication?
    super && active?
  end

  def inactive_message
    active? ? super : :account_inactive
  end
end
