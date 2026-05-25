"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setMessage("Skriv inn e-post.");
      return;
    }

    if (!password) {
      setMessage("Skriv inn passord.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setMessage("Feil e-post eller passord.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <main style={{ maxWidth: "440px", margin: "40px auto", padding: "16px" }}>
      <a href="/" style={{ color: "blue", textDecoration: "underline" }}>
        ← Tilbake til kartet
      </a>

      <h1>Logg inn</h1>

      <input
        type="email"
        placeholder="Jobb-epost"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <input
        type="password"
        placeholder="Passord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleLogin();
          }
        }}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          background: "#166534",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Logg inn
      </button>

      {message && <p style={{ marginTop: "16px" }}>{message}</p>}

      <p style={{ marginTop: "16px" }}>
        Har du ikke bruker? <a href="/registrer">Registrer deg</a>
      </p>
    </main>
  );
}