import { connectToDB } from '@/lib/connectDb'
import Admin from '@/models/Admin'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req) {
  await connectToDB();

  const { adminname, password } = await req.json();

  const admin = await Admin.findOne({ adminname });
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign(
    { id: admin._id, adminname: admin.adminname },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  const cookiess= await cookies();
  await cookiess.set("session", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return NextResponse.json({ message: "Logged in" });
}
