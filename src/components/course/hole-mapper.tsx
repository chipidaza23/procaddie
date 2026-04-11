"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMapbox } from "@/lib/hooks/use-mapbox";
import { MAPBOX_STYLE_SATELLITE } from "@/lib/services/mapbox";
import { getDistance } from "@/lib/utils/geo";
import type { Hole } from "@/lib/types/database";
import type { MapboxGLModule } from "@/lib/hooks/use-mapbox";

interface HoleMapperProps {
  courseId: string;
  courseLat: number;
  courseLng: number;
  holes: Hole[];
  onComplete: () => void;
}

type PinStep = "tee" | "green" | "done";

interface HolePin {
  holeId: string;
  tee: { lat: number; lng: number } | null;
  green: { lat: number; lng: number } | null;
}

export function HoleMapper({
  courseId,
  courseLat,
  courseLng,
  holes,
  onComplete,
}: HoleMapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, unknown[]>>(new Map());
  const mapboxModule = useMapbox();

  const [selectedHoleIndex, setSelectedHoleIndex] = useState(0);
  const [step, setStep] = useState<PinStep>("tee");
  const [pins, setPins] = useState<Map<string, HolePin>>(new Map());
  const [saving, setSaving] = useState(false);
  const [savedHoles, setSavedHoles] = useState<Set<string>>(new Set());

  const selectedHole = holes[selectedHoleIndex];

  const getPin = useCallback(
    (holeId: string): HolePin =>
      pins.get(holeId) ?? { holeId, tee: null, green: null },
    [pins]
  );

  const currentPin = selectedHole ? getPin(selectedHole.id) : null;

  const detectedDistance =
    currentPin?.tee && currentPin?.green
      ? Math.round(
          getDistance(
            currentPin.tee.lat,
            currentPin.tee.lng,
            currentPin.green.lat,
            currentPin.green.lng
          )
        )
      : null;

  const removeHoleMarkers = useCallback((holeId: string) => {
    const markers = markersRef.current.get(holeId) ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    markers.forEach((m) => (m as any).remove?.());
    markersRef.current.set(holeId, []);
  }, []);

  const addMarker = useCallback(
    (
      mapbox: MapboxGLModule,
      map: unknown,
      lat: number,
      lng: number,
      color: string,
      holeId: string,
      draggable: boolean,
      onDragEnd?: (lat: number, lng: number) => void
    ) => {
      const el = document.createElement("div");
      el.style.cssText = `width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.4);cursor:${draggable ? "grab" : "default"};`;

      const marker = new mapbox.Marker({ element: el, draggable })
        .setLngLat([lng, lat])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .addTo(map as any);

      if (draggable && onDragEnd) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        marker.on("dragend", () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const lngLat = (marker as any).getLngLat();
          onDragEnd(lngLat.lat, lngLat.lng);
        });
      }

      const existing = markersRef.current.get(holeId) ?? [];
      markersRef.current.set(holeId, [...existing, marker]);
    },
    []
  );

  useEffect(() => {
    if (!mapboxModule || !containerRef.current || mapRef.current) return;

    const map = new mapboxModule.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE_SATELLITE,
      center: [courseLng, courseLat],
      zoom: 15,
      attributionControl: false,
    });

    map.addControl(
      new mapboxModule.NavigationControl({ showCompass: false }),
      "top-right"
    );
    map.addControl(
      new mapboxModule.AttributionControl({ compact: true }),
      "bottom-right"
    );

    mapRef.current = map;

    return () => {
      map.remove?.();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxModule]);

  useEffect(() => {
    const map = mapRef.current;
    const mapbox = mapboxModule;
    if (!map || !mapbox || !selectedHole) return;

    const handleClick = (e: { lngLat: { lat: number; lng: number } }) => {
      const { lat, lng } = e.lngLat;

      setPins((prev) => {
        const next = new Map(prev);
        const pin = next.get(selectedHole.id) ?? {
          holeId: selectedHole.id,
          tee: null,
          green: null,
        };

        if (step === "tee") {
          next.set(selectedHole.id, { ...pin, tee: { lat, lng } });
          setStep("green");
        } else if (step === "green") {
          next.set(selectedHole.id, { ...pin, green: { lat, lng } });
          setStep("done");
        }
        return next;
      });
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [mapboxModule, selectedHole, step]);

  useEffect(() => {
    const map = mapRef.current;
    const mapbox = mapboxModule;
    if (!map || !mapbox || !selectedHole) return;

    removeHoleMarkers(selectedHole.id);

    const pin = getPin(selectedHole.id);

    if (pin.tee) {
      addMarker(
        mapbox,
        map,
        pin.tee.lat,
        pin.tee.lng,
        "#3b82f6",
        selectedHole.id,
        true,
        (lat, lng) => {
          setPins((prev) => {
            const next = new Map(prev);
            const p = next.get(selectedHole.id) ?? {
              holeId: selectedHole.id,
              tee: null,
              green: null,
            };
            next.set(selectedHole.id, { ...p, tee: { lat, lng } });
            return next;
          });
        }
      );
    }

    if (pin.green) {
      addMarker(
        mapbox,
        map,
        pin.green.lat,
        pin.green.lng,
        "#22c55e",
        selectedHole.id,
        true,
        (lat, lng) => {
          setPins((prev) => {
            const next = new Map(prev);
            const p = next.get(selectedHole.id) ?? {
              holeId: selectedHole.id,
              tee: null,
              green: null,
            };
            next.set(selectedHole.id, { ...p, green: { lat, lng } });
            return next;
          });
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins, selectedHole?.id, mapboxModule]);

  const handleReset = () => {
    if (!selectedHole) return;
    removeHoleMarkers(selectedHole.id);
    setPins((prev) => {
      const next = new Map(prev);
      next.delete(selectedHole.id);
      return next;
    });
    setStep("tee");
  };

  const handleSave = async () => {
    if (!selectedHole || !currentPin?.tee || !currentPin?.green) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/holes/${selectedHole.id}/coordinates`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tee_latitude: currentPin.tee.lat,
            tee_longitude: currentPin.tee.lng,
            green_latitude: currentPin.green.lat,
            green_longitude: currentPin.green.lng,
          }),
        }
      );
      if (!res.ok) throw new Error("Save failed");
      setSavedHoles((prev) => new Set(prev).add(selectedHole.id));
      const nextIndex = selectedHoleIndex + 1;
      if (nextIndex < holes.length) {
        setSelectedHoleIndex(nextIndex);
        setStep("tee");
      }
    } catch (err) {
      console.error("Save error", err);
    } finally {
      setSaving(false);
    }
  };

  const statusText =
    step === "tee"
      ? `Click to place tee for Hole ${selectedHole?.hole_number}`
      : step === "green"
        ? `Click to place green for Hole ${selectedHole?.hole_number}`
        : `Hole ${selectedHole?.hole_number} pinned — ${detectedDistance != null ? `${detectedDistance} yds` : ""}`;

  const allSaved = holes.every((h) => savedHoles.has(h.id));

  return (
    <div className="flex h-full gap-4">
      <div className="flex w-48 shrink-0 flex-col gap-2 overflow-y-auto">
        {holes.map((hole, i) => {
          const isSaved = savedHoles.has(hole.id);
          const isSelected = i === selectedHoleIndex;
          return (
            <button
              key={hole.id}
              onClick={() => {
                setSelectedHoleIndex(i);
                setStep(getPin(hole.id).tee ? (getPin(hole.id).green ? "done" : "green") : "tee");
              }}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <span>Hole {hole.hole_number}</span>
              <span>{isSaved ? "✓" : "○"}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="rounded-lg bg-muted px-4 py-2 text-sm">{statusText}</div>

        <div
          ref={containerRef}
          className="flex-1 rounded-xl overflow-hidden bg-muted"
        />

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            disabled={saving}
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={step !== "done" || saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {allSaved && (
            <button
              onClick={onComplete}
              className="ml-auto rounded-lg bg-green-600 px-4 py-2 text-sm text-white"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
