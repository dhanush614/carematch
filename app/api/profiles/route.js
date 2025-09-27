import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
  try {
    // Get session to verify user is authenticated
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return new NextResponse(
        JSON.stringify({ error: 'Authentication error', details: sessionError.message }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'No active session' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify authorization header matches session
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ') || authHeader.split(' ')[1] !== session.access_token) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid authorization' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Get request body
    const { userType } = await req.json()
    if (!userType || !['parent', 'caregiver'].includes(userType)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid user type' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Ensure user doesn't already have a profile
    const { data: existingProfile } = await supabase
      .from(userType === 'parent' ? 'parent_profiles' : 'caregiver_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (existingProfile) {
      return new NextResponse(
        JSON.stringify({ error: 'Profile already exists' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Create the profile using server-side client (which bypasses RLS)
    const { data: profile, error: insertError } = await supabase
      .from(userType === 'parent' ? 'parent_profiles' : 'caregiver_profiles')
      .insert([
        { 
          user_id: session.user.id,
          email: session.user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('Profile creation error:', insertError)
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create profile', details: insertError.message }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return new NextResponse(
      JSON.stringify({ profile }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Server error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
