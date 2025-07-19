import { connectToDB } from '@/lib/connectDb.js'
import Admin from '@/models/Admin'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { adminname, password } = await req.json()

    console.log("ADMIN NAMEE: "+adminname)

    // Validate input
    if (!adminname || !password) {
      return NextResponse.json({ error: 'Admin name and password are required' }, { status: 400 })
    }

    await connectToDB()

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ adminname })
    if (existingAdmin) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new admin
    const newAdmin = new Admin({
      adminname,
      password: hashedPassword,
    })

    await newAdmin.save()

    return NextResponse.json({ message: 'Admin created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
