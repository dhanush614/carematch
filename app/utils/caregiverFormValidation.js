"use client"

export const validateCaregiverForm = (form, step) => {
  const errors = {}

  switch (step) {
    case 1:
      // Basic Information
      if (!form.name?.trim()) {
        errors.name = 'Name is required'
      }
      if (!form.email?.trim()) {
        errors.email = 'Email is required'
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
        errors.email = 'Invalid email format'
      }
      if (!form.phone?.trim()) {
        errors.phone = 'Phone number is required'
      }
      break

    case 2:
      // Work Details
      if (!form.rate_type) {
        errors.rate_type = 'Please select a rate type'
      }
      if (!form.rate) {
        errors.rate = 'Rate is required'
      } else if (parseFloat(form.rate) <= 0) {
        errors.rate = 'Rate must be greater than 0'
      }
      if (!form.travel_distance) {
        errors.travel_distance = 'Travel distance is required'
      }
      if (!form.preferred_hours.min) {
        errors.preferred_hours_min = 'Minimum hours is required'
      }
      if (!form.preferred_hours.max) {
        errors.preferred_hours_max = 'Maximum hours is required'
      }
      if (parseInt(form.preferred_hours.max) <= parseInt(form.preferred_hours.min)) {
        errors.preferred_hours_max = 'Maximum hours must be greater than minimum hours'
      }
      
      // Check if at least one availability slot is selected
      const hasAvailability = Object.values(form.availability).some(day =>
        Object.values(day).some(slot => slot)
      )
      if (!hasAvailability) {
        errors.availability = 'Please select at least one availability slot'
      }
      break

    case 3:
      // Skills & Experience
      if (!form.experience_years) {
        errors.experience_years = 'Years of experience is required'
      }
      if (!form.skills || form.skills.length === 0) {
        errors.skills = 'At least one skill is required'
      }
      if (!form.education) {
        errors.education = 'Education information is required'
      }
      break

    case 4:
      // Additional Information
      if (!form.references || form.references.length === 0) {
        errors.references = 'At least one reference is required'
      }
      break
  }

  return errors
}

export const getFieldErrorClass = (hasError, baseClass = '') => {
  return `${baseClass} ${
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
  }`
}

export const generateAvailabilityObject = () => ({
  monday: { morning: false, afternoon: false, evening: false },
  tuesday: { morning: false, afternoon: false, evening: false },
  wednesday: { morning: false, afternoon: false, evening: false },
  thursday: { morning: false, afternoon: false, evening: false },
  friday: { morning: false, afternoon: false, evening: false },
  saturday: { morning: false, afternoon: false, evening: false },
  sunday: { morning: false, afternoon: false, evening: false }
})

export const initialFormState = {
  // Basic Information
  name: '',
  email: '',
  phone: '',
  profileImage: null,
  bio: '',

  // Work Details
  rate_type: 'hourly',
  rate: '',
  availability: generateAvailabilityObject(),
  preferred_hours: { min: '', max: '' },
  travel_distance: '',

  // Skills & Experience
  experience_years: '',
  skills: [],
  education: '',
  certifications: [],
  languages: [],

  // Additional Information
  pets_ok: false,
  overnight_ok: false,
  cooking: false,
  light_housework: false,
  homework_help: false,
  special_needs_experience: false,
  first_aid_certified: false,
  background_check: false,
  references: [],
  testimonials: ''
}
