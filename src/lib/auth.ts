import { cookies } from "next/headers";
import { db } from "./db";

export async function getCurrentUser() {
  const uid = (await cookies()).get("uid")?.value;
  if (!uid) return null;
  const { data } = await db.from("users").select("id,name,email").eq("id", Number(uid)).single();
  return data;
}