import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { consultationApi } from '../services/api'

interface Consultation {
  id: number
  patient_name: string
  patient_id: number
  date: string
  time: string
  type: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  processing_status: string
  consultant: string
  notes?: string
  recording_url?: string
  created_at: string
}

export const ConsultationDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadConsultation()
  }, [id])

  const loadConsultation = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await consultationApi.getOne(parseInt(id!))
      setConsultation(response.data)
    } catch (err: any) {
      console.error('Error loading consultation:', err)
      setError(err.response?.data?.error || err.message || 'Failed to load consultation')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Consultation['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading consultation...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !consultation) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Consultation</h3>
            <p className="text-red-600 text-sm mb-4">{error || 'Consultation not found'}</p>
            <button
              onClick={() => navigate('/consultations')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Back to Consultations
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/consultations')}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Consultations
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Consultation Details</h1>
              <p className="mt-1 text-sm text-gray-600">
                {formatDate(consultation.date)} at {consultation.time}
              </p>
            </div>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusColor(
                consultation.status
              )}`}
            >
              {consultation.status.replace('-', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Consultation Info Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Consultation Information</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Patient</dt>
                  <dd className="mt-1 text-sm text-gray-900">{consultation.patient_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Consultation Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{consultation.type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(consultation.date)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Time</dt>
                  <dd className="mt-1 text-sm text-gray-900">{consultation.time}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Consultant</dt>
                  <dd className="mt-1 text-sm text-gray-900">{consultation.consultant}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Processing Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {consultation.processing_status.replace('_', ' ')}
                  </dd>
                </div>
              </dl>
              {consultation.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <dt className="text-sm font-medium text-gray-500 mb-2">Notes</dt>
                  <dd className="text-sm text-gray-900 whitespace-pre-wrap">{consultation.notes}</dd>
                </div>
              )}
            </div>

            {/* Recording Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Audio Recording</h2>
              {consultation.recording_url ? (
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-green-600">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Recording uploaded
                  </div>
                  <audio controls className="w-full">
                    <source src={consultation.recording_url} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">No recording uploaded yet</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Record audio during the consultation or upload an existing recording
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                      Record Audio
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Upload File
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Transcript Section (Placeholder) */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Transcript</h2>
              <div className="text-center py-8 text-sm text-gray-500">
                <p>Transcript will appear here after the recording is processed</p>
              </div>
            </div>

            {/* Clinical Documents Section (Placeholder) */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Clinical Documents</h2>
              <div className="text-center py-8 text-sm text-gray-500">
                <p>AI-generated documents will appear here after processing</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Actions Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300">
                  Edit Consultation
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300">
                  View Patient Record
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md border border-red-300">
                  Cancel Consultation
                </button>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Timeline</h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Consultation scheduled
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time>{new Date(consultation.created_at).toLocaleDateString()}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
