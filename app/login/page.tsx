"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

const allowedDomains = [
  "@vennesla.kommune.no",
  "@nav.no",
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();

    const isAllowed = allowedDomains.some((domain) =>
      normalizedEmail.endsWith(domain)
    );

    if (!isAllowed) {
      setMessage("Du må bruke jobb-epost fra Vennesla kommune eller NAV.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error(error);
      setMessage("Klarte ikke sende innloggingslenke.");
      return;
    }

    setMessage("Sjekk e-posten din for innloggingslenke. Eposten blir sendt av Supabase Auth");
  }

  return (
    <main style={{ padding: "16px", maxWidth: "420px" }}>
      <h1>Logg inn</h1>

      <p>Bruk jobb-eposten din for å logge inn.</p>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="navn@vennesla.kommune.no"
        style={{
          width: "100%",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          marginBottom: "12px",
        }}
      />

      <button
        onClick={handleLogin}
        style={{
          padding: "10px 16px",
          background: "#166534",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
        }}
      >
        Send innloggingslenke
      </button>

      {message && <p>{message}</p>}
    </main>
  );
}