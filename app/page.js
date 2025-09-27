"use client"

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from './context/auth'

export default function Home() {
  const { user, userType } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && userType) {
      router.push('/dashboard')
    }
  }, [user, userType, router])

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative isolate">
          {/* Background gradient */}
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-red-200 to-red-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                CareMatch
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Connecting families with trusted caregivers. Find your perfect match today.
              </p>
              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                  <Link 
                    href="/auth?type=parent" 
                    className="relative block w-full px-8 py-10 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition duration-200"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">For Parents</h2>
                    <p className="text-gray-600 mb-6">Find trusted caregivers for your children. Post your requirements and connect with qualified professionals.</p>
                    <span className="inline-flex items-center text-red-600 font-semibold">
                      Get Started
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </div>
                
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                  <Link 
                    href="/auth?type=caregiver" 
                    className="relative block w-full px-8 py-10 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition duration-200"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">For Caregivers</h2>
                    <p className="text-gray-600 mb-6">Share your experience and connect with families. Create your profile and find the perfect job match.</p>
                    <span className="inline-flex items-center text-blue-600 font-semibold">
                      Get Started
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-red-200 to-red-400 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
        </section>

        {/* Quick Action Cards - Only show when logged in but no role selected */}
        {user && !userType && (
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Choose Your Role</h2>
            <p className="mt-4 text-lg text-gray-600">Select how you want to use CareMatch</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
              <Link
                href="/post-parent"
                className="relative block w-full px-8 py-12 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition duration-200"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Parent Profile</h2>
                <p className="text-gray-600 mb-6">
                  Set up your parent profile to start finding the perfect caregiver for your family.
                </p>
                <span className="inline-flex items-center text-red-600 font-semibold">
                  Get Started
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
              <Link
                href="/post-caregiver"
                className="relative block w-full px-8 py-12 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition duration-200"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Caregiver Profile</h2>
                <p className="text-gray-600 mb-6">
                  Set up your caregiver profile to start connecting with families in need.
                </p>
                <span className="inline-flex items-center text-blue-600 font-semibold">
                  Get Started
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </section>)}

        {/* Features - Show only when not signed in */}
        {!user && (
          <section className="bg-gray-50 py-24">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-red-600">Trusted Care</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Everything you need to find the perfect caregiver
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  We make it easy to connect with qualified caregivers who match your specific needs and preferences.
                </p>
              </div>

              <div className="mx-auto mt-16 max-w-2xl lg:mt-24 lg:max-w-none">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
                  {[
                    {
                      name: 'Smart Matching',
                      description:
                        'Our intelligent system matches you with caregivers based on your specific needs, schedule, and preferences.',
                      icon: '🎯',
                    },
                    {
                      name: 'Verified Caregivers',
                      description:
                        'Every caregiver undergoes a thorough background check and verification process.',
                      icon: '✓',
                    },
                    {
                      name: 'Flexible Scheduling',
                      description:
                        'Find care that fits your schedule, whether you need regular care or occasional help.',
                      icon: '📅',
                    },
                  ].map((feature) => (
                    <div key={feature.name} className="flex flex-col">
                      <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                        <span className="text-2xl">{feature.icon}</span>
                        {feature.name}
                      </dt>
                      <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                        <p className="flex-auto">{feature.description}</p>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500">
              &copy; {new Date().getFullYear()} CareMatch. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
