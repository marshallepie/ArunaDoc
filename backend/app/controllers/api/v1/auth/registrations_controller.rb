# frozen_string_literal: true

module Api
  module V1
    module Auth
      class RegistrationsController < Devise::RegistrationsController
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          if resource.persisted?
            render json: {
              message: 'Account created successfully',
              user: UserSerializer.new(resource).serializable_hash[:data][:attributes]
            }, status: :created
          else
            render json: {
              message: 'Account creation failed',
              errors: resource.errors.full_messages
            }, status: :unprocessable_entity
          end
        end
      end
    end
  end
end
