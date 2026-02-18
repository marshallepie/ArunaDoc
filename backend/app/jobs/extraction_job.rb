class ExtractionJob < ApplicationJob
  queue_as :default

  retry_on StandardError, wait: :exponentially_longer, attempts: 3

  def perform(consultation_id)
    consultation = Consultation.find(consultation_id)
    transcript = consultation.transcript

    unless transcript&.raw_transcript.present?
      raise "No transcript available for consultation #{consultation_id}"
    end

    # Update status
    consultation.update!(processing_status: :extracting)

    begin
      Rails.logger.info "Starting data extraction for consultation #{consultation_id}"

      # Prepare the prompt for Claude
      prompt = build_extraction_prompt(transcript.raw_transcript, consultation)

      # Call Anthropic Claude API
      response = call_claude_api(prompt)

      # Parse the structured data
      structured_data = parse_extraction_response(response)

      Rails.logger.info "Extraction completed for consultation #{consultation_id}"
      Rails.logger.debug "Structured data: #{structured_data.inspect}"

      # Store the structured data in transcript
      transcript.update!(
        structured_data: structured_data,
        processing_status: :completed
      )

      # Update consultation status
      consultation.update!(processing_status: :generating_documents)

      # Trigger document generation
      Rails.logger.info "Triggering document generation for consultation #{consultation_id}"
      DocumentGenerationJob.perform_later(consultation_id)

    rescue => e
      Rails.logger.error "Extraction error for consultation #{consultation_id}: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      handle_extraction_error(consultation, transcript, e.message)
    end
  end

  private

  def build_extraction_prompt(transcript_text, consultation)
    <<~PROMPT
      You are a medical AI assistant helping to extract structured information from a consultation transcript.

      CONSULTATION DETAILS:
      - Type: #{consultation.consultation_type}
      - Date: #{consultation.consultation_date}
      - Patient: #{consultation.patient.name}

      TRANSCRIPT:
      #{transcript_text}

      TASK:
      Extract the following information from the consultation transcript and return it as a JSON object. Be thorough but concise. If information is not mentioned, use null.

      Return ONLY valid JSON in this exact format:
      {
        "presenting_complaint": "Brief description of why the patient attended",
        "history": "Relevant medical history, symptoms timeline, and patient narrative",
        "examination_findings": "Physical examination findings if mentioned",
        "diagnosis": "Working diagnosis or impression",
        "treatment_plan": "Medications, procedures, or treatments prescribed",
        "follow_up_plan": "Follow-up appointments, monitoring, or next steps",
        "billing_triggers": ["List of billable items like 'Initial consultation', 'ECG', 'Blood test' etc"],
        "letters_required": ["Types of letters needed like 'GP referral letter', 'Insurance report' etc]
      }

      Be accurate and only extract information explicitly mentioned in the transcript.
    PROMPT
  end

  def call_claude_api(prompt)
    require 'net/http'
    require 'json'

    uri = URI('https://api.anthropic.com/v1/messages')
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 120

    request = Net::HTTP::Post.new(uri.path)
    request['Content-Type'] = 'application/json'
    request['x-api-key'] = ENV.fetch('ANTHROPIC_API_KEY')
    request['anthropic-version'] = '2023-06-01'

    request.body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    }.to_json

    response = http.request(request)

    unless response.code == '200'
      raise "Claude API error: #{response.code} - #{response.body}"
    end

    JSON.parse(response.body)
  end

  def parse_extraction_response(api_response)
    # Extract the text content from Claude's response
    content = api_response.dig('content', 0, 'text')

    unless content.present?
      raise "No content in Claude API response"
    end

    # Parse the JSON from the response
    # Claude might wrap it in markdown code blocks, so strip those
    json_text = content.strip
    json_text = json_text.gsub(/^```json\s*/, '').gsub(/\s*```$/, '')

    structured_data = JSON.parse(json_text)

    # Validate required fields
    required_fields = %w[presenting_complaint history examination_findings diagnosis treatment_plan follow_up_plan billing_triggers letters_required]
    missing_fields = required_fields - structured_data.keys

    if missing_fields.any?
      Rails.logger.warn "Missing fields in extracted data: #{missing_fields.join(', ')}"
    end

    structured_data
  rescue JSON::ParserError => e
    Rails.logger.error "Failed to parse JSON from Claude response: #{e.message}"
    Rails.logger.error "Response content: #{content}"
    raise "Failed to parse structured data from AI response"
  end

  def handle_extraction_error(consultation, transcript, error_message)
    transcript.update(
      processing_status: :failed,
      error_message: error_message
    )

    consultation.update(processing_status: :failed)

    # TODO: Notify user
    # NotificationService.notify_extraction_failed(consultation)
  end
end
