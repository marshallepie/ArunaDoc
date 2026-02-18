class ApplicationController < ActionController::API
  # Add Devise support for API mode
  include ActionController::MimeResponds

  # JWT authentication via Warden
  def authenticate_user!
    warden.authenticate!(:jwt)
  end

  def current_user
    warden.user
  end

  def warden
    request.env['warden']
  end
end
