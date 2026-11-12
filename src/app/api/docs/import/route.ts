import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { marked } from "marked";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { textToHtml } from "@/lib/textToHtml";

const MAX_BYTES = 2 * 1024 * 1024; 
const ALLOWED = ["txt", "md", "docx"];

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");


export async function POST(req: Request) {
  const user = await getCurrentUser();
if (!user) return { error: NextResponse.json({ error: "Not logged in" }, { status: 401 }), user: null, doc: null };

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File required" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED.includes(ext))
    return NextResponse.json({ error: "Sirf .txt, .md aur .docx supported hain" }, { status: 400 });
  if (file.size === 0) return NextResponse.json({ error: "File empty hai" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File 2 MB se badi hai" }, { status: 400 });

  let html = "";
  try {
    if (ext === "docx") {
      const buffer = Buffer.from(await file.arrayBuffer());
      html = (await mammoth.convertToHtml({ buffer })).value;
    } else {
      const text = await file.text();
      html = ext === "md" ? await marked.parse(text) : textToHtml(text);
    }
  } catch {
    return NextResponse.json({ error: "File read/convert nahi ho payi (corrupt ho sakti hai)" }, { status: 422 });
  }

  const title = file.name.replace(/\.[^.]+$/, "").slice(0, 200) || "Imported document";
  const { data, error } = await db
    .from("documents")
    .insert({ title, content: html, owner_id: user.id })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: "Document save nahi hua" }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}