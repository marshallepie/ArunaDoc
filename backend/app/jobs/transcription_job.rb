class TranscriptionJob < ApplicationJob
  queue_as :default

  # Retry strategy for transient failures
  retry_on StandardError, wait: :exponentially_longer, attempts: 3

  def perform(consultation_id)
    consultation = Consultation.find(consultation_id)

    # Update status to transcribing
    consultation.update!(processing_status: :transcribing)

    begin
      # Get the audio file path
      audio_path = Rails.root.join('public', consultation.recording_url.delete_prefix('/'))

      unless File.exist?(audio_path)
        raise "Audio file not found: #{audio_path}"
      end

      Rails.logger.info "Starting transcription for consultation #{consultation_id}"
      Rails.logger.info "Audio file: #{audio_path} (#{File.size(audio_path)} bytes)"

      # Call OpenAI Whisper API
      client = OpenAI::Client.new

      response = client.audio.transcribe(
        parameters: {
          model: "whisper-1",
          file: File.open(audio_path, "rb"),
          language: "en", # Specify English for better accuracy
          response_format: "verbose_json", # Get timestamps and word-level data
          timestamp_granularities: ["segment"] # Get segment timestamps
        }
      )

      Rails.logger.info "Transcription completed for consultation #{consultation_id}"
      Rails.logger.debug "Transcription response: #{response.inspect}"

      # Extract the transcription text
      transcript_text = response.dig("text")

      unless transcript_text.present?
        raise "No transcript text returned from API"
      end

      # Extract segments with timestamps (for speaker diarization later)
      segments = response.dig("segments") || []

      # Store the transcript
      transcript = consultation.transcript || consultation.build_transcript
      transcript.update!(
        raw_transcript: transcript_text,
        speaker_labels: { segments: segments }, # Store segments for future use
        processing_status: :completed
      )

      # Update consultation status
      consultation.update!(
        processing_status: :extracting
      )

      # Trigger next job: AI extraction of structured data
      Rails.logger.info "Triggering extraction job for consultation #{consultation_id}"
      ExtractionJob.perform_later(consultation_id)

    rescue OpenAI::Error => e
      Rails.logger.error "OpenAI API error for consultation #{consultation_id}: #{e.message}"
      handle_transcription_error(consultation, "OpenAI API error: #{e.message}")
    rescue => e
      Rails.logger.error "Transcription error for consultation #{consultation_id}: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      handle_transcription_error(consultation, e.message)
    end
  end

  private

  def handle_transcription_error(consultation, error_message)
    # Update transcript with error
    transcript = consultation.transcript || consultation.build_transcript
    transcript.update(
      processing_status: :failed,
      error_message: error_message
    )

    # Update consultation status
    consultation.update(processing_status: :failed)

    # TODO: Send notification to user about failure
    # NotificationService.notify_transcription_failed(consultation)
  end
end
