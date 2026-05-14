"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import MapWrapper from "../components/MapWrapper";
import { useRouter } from "next/navigation";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (!currentUser) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();
      if (profile) {
        setProfileName(profile.full_name ?? "");
      }
      if (!profile) {
        router.push("/profil");
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
      }}
    >
      <section
        style={{
          padding: "12px 16px",
          background: "white",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "26px" }}>Turmerker</h1>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#4b5563" }}>
              Finn turmål og sjekk inn.
            </p>
          </div>

          {user && (
            <div style={{ textAlign: "right", fontSize: "14px" }}>
              <div style={{ color: "#6b7280" }}>Logget inn</div>
              <strong>{profileName || user.email}</strong>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "12px",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/toppliste"
            style={{
              padding: "8px 12px",
              background: "#166534",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Toppliste
          </a>

          {user ? (
            <>
              <a
                href="/profil"
                style={{
                  padding: "8px 12px",
                  background: "#f3f4f6",
                  color: "#111827",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Min profil
              </a>

              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#991b1b",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Logg ut
              </button>
            </>
          ) : (
            <a
              href="/login"
              style={{
                padding: "8px 12px",
                background: "#166534",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Logg inn
            </a>
          )}

          <a
            href="/personvern"
            style={{
              padding: "8px 0",
              color: "blue",
              textDecoration: "underline",
            }}
          >
            Personvern
          </a>
        </div>
      </section>

      <MapWrapper />
    </main>
  );
}