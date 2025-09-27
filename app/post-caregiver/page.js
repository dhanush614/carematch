"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useAuth } from "../context/auth"
import { useRouter } from "next/navigation"
import LoadingSpinner from "../components/LoadingSpinner"
import { useToast } from "../components/Toast"
import {
  validateCaregiverForm,
  getFieldErrorClass,
  initialFormState
} from "../utils/caregiverFormValidation"

export default function PostCaregiver() {
  const { user } = useAuth()
  const router = useRouter()
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
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

  const validateCurrentStep = () => {
    const newErrors = validateCaregiverForm(form, step)
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      showToast('Please fix all validation errors', 'error')
      return false
    }
    
    return true
  }

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setStep(current => current + 1)
      setErrors({})
    }
  }

  const handlePrevStep = () => {
    setStep(current => current - 1)
    setErrors({})
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    
    if (type === 'file') {
      setForm(prev => ({
        ...prev,
        [name]: files[0]
      }))
      return
    }

    if (type === 'checkbox') {
      setForm(prev => ({
        ...prev,
        [name]: checked
      }))
      return
    }

    // Handle nested availability object changes
    if (name.startsWith('availability.')) {
      const [, day, time] = name.split('.')
      setForm(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [day]: {
            ...prev.availability[day],
            [time]: checked
          }
        }
      }))
      return
    }

    // Handle nested preferred_hours changes
    if (name.startsWith('preferred_hours.')) {
      const [, key] = name.split('.')
      setForm(prev => ({
        ...prev,
        preferred_hours: {
          ...prev.preferred_hours,
          [key]: value
        }
      }))
      return
    }

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleArrayInput = (field, value) => {
    const arrayValue = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '')
    
    setForm(prev => ({
      ...prev,
      [field]: arrayValue
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateCurrentStep()) {
      return
    }

    setLoading(true)
    try {
      // Upload profile image if exists
      let profileImageUrl = null
      if (form.profileImage) {
        const fileExt = form.profileImage.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, form.profileImage)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName)
        
        profileImageUrl = publicUrl
      }

      // Save caregiver profile
      const { error } = await supabase
        .from('caregiver_profiles')
        .insert([{
          user_id: user.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          profile_image_url: profileImageUrl,
          bio: form.bio,
          rate_type: form.rate_type,
          rate: parseFloat(form.rate),
          availability: form.availability,
          preferred_hours: form.preferred_hours,
          travel_distance: parseInt(form.travel_distance),
          experience_years: parseFloat(form.experience_years),
          skills: form.skills,
          education: form.education,
          certifications: form.certifications,
          languages: form.languages,
          pets_ok: form.pets_ok,
          overnight_ok: form.overnight_ok,
          cooking: form.cooking,
          light_housework: form.light_housework,
          homework_help: form.homework_help,
          special_needs_experience: form.special_needs_experience,
          first_aid_certified: form.first_aid_certified,
          background_check: form.background_check,
          references: form.references,
          testimonials: form.testimonials
        }])

      if (error) throw error

      showToast('Successfully created your caregiver profile!', 'success')
      router.push('/matches')
    } catch (error) {
      console.error('Error:', error)
      showToast('Error creating profile. Please try again.', 'error')
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

  const steps = [
    { number: 1, title: "Basic Info", description: "Personal details and contact info" },
    { number: 2, title: "Work Details", description: "Experience and qualifications" },
    { number: 3, title: "Additional Info", description: "Preferences and requirements" }
  ]

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Become a Caregiver</h2>
              <p className="mt-1 text-sm text-gray-500">Join our community of trusted caregivers</p>
            </div>
            <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-between">
            {steps.map(({ number, title, description }) => (
              <div key={number} className="relative flex-1">
                <div className="flex items-center">
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    ${number === step ? 'bg-red-500 text-white ring-4 ring-red-50' :
                      number < step ? 'bg-green-500 text-white' :
                      'bg-gray-100 text-gray-500'}
                    transition-all duration-200
                  `}>
                    {number < step ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : number}
                  </div>
                  <div className={`ml-3 ${number === 3 ? 'hidden sm:block' : ''}`}>
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                  {number !== 3 && (
                    <div className={`flex-1 ml-4 h-0.5 ${
                      number < step ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                <p className="mt-1 text-sm text-gray-500">Let&apos;s start with your profile details</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                  <div className="flex items-start space-x-6">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full border-2 border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 transition-all duration-200 group-hover:border-red-200">
                        {form.profileImage ? (
                          <Image 
                            src={URL.createObjectURL(form.profileImage)} 
                            alt="Profile preview" 
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        <label className="flex items-center justify-center w-8 h-8 bg-red-500 rounded-full cursor-pointer shadow-sm hover:bg-red-600 transition-colors">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          <input
                            type="file"
                            name="profileImage"
                            accept="image/*"
                            onChange={handleChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">Upload your photo</p>
                      <p className="mt-1 text-xs text-gray-500">Make a great first impression with a professional photo</p>
                      <p className="mt-2 text-xs text-gray-400">PNG or JPG up to 2MB</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Smith"
                        className={getFieldErrorClass(errors.name, "block w-full rounded-lg border-gray-200 pl-4 pr-10 py-2.5 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all")}
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                        className={getFieldErrorClass(errors.phone, "block w-full rounded-lg border-gray-200 pl-4 pr-10 py-2.5 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all")}
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      {errors.phone && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={getFieldErrorClass(errors.email, "block w-full rounded-lg border-gray-200 pl-4 pr-10 py-2.5 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all")}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    placeholder="Tell families about yourself..."
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Work Preferences</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rate Type</label>
                    <select
                      name="rate_type"
                      value={form.rate_type}
                      onChange={handleChange}
                      className={getFieldErrorClass(errors.rate_type, "mt-1 block w-full rounded-md shadow-sm")}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    {errors.rate_type && (
                      <p className="mt-1 text-sm text-red-600">{errors.rate_type}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rate ($)</label>
                    <input
                      type="number"
                      name="rate"
                      value={form.rate}
                      onChange={handleChange}
                      min="1"
                      className={getFieldErrorClass(errors.rate, "mt-1 block w-full rounded-md shadow-sm")}
                    />
                    {errors.rate && (
                      <p className="mt-1 text-sm text-red-600">{errors.rate}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <div className="grid grid-cols-7 gap-2">
                    {Object.entries(form.availability).map(([day, times]) => (
                      <div key={day} className="space-y-2">
                        <div className="text-sm font-medium text-gray-700 capitalize">{day}</div>
                        {Object.entries(times).map(([time, checked]) => (
                          <label key={time} className="flex items-center">
                            <input
                              type="checkbox"
                              name={`availability.${day}.${time}`}
                              checked={checked}
                              onChange={handleChange}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="ml-2 text-sm text-gray-600 capitalize">{time}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                  {errors.availability && (
                    <p className="mt-2 text-sm text-red-600">{errors.availability}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Hours (Min)</label>
                    <input
                      type="number"
                      name="preferred_hours.min"
                      value={form.preferred_hours.min}
                      onChange={handleChange}
                      min="1"
                      className={getFieldErrorClass(errors.preferred_hours_min, "mt-1 block w-full rounded-md shadow-sm")}
                    />
                    {errors.preferred_hours_min && (
                      <p className="mt-1 text-sm text-red-600">{errors.preferred_hours_min}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Hours (Max)</label>
                    <input
                      type="number"
                      name="preferred_hours.max"
                      value={form.preferred_hours.max}
                      onChange={handleChange}
                      min={form.preferred_hours.min}
                      className={getFieldErrorClass(errors.preferred_hours_max, "mt-1 block w-full rounded-md shadow-sm")}
                    />
                    {errors.preferred_hours_max && (
                      <p className="mt-1 text-sm text-red-600">{errors.preferred_hours_max}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Travel Distance (miles)</label>
                  <input
                    type="number"
                    name="travel_distance"
                    value={form.travel_distance}
                    onChange={handleChange}
                    min="1"
                    className={getFieldErrorClass(errors.travel_distance, "mt-1 block w-full rounded-md shadow-sm")}
                  />
                  {errors.travel_distance && (
                    <p className="mt-1 text-sm text-red-600">{errors.travel_distance}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Skills & Experience</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={form.experience_years}
                    onChange={handleChange}
                    min="0"
                    step="0.5"
                    className={getFieldErrorClass(errors.experience_years, "mt-1 block w-full rounded-md shadow-sm")}
                  />
                  {errors.experience_years && (
                    <p className="mt-1 text-sm text-red-600">{errors.experience_years}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Skills</label>
                  <input
                    type="text"
                    placeholder="Enter skills separated by commas"
                    value={form.skills.join(', ')}
                    onChange={(e) => handleArrayInput('skills', e.target.value)}
                    className={getFieldErrorClass(errors.skills, "mt-1 block w-full rounded-md shadow-sm")}
                  />
                  {errors.skills && (
                    <p className="mt-1 text-sm text-red-600">{errors.skills}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Education</label>
                  <input
                    type="text"
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    className={getFieldErrorClass(errors.education, "mt-1 block w-full rounded-md shadow-sm")}
                    placeholder="Highest level of education"
                  />
                  {errors.education && (
                    <p className="mt-1 text-sm text-red-600">{errors.education}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Certifications</label>
                  <input
                    type="text"
                    placeholder="Enter certifications separated by commas"
                    value={form.certifications.join(', ')}
                    onChange={(e) => handleArrayInput('certifications', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Languages</label>
                  <input
                    type="text"
                    placeholder="Enter languages separated by commas"
                    value={form.languages.join(', ')}
                    onChange={(e) => handleArrayInput('languages', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Additional Information</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Capabilities</label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="pets_ok"
                        checked={form.pets_ok}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Pet Care</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="overnight_ok"
                        checked={form.overnight_ok}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Overnight Care</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="cooking"
                        checked={form.cooking}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Cooking</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="light_housework"
                        checked={form.light_housework}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Light Housework</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="homework_help"
                        checked={form.homework_help}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Homework Help</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="special_needs_experience"
                        checked={form.special_needs_experience}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Special Needs Experience</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="first_aid_certified"
                        checked={form.first_aid_certified}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">First Aid Certified</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="background_check"
                        checked={form.background_check}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Background Check</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">References</label>
                  <input
                    type="text"
                    placeholder="Enter references separated by commas"
                    value={form.references.join(', ')}
                    onChange={(e) => handleArrayInput('references', e.target.value)}
                    className={getFieldErrorClass(errors.references, "mt-1 block w-full rounded-md shadow-sm")}
                  />
                  {errors.references && (
                    <p className="mt-1 text-sm text-red-600">{errors.references}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Testimonials</label>
                  <textarea
                    name="testimonials"
                    value={form.testimonials}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    placeholder="Add any testimonials from previous families..."
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Navigation Buttons */}
        <div className="px-6 py-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Previous Step
              </button>
            ) : (
              <div></div>
            )}
            
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm hover:shadow transition-all duration-200"
              >
                Next Step
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!validateCurrentStep()}
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all duration-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting Profile...
                  </>
                ) : (
                  <>
                    Submit Profile
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Legal Info */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            By submitting your profile, you agree to our{' '}
            <a href="#" className="font-medium text-red-600 hover:text-red-500">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="font-medium text-red-600 hover:text-red-500">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
