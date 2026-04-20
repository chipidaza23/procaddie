"use client";

import { useState } from "react";
import { Stage, Layer } from "react-konva";
import { Layers, Target, Navigation } from "lucide-react";
import { useMapProjection } from "@/lib/hooks/use-map-projection";
import type { FeatureSegment } from "@/lib/types";
import { ZoneLayer } from "./zone-layer";
import { DistanceArcs } from "./distance-arcs";
import { TargetLines } from "./target-lines";

interface MapCanvasOverlayProps {
  /** The Mapbox Map instance, obtained via HoleAerialMap's onMapReady callback */
  map: unknown | null;
  segments?: FeatureSegment[];
  teeLat?: number;
  teeLng?: number;
  greenLat?: number;
  greenLng?: number;
  showZones?: boolean;
  showArcs?: boolean;
  showLines?: boolean;
}

/**
 * Positions a Konva Stage absolutely over the Mapbox satellite map so that
 * annotations (distance arcs, zone polygons, target lines) render directly
 * on top of the satellite imagery.
 *
 * The Stage has pointer-events: none so all map interactions pass through.
 * A glassmorphism toolbar at the bottom toggles individual annotation layers.
 */
export function MapCanvasOverlay({
  map,
  segments = [],
  teeLat,
  teeLng,
  greenLat,
  greenLng,
  showZones: initialShowZones = true,
  showArcs: initialShowArcs = true,
  showLines: initialShowLines = true,
}: MapCanvasOverlayProps) {
  const { project, dimensions } = useMapProjection(map);

  const [showZones, setShowZones] = useState(initialShowZones);
  const [showArcs, setShowArcs] = useState(initialShowArcs);
  const [showLines, setShowLines] = useState(initialShowLines);

  const { width, height } = dimensions;

  // Don't render anything until the map is ready and has dimensions
  if (!map || !project || width === 0 || height === 0) {
    return null;
  }

  const hasGreenCoords = greenLat != null && greenLng != null;
  const hasTeeCoords = teeLat != null && teeLng != null;
  const hasLineCoords = hasGreenCoords && hasTeeCoords;

  return (
    <>
      {/* Konva canvas layered directly over the map */}
      <Stage
        width={width}
        height={height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      >
        {showZones && segments.length > 0 && (
          <ZoneLayer segments={segments} project={project} />
        )}

        {showArcs && hasGreenCoords && (
          <DistanceArcs
            greenLat={greenLat!}
            greenLng={greenLng!}
            project={project}
          />
        )}

        {showLines && hasLineCoords && (
          <TargetLines
            teeLat={teeLat!}
            teeLng={teeLng!}
            greenLat={greenLat!}
            greenLng={greenLng!}
            project={project}
          />
        )}

        {/* Empty layer required by Konva when no active children */}
        <Layer />
      </Stage>

      {/* Glassmorphism floating toggle toolbar */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 rounded-full px-2 py-1.5 backdrop-blur-md bg-black/40"
        style={{ pointerEvents: "auto" }}
      >
        <ToggleButton
          active={showZones}
          onClick={() => setShowZones((v) => !v)}
          label="Zones"
          title="Toggle zone overlays"
        >
          <Layers size={16} />
        </ToggleButton>

        <ToggleButton
          active={showArcs}
          onClick={() => setShowArcs((v) => !v)}
          label="Distances"
          title="Toggle distance arcs"
        >
          <Target size={16} />
        </ToggleButton>

        <ToggleButton
          active={showLines}
          onClick={() => setShowLines((v) => !v)}
          label="Lines"
          title="Toggle target lines"
        >
          <Navigation size={16} />
        </ToggleButton>
      </div>
    </>
  );
}

interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  title?: string;
  children: React.ReactNode;
}

function ToggleButton({ active, onClick, label, title, children }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={label}
      aria-pressed={active}
      className={[
        "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "text-white"
          : "text-white/40 hover:text-white/70",
      ].join(" ")}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
