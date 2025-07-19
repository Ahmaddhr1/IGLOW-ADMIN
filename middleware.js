import { NextResponse } from 'next/server'
import { getUserFromCookie } from './lib/auth'


export async function middleware(request) {
  const sessionCookie = request.cookies.get('session')?.value;
  const  user  = await sessionCookie ? getUserFromCookie() : null
  const { pathname } = request.nextUrl


  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()

}