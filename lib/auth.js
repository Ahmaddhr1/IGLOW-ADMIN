import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function getUserFromCookie() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded
  } catch {
    return null
  }
}