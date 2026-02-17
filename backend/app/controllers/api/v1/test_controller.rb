module Api
  module V1
    class TestController < ActionController::API
      def echo
        render json: {
          received_params: params.to_unsafe_h,
          request_body: request.raw_post,
          content_type: request.content_type,
          format: request.format.to_s
        }
      end
    end
  end
end
