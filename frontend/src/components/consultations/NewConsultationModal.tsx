import { useState, useEffect } from 'react'
import { consultationApi, patientApi } from '../../services/api'

interface NewConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Patient {
  id: number
  name: string
  email?: string
}

export const NewConsultationModal = ({ isOpen, onClose, onSuccess }: NewConsultationModalProps) => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    patient_id: '',
    consultation_date: new Date().toISOString().split('T')[0],
    consultation_time: '09:00',
    consultation_type: 'Initial Consultation',
    notes: '',
  })

  useEffect(() => {
    if (isOpen) {
      loadPatients()
    }
  }, [isOpen])

  const loadPatients = async () => {
    try {
      setLoadingPatients(true)
      const response = await patientApi.getAll()
      setPatients(response.data)
    } catch (err) {
      console.error('Error loading patients:', err)
      setError('Failed to load patients')
    } finally {
      setLoadingPatients(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patient_id) {
      setError('Please select a patient')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      await consultationApi.create({
        ...formData,
        patient_id: parseInt(formData.patient_id),
        status: 'scheduled',
      })
      onSuccess()
      onClose()
      // Reset form
      setFormData({
        patient_id: '',
        consultation_date: new Date().toISOString().split('T')[0],
        consultation_time: '09:00',
        consultation_type: 'Initial Consultation',
        notes: '',
      })
    } catch (err: any) {
      console.error('Error creating consultation:', err)
      setError(err.response?.data?.errors?.join(', ') || 'Failed to create consultation')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Schedule New Consultation</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a new consultation appointment for a patient.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient Selection */}
            <div>
              <label htmlFor="patient" className="block text-sm font-medium text-gray-700">
                Patient *
              </label>
              <select
                id="patient"
                required
                disabled={loadingPatients}
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">
                  {loadingPatients ? 'Loading patients...' : 'Select a patient'}
                </option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} {patient.email ? `(${patient.email})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                type="date"
                id="date"
                required
                value={formData.consultation_date}
                onChange={(e) => setFormData({ ...formData, consultation_date: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            {/* Time */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                Time *
              </label>
              <input
                type="time"
                id="time"
                required
                value={formData.consultation_time}
                onChange={(e) => setFormData({ ...formData, consultation_time: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Consultation Type *
              </label>
              <select
                id="type"
                required
                value={formData.consultation_type}
                onChange={(e) => setFormData({ ...formData, consultation_type: e.target.value })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="Initial Consultation">Initial Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Review">Review</option>
                <option value="Emergency">Emergency</option>
                <option value="Remote Consultation">Remote Consultation</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Any additional notes..."
              />
            </div>

            {/* Buttons */}
            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Consultation'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
