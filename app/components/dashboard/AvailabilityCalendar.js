"use client"

import { useState } from 'react'

export default function AvailabilityCalendar({ availability, onUpdate }) {
  const [selectedSlots, setSelectedSlots] = useState(availability || {})
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM'
  ]

  const toggleSlot = (day, time) => {
    const key = `${day}-${time}`
    const newSelectedSlots = {
      ...selectedSlots,
      [key]: !selectedSlots[key]
    }
    setSelectedSlots(newSelectedSlots)
    onUpdate?.(newSelectedSlots)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <div className="min-w-max">
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          <div className="bg-gray-50 p-2"></div>
          {days.map(day => (
            <div key={day} className="bg-gray-50 p-2 text-center font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8 gap-px bg-gray-200">
          {timeSlots.map(time => (
            <>
              <div key={`time-${time}`} className="bg-white p-2 text-sm text-gray-500">
                {time}
              </div>
              {days.map(day => {
                const key = `${day}-${time}`
                return (
                  <div
                    key={key}
                    onClick={() => toggleSlot(day, time)}
                    className={`bg-white p-2 cursor-pointer hover:bg-gray-50 ${
                      selectedSlots[key] ? 'bg-red-100' : ''
                    }`}
                  >
                    {selectedSlots[key] && (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}
