"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

const teams = [
  "Ordfører",
  "Kommunedirektør",
  "Organisasjonsseksjon",
  "Administrative fellestjenester",
  "Økonomiseksjonen",
  "Seksjon for oppvekst og inkludering",
  "Seksjon for samfunn og miljø",
  "Seksjon for helse og omsorg",
  "Kvarstein Skole og SFO",
  "Moseidmoen skole og SFO",
  "Vennesla skole og SFO",
  "Eikeland oppvekstsenter",
  "Skarpengland skole og SFO",
  "Vennesla ungdomsskole",
  "Vennesla voksenopplæringssenter",
  "Solsletta barnehage",
  "Klokkerstua barnehage",
  "Smååsane barnehage",
  "Barnestua barnehage",
  "Enhet for barn og familie",
  "NAV Midt Agder",
  "Kultur og innbyggertorg",
  "Plan og utbygging",
  "Park og teknisk",
  "Byggforvaltning",
  "Hovedkjøkken",
  "Livsmestring",
  "Venneslaheimen omsorgssenter",
  "Hægelandsheimen omsorgssenter",
  "Hjemmetjenesten",
  "Koordinerende og helsefremmende",
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [team, setTeam] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!fullName.trim()) {
      setMessage("Du må skrive inn navn.");
      return;
    }

    if (!team) {
      setMessage("Du må velge avdeling/enhet.");
      return;
    }

    if (!normalizedEmail) {
      setMessage("Du må skrive inn e-post.");
      return;
    }

    if (password.length < 6) {
      setMessage("Passord må være minst 6 tegn.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passordene er ikke like.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      setMessage("Kunne ikke opprette bruker.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: normalizedEmail,
        full_name: fullName.trim(),
        team,
      });

    if (profileError) {
      console.error(profileError);
      setMessage("Bruker opprettet, men profil kunne ikke lagres.");
      setLoading(false);
      return;
    }

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

    if (loginError) {
      setMessage(
        "Bruker opprettet, men kunne ikke logge inn automatisk."
      );
      setLoading(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <main
      style={{
        maxWidth: "440px",
        margin: "40px auto",
        padding: "16px",
      }}
    >
      <a
        href="/"
        style={{
          color: "blue",
          textDecoration: "underline",
        }}
      >
        ← Tilbake til kartet
      </a>

      <h1>Registrer bruker</h1>

      <input
        type="text"
        placeholder="Fullt navn"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        style={inputStyle}
      />

      <select
        value={team}
        onChange={(e) => setTeam(e.target.value)}
        style={inputStyle}
      >
        <option value="">Velg avdeling/enhet</option>

        {teams.map((teamName) => (
          <option
            key={teamName}
            value={teamName}
          >
            {teamName}
          </option>
        ))}
      </select>

      <input
        type="email"
        placeholder="E-post"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Passord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Bekreft passord"
        value={confirmPassword}
        onChange={(e) =>
          setConfirmPassword(e.target.value)
        }
        style={inputStyle}
      />

      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          background: "#166534",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading
          ? "Oppretter bruker..."
          : "Registrer"}
      </button>

      {message && (
        <p style={{ marginTop: "16px" }}>
          {message}
        </p>
      )}

      <p style={{ marginTop: "20px" }}>
        Har du allerede bruker?{" "}
        <a href="/login">
          Logg inn
        </a>
      </p>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
} as const;