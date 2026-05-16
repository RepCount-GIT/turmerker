"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister() {
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedEmail.endsWith("@vennesla.kommune.no") &&
      !normalizedEmail.endsWith("@nav.no")
    ) {
      setMessage("Kun jobb-epost er tillatt.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Bruker opprettet! Du kan nå logge inn.");
  }

  return (
    <main
      style={{
        maxWidth: "400px",
        margin: "40px auto",
        padding: "16px",
      }}
    >
      <h1>Registrer bruker</h1>

      <input
        type="email"
        placeholder="E-post"
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
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={handleRegister}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          background: "#166534",
          color: "white",
          fontWeight: "bold",
        }}
      >
        Registrer
      </button>

      {message && (
        <p style={{ marginTop: "16px" }}>
          {message}
        </p>
      )}
    </main>
  );
}