"use client";
import { useRouter } from "next/navigation";

const USERS = ["alice@test.com", "bob@test.com", "carol@test.com"];

export default function Login() {
  const router = useRouter();
  async function login(email: string) {
    const r = await fetch("/api/login", { method: "POST", body: JSON.stringify({ email }) });
    if (r.ok) router.push("/docs");
    else alert("Login failed");
  }
  return (
    <main style={{ maxWidth: 400, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h1>Docs App</h1>
      <p>Choose a test user (no password, demo only):</p>
      {USERS.map((e) => (
        <button key={e} onClick={() => login(e)} style={{ display: "block", margin: "8px 0", padding: 10, width: "100%" }}>
          {e}
        </button>
      ))}
    </main>
  );
}