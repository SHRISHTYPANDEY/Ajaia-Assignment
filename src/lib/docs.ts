import { db } from "./db";
import { resolveAccess, Access } from "./access";

export async function loadDocWithAccess(id: string, userId: number) {
  const { data: doc } = await db.from("documents").select("*").eq("id", id).single();
  if (!doc) return { doc: null, access: null as Access };
  const { data: shares } = await db.from("shares").select("user_id").eq("document_id", id);
  const access = resolveAccess(doc.owner_id, (shares ?? []).map((s) => s.user_id), userId);
  return { doc, access };
}