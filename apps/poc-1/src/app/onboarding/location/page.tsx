"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Navigation, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/user-context";

export default function LocationPage() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const [query, setQuery] = useState(user.home_location?.display_name ?? "");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [confirmedLocation, setConfirmedLocation] = useState(user.home_location);

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser. Please type your city name.");
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const displayName = `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°W`;
        setConfirmedLocation({ lat: latitude, lng: longitude, display_name: displayName });
        setQuery(displayName);
        setGpsLoading(false);
      },
      () => {
        setGpsError("Could not get your location. Please type your city name instead.");
        setGpsLoading(false);
      }
    );
  };

  const handleContinue = () => {
    // If user typed a city name without GPS, store it with placeholder coords
    if (query.trim() && !confirmedLocation) {
      updateUser({
        home_location: { lat: 0, lng: 0, display_name: query.trim() },
      });
    } else if (confirmedLocation) {
      updateUser({ home_location: confirmedLocation });
    }
    router.push("/onboarding/drive-radius");
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-snow-text mb-1">
            Where do you start your ski trips?
          </h1>
          <p className="text-xs text-snow-text-muted">
            Used to find resorts within driving distance.
          </p>
        </div>

        <Input
          icon={<MapPin className="w-4 h-4" />}
          placeholder="City name (e.g. Denver, CO)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setConfirmedLocation(null);
            setGpsError(null);
          }}
        />

        <button
          onClick={handleGPS}
          disabled={gpsLoading}
          className="flex items-center gap-2 text-snow-primary hover:text-snow-primary/80 transition-colors text-xs font-medium disabled:opacity-50"
        >
          {gpsLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          Use current location
        </button>

        {gpsError && (
          <p className="text-xs text-snow-alert">{gpsError}</p>
        )}

        {confirmedLocation && (
          <div className="flex items-center gap-2 text-snow-go text-xs">
            <Check className="w-3.5 h-3.5" />
            {confirmedLocation.display_name}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-snow-surface pt-4 pb-2">
        <Button
          fullWidth
          size="lg"
          onClick={handleContinue}
          disabled={!query.trim() && !confirmedLocation}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
