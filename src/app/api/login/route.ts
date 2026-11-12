import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const { data: user } = await db.from("users").select("id,name,email").eq("email", email).single();
  if (!user) return NextResponse.json({ error: "Unknown user" }, { status: 404 });

  const res = NextResponse.json({ user });
  res.cookies.set("uid", String(user.id), { httpOnly: true, path: "/" });
  return res;
}