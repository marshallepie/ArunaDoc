class AuditEntry < ApplicationRecord
  belongs_to :user
  belongs_to :auditable, polymorphic: true, optional: true

  validates :action, presence: true

  scope :recent, -> { order(created_at: :desc).limit(100) }
  scope :by_action, ->(action) { where(action: action) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }

  def self.log(user:, action:, auditable: nil, changes: nil, request: nil)
    create!(
      user: user,
      action: action,
      auditable: auditable,
      changes: changes,
      ip_address: request&.remote_ip,
      user_agent: request&.user_agent
    )
  end
end
