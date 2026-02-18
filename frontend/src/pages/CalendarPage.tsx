import { useState } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'

interface CalendarEvent {
  id: number
  title: string
  patient: string
  date: string
  start_time: string
  end_time: string
  type: 'consultation' | 'surgery' | 'meeting' | 'other'
  status: 'confirmed' | 'tentative' | 'cancelled'
}

// Mock data
const mockEvents: CalendarEvent[] = [
  {
    id: 1,
    title: 'Initial Consultation',
    patient: 'John Smith',
    date: '2026-02-18',
    start_time: '09:00',
    end_time: '10:00',
    type: 'consultation',
    status: 'confirmed',
  },
  {
    id: 2,
    title: 'Follow-up Consultation',
    patient: 'Emma Wilson',
    date: '2026-02-18',
    start_time: '10:30',
    end_time: '11:30',
    type: 'consultation',
    status: 'confirmed',
  },
  {
    id: 3,
    title: 'Team Meeting',
    patient: 'N/A',
    date: '2026-02-18',
    start_time: '13:00',
    end_time: '14:00',
    type: 'meeting',
    status: 'confirmed',
  },
  {
    id: 4,
    title: 'Initial Consultation',
    patient: 'Sophie Davis',
    date: '2026-02-19',
    start_time: '11:00',
    end_time: '12:00',
    type: 'consultation',
    status: 'confirmed',
  },
]

export const CalendarPage = () => {
  const [events] = useState<CalendarEvent[]>(mockEvents)
  const [selectedDate, setSelectedDate] = useState('2026-02-18')
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day')

  const todayEvents = events.filter((event) => event.date === selectedDate)

  const getTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'surgery':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'meeting':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="mt-1 text-sm text-gray-600">Schedule and manage appointments</p>
        </div>

        {/* View Mode Selector */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex rounded-lg shadow-sm">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                  viewMode === 'day'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 text-sm font-medium border-t border-b ${
                  viewMode === 'week'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                  viewMode === 'month'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
            </div>

            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Appointment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Widget */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">February 2026</h2>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {Array.from({ length: 28 }, (_, i) => {
                  const day = i + 1
                  const hasEvents = events.some((e) => e.date === `2026-02-${String(day).padStart(2, '0')}`)
                  const isSelected = selectedDate === `2026-02-${String(day).padStart(2, '0')}`
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(`2026-02-${String(day).padStart(2, '0')}`)}
                      className={`aspect-square p-2 rounded-lg text-sm font-medium ${
                        isSelected
                          ? 'bg-primary-600 text-white'
                          : hasEvents
                          ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                    <span className="text-gray-700">Consultations</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-400 mr-2"></span>
                    <span className="text-gray-700">Surgeries</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-purple-400 mr-2"></span>
                    <span className="text-gray-700">Meetings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Schedule for {new Date(selectedDate).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </h2>
              </div>
              <div className="p-6">
                {todayEvents.length === 0 ? (
                  <div className="text-center py-12">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                    <p className="mt-1 text-sm text-gray-500">No appointments scheduled for this day.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`border-l-4 rounded-lg p-4 ${getTypeColor(event.type)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold">{event.title}</h3>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-white bg-opacity-50 capitalize">
                                {event.type}
                              </span>
                            </div>
                            <p className="text-sm mt-1">
                              {event.patient !== 'N/A' && (
                                <span className="font-medium">Patient: {event.patient}</span>
                              )}
                            </p>
                            <p className="text-xs mt-1">
                              {event.start_time} - {event.end_time}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button className="text-xs px-3 py-1 bg-white rounded-md hover:bg-gray-50">
                              View
                            </button>
                            <button className="text-xs px-3 py-1 bg-white rounded-md hover:bg-gray-50">
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📅</span>
                  <div>
                    <p className="text-xs text-gray-500">Today's Total</p>
                    <p className="text-lg font-semibold text-gray-900">{todayEvents.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📊</span>
                  <div>
                    <p className="text-xs text-gray-500">This Week</p>
                    <p className="text-lg font-semibold text-gray-900">{events.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⏱️</span>
                  <div>
                    <p className="text-xs text-gray-500">Hours Scheduled</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {todayEvents.reduce((sum, event) => {
                        const [startHour, startMin] = event.start_time.split(':').map(Number)
                        const [endHour, endMin] = event.end_time.split(':').map(Number)
                        return sum + (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60
                      }, 0).toFixed(1)}h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
