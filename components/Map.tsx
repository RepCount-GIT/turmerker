
"use client";

import { useEffect, useState } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { getDistanceInMeters } from "../lib/distance";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

type Location = {
  id: number;
  name: string;
  description: string;
  position: [number, number];
  radiusMeters: number;
  points: number;
  difficulty: string;
};

type MyCheckin = {
  location_id: number;
  created_at: string;
};


const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function UserLocation({
  onPositionFound,
}: {
  onPositionFound: (position: [number, number]) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPosition: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];

        setPosition(newPosition);
        onPositionFound(newPosition);
      },
      (err) => {
        console.error(err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [onPositionFound]);

  useEffect(() => {
    if (position) {
      map.setView(position);
    }
  }, [position, map]);

  if (!position) return null;

  return <Circle center={position} radius={20} />;
}

export default function Map() {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [myCheckins, setMyCheckins] = useState<MyCheckin[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [user, setUser] = useState<User | null>(null);
 

  useEffect(() => {
    async function loadLocations() {
      const { data, error } = await supabase
        .from("locations")
        .select("*");

      if (error) {
        console.error(error);
        return;
      }

      const mappedLocations: Location[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        position: [item.latitude, item.longitude],
        radiusMeters: item.radius_meters,
        points: item.points,
        difficulty: item.difficulty,
      }));

      setLocations(mappedLocations);
    }

    loadLocations();
  }, []);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
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
  }, []);

    useEffect(() => {
    async function loadMyCheckins() {
      if (!user?.email) return;

      const { data, error } = await supabase
        .from("checkins")
        .select("location_id, created_at")
        .eq("user_name", user.email);

      if (error) {
        console.error(error);
        return;
      }

      setMyCheckins((data ?? []) as MyCheckin[]);
    }

    loadMyCheckins();
  }, [user]);

function isCheckedIn(locationId: number) {
  return myCheckins.some((checkin) => checkin.location_id === locationId);
}

function isCheckedInLast24Hours(locationId: number) {
  const since = Date.now() - 24 * 60 * 60 * 1000;

  return myCheckins.some((checkin) => {
    return (
      checkin.location_id === locationId &&
      new Date(checkin.created_at).getTime() >= since
    );
  });
}

function getMarkerIcon(locationId: number) {
  const recent = isCheckedInLast24Hours(locationId);
  const visited = isCheckedIn(locationId);

  const color = recent ? "#16a34a" : visited ? "#2563eb" : "#dc2626";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 22px;
        height: 22px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 6px rgba(0,0,0,0.45);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

  async function handleCheckIn(location: Location) {
    if (!user?.email) {
      alert("Logg inn først");
      return;
    }
    if (!userPosition) {
      alert("Fant ikke posisjonen din ennå.");
      return;
    }

    const distance = getDistanceInMeters(userPosition, location.position);

    if (distance > location.radiusMeters) {
      alert(`Du er for langt unna. Avstand: ${Math.round(distance)} meter.`);
      return;
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: recentCheckins, error: recentError } = await supabase
      .from("checkins")
      .select("id")
      .eq("user_name", user.email)
      .eq("location_id", location.id)
      .gte("created_at", since);

    if (recentError) {
      console.error(recentError);
      alert("Klarte ikke sjekke tidligere innsjekking.");
      return;
    }

    if (recentCheckins && recentCheckins.length > 0) {
      alert("Du har allerede sjekket inn her siste 24 timer.");
      return;
    }

    const { error } = await supabase.from("checkins").insert({
        user_name: user.email,
        location_id: location.id,
      });

      if (error) {
        if (error.code === "23505") {
          alert("Du har allerede sjekket inn her.");
          setMyCheckins((prev) => [
  ...prev,
  {
    location_id: location.id,
    created_at: new Date().toISOString(),
  },
]);
          return;
        }

        console.error(error);
        alert("Noe gikk galt ved innsjekking.");
        return;
      }

      setMyCheckins((prev) => [
  ...prev,
  {
    location_id: location.id,
    created_at: new Date().toISOString(),
  },
]);

alert(`Du sjekket inn på ${location.name}!`);
  }

  return (
    <div>
      <MapContainer
        center={[58.27, 7.97]}
        zoom={13}
        scrollWheelZoom={true}
        style={{
          height: "65vh",
          width: "calc(100% - 32px)",
          margin: "0 16px",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <TileLayer
          attribution='&copy; Kartverket'
          url="https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png"
        />

        <UserLocation onPositionFound={setUserPosition} />

        {locations.map((location) => {
          const distance = userPosition
            ? getDistanceInMeters(userPosition, location.position)
            : null;

          const isCloseEnough =
            distance !== null && distance <= location.radiusMeters;

          const hasVisited = isCheckedIn(location.id);
const isRecent = isCheckedInLast24Hours(location.id);

          return (
            <Marker
              key={location.id}
              position={location.position}
              icon={getMarkerIcon(location.id)}
            >
              <Popup>
                <strong>{location.name}</strong>
                <br />
                Vanskelighet: {location.difficulty}
                <br />
                Poeng: {location.points}
                <br />
                Radius: {location.radiusMeters} meter
                <br />
                <br />

                {distance !== null ? (
                  <>
                    Avstand: {Math.round(distance)} meter
                    <br />
                    Radius: {location.radiusMeters} meter
                    <br />
                    <br />
                  </>
                ) : (
                  <>
                    Henter posisjon...
                    <br />
                    <br />
                  </>
                )}

                {isRecent ? (
  <strong>✅ Besøkt siste 24 timer</strong>
) : (
  <>
    {hasVisited && (
      <>
        <strong>✅ Besøkt tidligere</strong>
        <br />
        <br />
      </>
    )}

    <button
      onClick={() => handleCheckIn(location)}
      disabled={!isCloseEnough}
      style={{
        padding: "8px 12px",
        borderRadius: "8px",
        border: "none",
        background: isCloseEnough ? "#166534" : "#ccc",
        color: "white",
        cursor: isCloseEnough ? "pointer" : "not-allowed",
      }}
    >
      Sjekk inn
    </button>
  </>
)}

                {!isCloseEnough && !isCheckedIn && distance !== null && (
                  <>
                    <br />
                    <small>Du må være nærmere for å sjekke inn.</small>
                  </>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div
        style={{
          margin: "12px 16px",
          padding: "14px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        }}
      >
        <strong>Besøkte steder:</strong>{" "}
        {new Set(myCheckins.map((c) => c.location_id)).size} av {locations.length}
      </div>
    </div>
  );
}