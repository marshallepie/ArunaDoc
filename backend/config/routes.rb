Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Custom health check
  get '/health', to: 'health#index'

  # API routes will be namespaced under /api/v1
  namespace :api do
    namespace :v1 do
      # Authentication routes
      devise_for :users,
                 path: 'auth',
                 path_names: {
                   sign_in: 'sign_in',
                   sign_out: 'sign_out',
                   registration: 'sign_up'
                 },
                 controllers: {
                   sessions: 'api/v1/auth/sessions',
                   registrations: 'api/v1/auth/registrations'
                 }

      # Test endpoint for debugging
      post 'test/echo', to: 'test#echo'

      # Resource routes
      resources :patients
      resources :consultations do
        member do
          post :upload_recording
        end
      end
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
