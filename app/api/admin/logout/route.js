import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = cookies();
  await cookieStore.set("session", "", {
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ message: "Logged out" });
}
