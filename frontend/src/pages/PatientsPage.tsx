import { useState } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'

interface Patient {
  id: number
  name: string
  email: string
  phone: string
  date_of_birth: string
  last_visit: string
  status: 'active' | 'inactive'
  upcoming_appointments: number
}

// Mock data
const mockPatients: Patient[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+44 20 1234 5678',
    date_of_birth: '1985-06-15',
    last_visit: '2026-02-10',
    status: 'active',
    upcoming_appointments: 1,
  },
  {
    id: 2,
    name: 'Emma Wilson',
    email: 'emma.wilson@email.com',
    phone: '+44 20 2345 6789',
    date_of_birth: '1990-03-22',
    last_visit: '2026-02-18',
    status: 'active',
    upcoming_appointments: 0,
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '+44 20 3456 7890',
    date_of_birth: '1978-11-08',
    last_visit: '2026-02-17',
    status: 'active',
    upcoming_appointments: 0,
  },
  {
    id: 4,
    name: 'Sophie Davis',
    email: 'sophie.davis@email.com',
    phone: '+44 20 4567 8901',
    date_of_birth: '1995-09-30',
    last_visit: '2026-01-25',
    status: 'active',
    upcoming_appointments: 1,
  },
]

export const PatientsPage = () => {
  const [patients] = useState<Patient[]>(mockPatients)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewPatientModal, setShowNewPatientModal] = useState(false)

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Patients</h1>
          <p className="mt-1 text-sm text-gray-600">Manage patient records and information</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">👥</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{patients.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">✅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Patients</dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {patients.filter((p) => p.status === 'active').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">📅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Appointments</dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {patients.reduce((sum, p) => sum + p.upcoming_appointments, 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">🆕</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">New This Month</dt>
                    <dd className="text-2xl font-semibold text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">
                Search patients
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={() => setShowNewPatientModal(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Patient
            </button>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.length === 0 ? (
            <div className="col-span-full bg-white shadow rounded-lg p-12 text-center">
              <p className="text-sm text-gray-500">No patients found</p>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div key={patient.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xl font-semibold text-primary-600">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-500">{calculateAge(patient.date_of_birth)} years old</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        patient.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {patient.status}
                    </span>
                  </div>

                  <dl className="space-y-2">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900 truncate">{patient.email}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Phone</dt>
                      <dd className="text-sm text-gray-900">{patient.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Last Visit</dt>
                      <dd className="text-sm text-gray-900">{formatDate(patient.last_visit)}</dd>
                    </div>
                    {patient.upcoming_appointments > 0 && (
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-xs font-medium text-primary-600">
                          {patient.upcoming_appointments} upcoming appointment{patient.upcoming_appointments > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </dl>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100">
                      View Record
                    </button>
                    <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Patient Modal Placeholder */}
        {showNewPatientModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowNewPatientModal(false)} />
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Patient</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Patient registration form will be implemented here. This will allow you to add new patients
                        with all necessary demographic and medical information.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                    onClick={() => setShowNewPatientModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
