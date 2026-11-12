import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { marked } from "marked";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { textToHtml } from "@/lib/textToHtml";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ["txt", "md", "docx"];

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File required" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED.includes(ext))
    return NextResponse.json({ error: "Only .txt, .md and .docx files are supported" }, { status: 400 });
  if (file.size === 0) return NextResponse.json({ error: "The file is empty" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File is larger than 2 MB" }, { status: 400 });

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
    return NextResponse.json(
      { error: "Could not read or convert the file (it may be corrupt)" },
      { status: 422 }
    );
  }

  const title = file.name.replace(/\.[^.]+$/, "").slice(0, 200) || "Imported document";
  const { data, error } = await db
    .from("documents")
    .insert({ title, content: html, owner_id: user.id })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: "Could not save the document" }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}