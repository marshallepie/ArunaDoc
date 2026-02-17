# frozen_string_literal: true

class UserSerializer
  def initialize(user)
    @user = user
  end

  def serializable_hash
    {
      data: {
        attributes: {
          id: @user.id,
          email: @user.email,
          first_name: @user.first_name,
          last_name: @user.last_name,
          full_name: @user.full_name,
          role: @user.role,
          status: @user.status,
          gmc_number: @user.gmc_number,
          created_at: @user.created_at
        }
      }
    }
  end
end
