module Api
  module V1
    class ClinicalDocumentsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_consultation
      before_action :set_document, only: [:show, :update, :approve]

      # GET /api/v1/consultations/:consultation_id/documents/:id
      def show
        render json: document_json(@document)
      end

      # PATCH /api/v1/consultations/:consultation_id/documents/:id
      def update
        if @document.status == 'approved'
          return render json: { error: 'Cannot edit an approved document. Create a new version instead.' }, status: :unprocessable_entity
        end

        if @document.update(document_params)
          # Increment version if content changed
          if @document.previous_changes.key?('content')
            @document.update(version: @document.version + 1)
          end

          AuditEntry.log(
            user: current_user,
            action: 'update_clinical_document',
            auditable: @document,
            changes: @document.previous_changes,
            request: request
          )

          render json: document_json(@document)
        else
          render json: { errors: @document.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/consultations/:consultation_id/documents/:id/approve
      def approve
        if @document.status == 'approved'
          return render json: { error: 'Document is already approved' }, status: :unprocessable_entity
        end

        @document.update!(
          status: :approved,
          approved_at: Time.current,
          approved_by_id: current_user.id
        )

        AuditEntry.log(
          user: current_user,
          action: 'approve_clinical_document',
          auditable: @document,
          request: request
        )

        # Check if all documents are approved, update consultation status
        if @consultation.clinical_documents.where.not(status: :approved).empty?
          @consultation.update(processing_status: :approved)
        end

        render json: document_json(@document)
      end

      private

      def set_consultation
        @consultation = current_user.consultations.find(params[:consultation_id])
      end

      def set_document
        @document = @consultation.clinical_documents.find(params[:id])
      end

      def document_params
        params.require(:clinical_document).permit(:content)
      end

      def document_json(document)
        {
          id: document.id,
          document_type: document.document_type,
          content: document.content,
          status: document.status,
          version: document.version,
          approved_at: document.approved_at,
          created_at: document.created_at,
          updated_at: document.updated_at
        }
      end
    end
  end
end
