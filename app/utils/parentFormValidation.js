"use client"

export const validateParentForm = (form, step) => {
  const errors = {}

  switch (step) {
    case 1:
      if (!form.name?.trim()) {
        errors.name = 'Name is required'
      }
      if (!form.kids_count || form.kids_count < 1) {
        errors.kids_count = 'Number of children must be at least 1'
      }
      if (!form.hours || form.hours < 1) {
        errors.hours = 'Hours must be at least 1'
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

export const initialFormState = {
  name: '',
  kids_count: 1,
  needs_petcare: false,
  overnight_stay: false,
  hours: 1,
  notes: ''
}
