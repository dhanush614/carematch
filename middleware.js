import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Get and refresh the session
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error:', sessionError)
      // Only return 401 for API routes
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication error', details: sessionError.message },
          { status: 401 }
        )
      }
      return res
    }

    // For API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized - No valid session' },
          { status: 401 }
        )
      }

      // Verify authorization header matches session for API routes
      const authHeader = req.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ') || authHeader.split(' ')[1] !== session.access_token) {
        return NextResponse.json(
          { error: 'Invalid authorization' },
          { status: 401 }
        )
      }
    }

    // For all routes, try to refresh the session if it exists
    if (session) {
      await supabase.auth.refreshSession()
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // Only return 500 for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
