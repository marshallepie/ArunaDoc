# frozen_string_literal: true

module Api
  module V1
    module Auth
      class SessionsController < Devise::SessionsController
        respond_to :json
        skip_before_action :verify_signed_out_user, only: :destroy

        # Disable parameter wrapping for this controller
        wrap_parameters false

        # Override create to manually authenticate
        def create
          user = User.find_by(email: sign_in_params[:email])

          if user&.valid_password?(sign_in_params[:password])
            sign_in(user)
            render json: {
              message: 'Logged in successfully',
              user: UserSerializer.new(user).serializable_hash[:data][:attributes]
            }, status: :ok
          else
            render json: {
              message: 'Invalid email or password',
              errors: ['Invalid email or password']
            }, status: :unauthorized
          end
        end

        private

        def sign_in_params
          params.require(:user).permit(:email, :password)
        end

        def respond_with(resource, _opts = {})
          if resource.persisted?
            render json: {
              message: 'Logged in successfully',
              user: UserSerializer.new(resource).serializable_hash[:data][:attributes]
            }, status: :ok
          else
            render json: {
              message: 'Invalid email or password',
              errors: ['Invalid email or password']
            }, status: :unauthorized
          end
        end

        def respond_to_on_destroy
          # JWT is automatically revoked by devise-jwt middleware
          render json: {
            message: 'Logged out successfully'
          }, status: :ok
        end
      end
    end
  end
end
