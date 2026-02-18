class DocumentGenerationJob < ApplicationJob
  queue_as :default

  retry_on StandardError, wait: :exponentially_longer, attempts: 3

  def perform(consultation_id)
    consultation = Consultation.find(consultation_id)
    transcript = consultation.transcript

    unless transcript&.structured_data.present?
      raise "No structured data available for consultation #{consultation_id}"
    end

    # Update status
    consultation.update!(processing_status: :generating_documents)

    begin
      Rails.logger.info "Starting document generation for consultation #{consultation_id}"

      structured_data = transcript.structured_data

      # Generate SOAP note (always generated)
      generate_soap_note(consultation, structured_data)

      # Generate letters based on requirements
      letters_required = structured_data['letters_required'] || []
      letters_required.each do |letter_type|
        generate_letter(consultation, structured_data, letter_type)
      end

      Rails.logger.info "Document generation completed for consultation #{consultation_id}"

      # Update consultation status to ready for review
      consultation.update!(processing_status: :ready_for_review)

      # TODO: Notify user that documents are ready
      # NotificationService.notify_documents_ready(consultation)

    rescue => e
      Rails.logger.error "Document generation error for consultation #{consultation_id}: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      consultation.update(processing_status: :failed)
      raise
    end
  end

  private

  def generate_soap_note(consultation, structured_data)
    Rails.logger.info "Generating SOAP note for consultation #{consultation.id}"

    prompt = <<~PROMPT
      Generate a professional SOAP note (Subjective, Objective, Assessment, Plan) based on the following structured data from a medical consultation.

      CONSULTATION DETAILS:
      - Date: #{consultation.consultation_date}
      - Type: #{consultation.consultation_type}
      - Patient: #{consultation.patient.name}
      #{consultation.patient.age ? "- Age: #{consultation.patient.age}" : ""}

      EXTRACTED DATA:
      - Presenting Complaint: #{structured_data['presenting_complaint']}
      - History: #{structured_data['history']}
      - Examination: #{structured_data['examination_findings']}
      - Diagnosis: #{structured_data['diagnosis']}
      - Treatment: #{structured_data['treatment_plan']}
      - Follow-up: #{structured_data['follow_up_plan']}

      Generate a complete, professional SOAP note following standard medical documentation format. Be clear, concise, and clinically appropriate.
    PROMPT

    content = call_claude_for_generation(prompt)

    # Create the SOAP note document
    consultation.clinical_documents.create!(
      document_type: :soap_note,
      content: content,
      status: :draft,
      version: 1
    )

    Rails.logger.info "SOAP note generated for consultation #{consultation.id}"
  end

  def generate_letter(consultation, structured_data, letter_type)
    # Map letter types to document types
    doc_type = case letter_type.downcase
    when /gp.*letter/, /referral.*gp/
      :gp_letter
    when /patient.*letter/
      :patient_letter
    when /referral.*letter/
      :referral_letter
    when /insurance/
      :insurance_letter
    else
      Rails.logger.warn "Unknown letter type: #{letter_type}, skipping"
      return
    end

    Rails.logger.info "Generating #{doc_type} for consultation #{consultation.id}"

    prompt = build_letter_prompt(consultation, structured_data, doc_type)
    content = call_claude_for_generation(prompt)

    consultation.clinical_documents.create!(
      document_type: doc_type,
      content: content,
      status: :draft,
      version: 1
    )

    Rails.logger.info "#{doc_type} generated for consultation #{consultation.id}"
  end

  def build_letter_prompt(consultation, structured_data, doc_type)
    patient = consultation.patient

    case doc_type
    when :gp_letter
      <<~PROMPT
        Generate a professional letter to the patient's GP summarizing a recent consultation.

        PATIENT: #{patient.name}#{patient.date_of_birth ? " (DOB: #{patient.date_of_birth})" : ""}
        CONSULTATION DATE: #{consultation.consultation_date}

        CLINICAL SUMMARY:
        - Presenting Complaint: #{structured_data['presenting_complaint']}
        - Diagnosis: #{structured_data['diagnosis']}
        - Treatment: #{structured_data['treatment_plan']}
        - Follow-up: #{structured_data['follow_up_plan']}

        Generate a formal letter addressed "Dear Dr. [GP Name]," with proper formatting for UK medical correspondence.
        Include all relevant clinical information and management plan.
      PROMPT
    when :patient_letter
      <<~PROMPT
        Generate a patient-friendly letter summarizing the consultation and next steps.

        PATIENT: #{patient.name}
        CONSULTATION DATE: #{consultation.consultation_date}

        KEY POINTS:
        - Why they attended: #{structured_data['presenting_complaint']}
        - What we found: #{structured_data['diagnosis']}
        - Treatment plan: #{structured_data['treatment_plan']}
        - Next steps: #{structured_data['follow_up_plan']}

        Write in clear, non-medical language that the patient can understand. Be reassuring and informative.
        Start with "Dear #{patient.name},"
      PROMPT
    when :referral_letter
      <<~PROMPT
        Generate a specialist referral letter based on consultation findings.

        PATIENT: #{patient.name}#{patient.date_of_birth ? " (DOB: #{patient.date_of_birth})" : ""}
        CONSULTATION DATE: #{consultation.consultation_date}

        CLINICAL DETAILS:
        - Presenting Complaint: #{structured_data['presenting_complaint']}
        - History: #{structured_data['history']}
        - Examination: #{structured_data['examination_findings']}
        - Working Diagnosis: #{structured_data['diagnosis']}

        Generate a formal referral letter addressed "Dear Colleague," with clear reason for referral and relevant clinical information.
      PROMPT
    when :insurance_letter
      <<~PROMPT
        Generate a medical report for insurance purposes documenting the consultation.

        PATIENT: #{patient.name}#{patient.date_of_birth ? " (DOB: #{patient.date_of_birth})" : ""}
        CONSULTATION DATE: #{consultation.consultation_date}

        CLINICAL FINDINGS:
        - Presenting Complaint: #{structured_data['presenting_complaint']}
        - Diagnosis: #{structured_data['diagnosis']}
        - Treatment: #{structured_data['treatment_plan']}

        Generate a factual, objective medical report suitable for insurance documentation.
        Use formal medical language and include all relevant clinical details.
      PROMPT
    end
  end

  def call_claude_for_generation(prompt)
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

    parsed_response = JSON.parse(response.body)
    content = parsed_response.dig('content', 0, 'text')

    unless content.present?
      raise "No content in Claude API response"
    end

    content
  end
end
