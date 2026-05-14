"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type CheckinRow = {
  user_name: string;
  location_id: number;
  locations: {
    name: string;
    points: number;
  } | null;
};

type LeaderboardRow = {
  userName: string;
  uniquePlaces: number;
  totalPoints: number;
};

function getMedal(index: number) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return `${index + 1}.`;
}

function LeaderboardCard({
  title,
  subtitle,
  rows,
  primary,
}: {
  title: string;
  subtitle: string;
  rows: LeaderboardRow[];
  primary: "points" | "places";
}) {
  return (
    <section
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
        marginBottom: "20px",
      }}
    >
      <h2 style={{ margin: 0 }}>{title}</h2>
      <p style={{ marginTop: "6px", color: "#4b5563" }}>{subtitle}</p>

      <div style={{ display: "grid", gap: "10px" }}>
        {rows.map((row, index) => (
          <div
            key={row.userName}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              borderRadius: "12px",
              background: index < 3 ? "#fefce8" : "#f9fafb",
              border: "1px solid #e5e7eb",
            }}
          >
            <div>
              <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                {getMedal(index)} {row.userName}
              </div>

              <div style={{ color: "#6b7280", fontSize: "14px" }}>
                {row.uniquePlaces} unike steder · {row.totalPoints} poeng
              </div>
            </div>

            <div
              style={{
                fontWeight: "bold",
                fontSize: "20px",
                color: "#166534",
              }}
            >
              {primary === "points" ? row.totalPoints : row.uniquePlaces}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TopplistePage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      const { data, error } = await supabase
        .from("checkins")
        .select(`
          user_name,
          location_id,
          locations (
            name,
            points
          )
        `);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("email, full_name, team");

      if (profilesError) {
        console.error(profilesError);
      }

      const profileByEmail = new Map<string, string>(
        (profiles ?? []).map((profile: any) => [
          profile.email,
          profile.full_name,
        ])
      );

      const grouped = new Map<
        string,
        {
          uniqueLocationIds: Set<number>;
          totalPoints: number;
        }
      >();

      (data as unknown as CheckinRow[]).forEach((checkin) => {
        if (!grouped.has(checkin.user_name)) {
          grouped.set(checkin.user_name, {
            uniqueLocationIds: new Set<number>(),
            totalPoints: 0,
          });
        }

        const user = grouped.get(checkin.user_name)!;

        user.uniqueLocationIds.add(checkin.location_id);
        user.totalPoints += Array.isArray(checkin.locations)
          ? checkin.locations[0]?.points ?? 0
          : checkin.locations?.points ?? 0;
      });

      const leaderboardRows: LeaderboardRow[] = Array.from(grouped.entries()).map(
        ([userEmail, value]) => ({
          userName:
            profileByEmail.get(userEmail) ??
            userEmail.split("@")[0],
          uniquePlaces: value.uniqueLocationIds.size,
          totalPoints: value.totalPoints,
        })
      );

      setRows(leaderboardRows);
      setLoading(false);
     }

      loadLeaderboard();
    }, []);

  const pointsRows = [...rows].sort((a, b) => b.totalPoints - a.totalPoints);
  const placesRows = [...rows].sort((a, b) => b.uniquePlaces - a.uniquePlaces);

  if (loading) {
    return <main style={{ padding: "16px" }}>Laster toppliste...</main>;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "16px",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <a
          href="/"
          style={{
            color: "blue",
            textDecoration: "underline",
          }}
        >
          ← Tilbake til kartet
        </a>

        <h1 style={{ marginTop: "16px" }}>Toppliste</h1>

        <LeaderboardCard
          title="🏆 Poengliga"
          subtitle="Rangert etter totale poeng."
          rows={pointsRows}
          primary="points"
        />

        <LeaderboardCard
          title="🧭 Flest unike steder"
          subtitle="Rangert etter hvor mange forskjellige turmål som er besøkt."
          rows={placesRows}
          primary="places"
        />
      </div>
    </main>
  );
}