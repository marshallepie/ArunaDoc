module Api
  module V1
    class ConsultationsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_consultation, only: [:show, :update, :destroy, :upload_recording, :upload_audio]

      # GET /api/v1/consultations
      def index
        @consultations = current_user.consultations
          .includes(:patient)
          .order(consultation_date: :desc, consultation_time: :desc)

        # Filter by status if provided
        @consultations = @consultations.by_status(params[:status]) if params[:status].present?

        render json: @consultations.map { |c| consultation_json(c) }
      end

      # GET /api/v1/consultations/:id
      def show
        render json: consultation_detail_json(@consultation)
      end

      # POST /api/v1/consultations
      def create
        @consultation = current_user.consultations.build(consultation_params)

        if @consultation.save
          AuditEntry.log(
            user: current_user,
            action: 'create_consultation',
            auditable: @consultation,
            request: request
          )
          render json: consultation_json(@consultation), status: :created
        else
          render json: { errors: @consultation.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/consultations/:id
      def update
        if @consultation.update(consultation_params)
          AuditEntry.log(
            user: current_user,
            action: 'update_consultation',
            auditable: @consultation,
            changes: @consultation.previous_changes,
            request: request
          )
          render json: consultation_json(@consultation)
        else
          render json: { errors: @consultation.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/consultations/:id
      def destroy
        @consultation.destroy
        AuditEntry.log(
          user: current_user,
          action: 'delete_consultation',
          auditable: @consultation,
          request: request
        )
        head :no_content
      end

      # POST /api/v1/consultations/:id/upload_recording
      def upload_recording
        # TODO: Implement file upload and trigger transcription
        # For now, just update the recording_url
        if params[:recording_url].present?
          @consultation.update(
            recording_url: params[:recording_url],
            processing_status: :transcribing
          )

          # TODO: Trigger background job for transcription
          # TranscriptionJob.perform_later(@consultation.id)

          render json: consultation_json(@consultation)
        else
          render json: { error: 'Recording URL required' }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/consultations/:id/upload_audio
      def upload_audio
        unless params[:audio].present?
          return render json: { error: 'Audio file required' }, status: :unprocessable_entity
        end

        audio_file = params[:audio]

        # Validate file type
        allowed_types = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/x-m4a', 'audio/m4a']
        unless allowed_types.include?(audio_file.content_type) || audio_file.original_filename.match?(/\.(mp3|wav|webm|ogg|m4a)$/i)
          return render json: { error: 'Invalid audio file type. Accepted formats: MP3, WAV, WebM, OGG, M4A' }, status: :unprocessable_entity
        end

        # Validate file size (500MB max)
        max_size = 500.megabytes
        if audio_file.size > max_size
          return render json: { error: 'File too large. Maximum size is 500MB' }, status: :unprocessable_entity
        end

        begin
          # Create uploads directory if it doesn't exist
          uploads_dir = Rails.root.join('public', 'uploads', 'recordings')
          FileUtils.mkdir_p(uploads_dir)

          # Generate unique filename
          timestamp = Time.now.strftime('%Y%m%d%H%M%S')
          extension = File.extname(audio_file.original_filename)
          filename = "consultation_#{@consultation.id}_#{timestamp}#{extension}"
          filepath = uploads_dir.join(filename)

          # Save the file
          File.open(filepath, 'wb') do |file|
            file.write(audio_file.read)
          end

          # Store the URL
          recording_url = "/uploads/recordings/#{filename}"

          @consultation.update!(
            recording_url: recording_url,
            processing_status: :transcribing,
            status: :in_progress
          )

          # Log the upload
          AuditEntry.log(
            user: current_user,
            action: 'upload_audio',
            auditable: @consultation,
            changes: { recording_url: recording_url },
            request: request
          )

          # Trigger background job for transcription
          TranscriptionJob.perform_later(@consultation.id)

          render json: consultation_detail_json(@consultation), status: :ok
        rescue => e
          Rails.logger.error "Error uploading audio: #{e.message}"
          render json: { error: 'Failed to upload audio file' }, status: :internal_server_error
        end
      end

      private

      def set_consultation
        @consultation = current_user.consultations.find(params[:id])
      end

      def consultation_params
        params.require(:consultation).permit(
          :patient_id,
          :consultation_date,
          :consultation_time,
          :consultation_type,
          :status,
          :notes
        )
      end

      def consultation_json(consultation)
        {
          id: consultation.id,
          patient_name: consultation.patient.name,
          patient_id: consultation.patient_id,
          date: consultation.consultation_date,
          time: consultation.consultation_time.strftime('%H:%M'),
          type: consultation.consultation_type,
          status: consultation.status,
          processing_status: consultation.processing_status,
          consultant: consultation.user.full_name,
          notes: consultation.notes,
          recording_url: consultation.recording_url,
          created_at: consultation.created_at,
          updated_at: consultation.updated_at
        }
      end

      def consultation_detail_json(consultation)
        consultation_json(consultation).merge(
          patient: {
            id: consultation.patient.id,
            name: consultation.patient.name,
            email: consultation.patient.email,
            phone: consultation.patient.phone,
            age: consultation.patient.age
          },
          transcript: consultation.transcript&.as_json(
            only: [:id, :raw_transcript, :structured_data, :processing_status]
          ),
          clinical_documents: consultation.clinical_documents.map do |doc|
            {
              id: doc.id,
              document_type: doc.document_type,
              status: doc.status,
              approved_at: doc.approved_at
            }
          end
        )
      end
    end
  end
end
