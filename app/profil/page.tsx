"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ProfilPage() {
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const router = useRouter();

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

  async function saveProfile() {
    if (!name.trim()) {
      alert("Du må skrive inn navn.");
      return;
    }

    if (!team) {
      alert("Du må velge avdeling.");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        full_name: name,
        team: team,
      });

    if (error) {
      console.error(error);
      alert("Kunne ikke lagre profil.");
      return;
    }

    router.push("/");
  }

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setName(data.full_name ?? "");
        setTeam(data.team ?? "");
      }
    }

    loadProfile();
  }, []);

  return (
    <main style={{ padding: "16px", maxWidth: "500px" }}>
      <a
        href="/"
        style={{
          color: "blue",
          textDecoration: "underline",
        }}
      >
        ← Tilbake til kartet
      </a>
      <h1>Min profil</h1>

      <div style={{ marginBottom: "16px" }}>
        <label>Navn</label>
        <br />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label>Lag / avdeling</label>
        <br />

        <select
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">Velg avdeling</option>

          {teams.map((teamName) => (
            <option key={teamName} value={teamName}>
              {teamName}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={saveProfile}
        style={{
          padding: "10px 16px",
          borderRadius: "8px",
          border: "none",
          background: "#166534",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Lagre profil
      </button>
    </main>
  );
}