module Api
  module V1
    class PatientsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_patient, only: [:show, :update, :destroy]

      # GET /api/v1/patients
      def index
        @patients = current_user.patients.order(created_at: :desc)
        render json: @patients
      end

      # GET /api/v1/patients/:id
      def show
        render json: @patient, include: { consultations: { only: [:id, :consultation_date, :status] } }
      end

      # POST /api/v1/patients
      def create
        @patient = current_user.patients.build(patient_params)

        if @patient.save
          AuditEntry.log(
            user: current_user,
            action: 'create_patient',
            auditable: @patient,
            request: request
          )
          render json: @patient, status: :created
        else
          render json: { errors: @patient.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/patients/:id
      def update
        if @patient.update(patient_params)
          AuditEntry.log(
            user: current_user,
            action: 'update_patient',
            auditable: @patient,
            changes: @patient.previous_changes,
            request: request
          )
          render json: @patient
        else
          render json: { errors: @patient.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/patients/:id
      def destroy
        @patient.destroy
        AuditEntry.log(
          user: current_user,
          action: 'delete_patient',
          auditable: @patient,
          request: request
        )
        head :no_content
      end

      private

      def set_patient
        @patient = current_user.patients.find(params[:id])
      end

      def patient_params
        params.require(:patient).permit(
          :name,
          :date_of_birth,
          :email,
          :phone,
          :address,
          :medical_history
        )
      end
    end
  end
end
