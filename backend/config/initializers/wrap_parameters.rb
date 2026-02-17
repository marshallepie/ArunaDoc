# Be sure to restart your server when you modify this file.

# This file contains settings for ActionController::ParamsWrapper which
# is enabled by default for API-only applications.

# Enable parameter wrapping for JSON. You can disable this by setting :format to an empty array.
ActiveSupport.on_load(:action_controller) do
  # Wrap parameters for API controllers
  # For Devise, we need to ensure parameters are NOT wrapped in extra nesting
  wrap_parameters format: []
end
