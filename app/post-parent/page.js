"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useAuth } from "../context/auth"
import { useRouter } from "next/navigation"
import LoadingSpinner from "../components/LoadingSpinner"
import { useToast } from "../components/Toast"
import {
  validateParentForm,
  getFieldErrorClass,
  initialFormState
} from "../utils/parentFormValidation"

export default function PostParent() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { showToast } = useToast()
  const [form, setForm] = useState({
    ...initialFormState,
    email: user?.email || ""
  })

  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  const validateForm = () => {
    const newErrors = validateParentForm(form, 1)
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      showToast('Please fix all validation errors', 'error')
      return false
    }
    
    return true
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from("parent_profiles")
        .insert([{
          user_id: user.id,
          name: form.name,
          email: user.email,
          kids_count: parseInt(form.kids_count),
          needs_petcare: form.needs_petcare,
          overnight_stay: form.overnight_stay,
          hours: parseInt(form.hours),
          notes: form.notes
        }])

      if (error) throw error

      showToast("Successfully created your parent profile!", "success")
      router.push('/matches')
    } catch (error) {
      console.error('Error:', error)
      showToast("Error creating profile. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Parent Profile</h2>
            <p className="mt-1 text-sm text-gray-500">Fill in your details to find the perfect caregiver match</p>
          </div>
          <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={getFieldErrorClass(errors.name, "block w-full rounded-lg border-gray-200 pr-10 pl-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all")}
                  placeholder="Enter your full name"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Children</label>
                <div className="relative">
                  <input
                    type="number"
                    name="kids_count"
                    value={form.kids_count}
                    onChange={handleChange}
                    min="1"
                    className={getFieldErrorClass(errors.kids_count, "block w-full rounded-lg border-gray-200 pl-4 pr-10 py-2.5 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all")}
                    placeholder="1"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                {errors.kids_count && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.kids_count}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours Needed</label>
                <div className="relative">
                  <input
                    type="number"
                    name="hours"
                    value={form.hours}
                    onChange={handleChange}
                    min="1"
                    className={getFieldErrorClass(errors.hours, "block w-full rounded-lg border-gray-200 pl-4 pr-10 py-2.5 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all")}
                    placeholder="4"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                {errors.hours && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.hours}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Additional Needs</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative flex items-start">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      name="needs_petcare"
                      checked={form.needs_petcare}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500 transition-colors"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="needs_petcare" className="text-sm text-gray-700 font-medium">Pet Care Needed</label>
                    <p className="text-gray-500 text-xs mt-0.5">Care for pets alongside children</p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      name="overnight_stay"
                      checked={form.overnight_stay}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500 transition-colors"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="overnight_stay" className="text-sm text-gray-700 font-medium">Overnight Stay</label>
                    <p className="text-gray-500 text-xs mt-0.5">Caregiver stays overnight</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <div className="relative mt-1">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={4}
                  className="block w-full rounded-lg border-gray-200 py-3 px-4 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all resize-none"
                  placeholder="Share any additional requirements, preferences, or important information that would help us find the perfect match..."
                />
                <div className="absolute right-2 bottom-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center items-center py-3 px-6 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Profile...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Create Profile
                </>
              )}
            </button>
            <p className="mt-2 text-center text-sm text-gray-500">
              All information is kept private and secure
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
