# frozen_string_literal: true

Devise.setup do |config|
  # JWT configuration for devise-jwt
  config.jwt do |jwt|
    # Secret key for signing JWTs
    # In production, set this via Rails credentials or environment variable
    jwt.secret = ENV.fetch('JWT_SECRET_KEY') do
      Rails.application.credentials.jwt_secret_key ||
        '0261c6e7ed580692adaf8f27da407204a3f71158fe7cd54b6776fb9bf381cb10bda45bed29b05065574e0c30e246b972941e786425fd137bf32e9c16ed8a2659'
    end

    # Dispatch JWT tokens on these endpoints (login)
    jwt.dispatch_requests = [
      ['POST', %r{^/api/v1/auth/sign_in$}]
    ]

    # Revoke JWT tokens on these endpoints (logout)
    jwt.revocation_requests = [
      ['DELETE', %r{^/api/v1/auth/sign_out$}]
    ]

    # JWT expiration time (15 minutes for security)
    jwt.expiration_time = 15.minutes.to_i

    # JWT algorithm
    jwt.aud_header = 'JWT_AUD'
  end
end
