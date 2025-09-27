"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '../context/auth'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { useRouter } from 'next/navigation'

export default function Settings() {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({
    emailNotifications: true,
    pushNotifications: true,
    theme: 'light',
    language: 'en',
    visibility: 'public'
  })

  useEffect(() => {
    // If no user, redirect to home page
    if (!user) {
      router.push('/')
      return
    }
    fetchSettings()
  }, [user, router])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      
      if (data) {
        setForm(data.settings)
        setProfile(data)
      }
    } catch (error) {
      console.error('Error:', error)
      showToast('Error loading settings', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: form
        })

      if (error) throw error
      
      showToast('Settings saved successfully', 'success')
    } catch (error) {
      console.error('Error:', error)
      showToast('Error saving settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-md rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Settings</h3>
          
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Notifications</h4>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={form.emailNotifications}
                      onChange={handleChange}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                      Email notifications
                    </label>
                    <p className="text-gray-500">Receive email updates about your matches and messages.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      name="pushNotifications"
                      checked={form.pushNotifications}
                      onChange={handleChange}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="pushNotifications" className="font-medium text-gray-700">
                      Push notifications
                    </label>
                    <p className="text-gray-500">Receive push notifications in your browser.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Preferences</h4>
              <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                    Theme
                  </label>
                  <select
                    name="theme"
                    value={form.theme}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Language
                  </label>
                  <select
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Privacy</h4>
              <div className="mt-4">
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                  Profile visibility
                </label>
                <select
                  name="visibility"
                  value={form.visibility}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="matches">Matches Only</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
