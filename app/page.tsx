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
          padding: "16px",
          background: "white",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "28px" }}>
              Turmerker
            </h1>

            <p style={{ marginTop: "6px", marginBottom: "14px" }}>
              Finn digitale turmål og sjekk inn når du er fremme.
            </p>

            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <a
                href="/toppliste"
                style={{
                  padding: "10px 16px",
                  background: "#166534",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Se toppliste
              </a>

              
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            {user ? (
              <>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#4b5563",
                    marginBottom: "8px",
                  }}
                >
                  Logget inn som
                </div>

                <strong>{profileName || user.email}</strong>

                <br />
                <a href="/profil">
                  Min profil
                </a>
                <br />
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                  style={{
                    marginTop: "10px",
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
                <br />

                <a
                href="/personvern"
                style={{
                  color: "blue",
                  textDecoration: "underline",
                }}
              >
                Personvern
              </a>
              </>
            ) : (
              <a
                href="/login"
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
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
          </div>
        </div>
      </section>

      <MapWrapper />
    </main>
  );
}