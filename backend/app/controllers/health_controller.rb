class HealthController < ApplicationController
  def index
    render json: {
      status: 'ok',
      timestamp: Time.current,
      database: database_status,
      redis: redis_status
    }
  end

  private

  def database_status
    ActiveRecord::Base.connection.active? ? 'connected' : 'disconnected'
  rescue StandardError
    'disconnected'
  end

  def redis_status
    Redis.new(url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/0')).ping == 'PONG' ? 'connected' : 'disconnected'
  rescue StandardError
    'disconnected'
  end
end
