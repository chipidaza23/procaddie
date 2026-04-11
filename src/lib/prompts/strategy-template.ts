import type {
  Hole,
  PlayerProfile,
  ClubDistance,
  FeatureSegment,
} from "@/lib/types";

export function buildStrategyPrompt(
  hole: Hole,
  segments: FeatureSegment[],
  profile: PlayerProfile,
  clubs: ClubDistance[]
): string {
  const sortedClubs = [...clubs].sort((a, b) => a.sort_order - b.sort_order);

  const clubList = sortedClubs
    .map(
      (c) =>
        `  - ${c.club_name}: ${c.carry_distance_yards}y carry / ${c.total_distance_yards}y total`
    )
    .join("\n");

  // Summarise distance_yards record for all tee boxes
  const teeBoxDistances = Object.entries(hole.distance_yards)
    .map(([box, yds]) => `${box}: ${yds}y`)
    .join(", ");

  // Summarise detected segments grouped by type
  const segmentsByType: Record<string, number> = {};
  for (const seg of segments) {
    segmentsByType[seg.type] = (segmentsByType[seg.type] ?? 0) + 1;
  }
  const segmentSummary =
    Object.entries(segmentsByType)
      .map(([type, count]) => `${count}x ${type}`)
      .join(", ") || "no segments detected";

  const detailedSegments = segments
    .slice(0, 20) // cap for prompt length
    .map(
      (s, i) =>
        `  [${i + 1}] type=${s.type}, confidence=${s.confidence.toFixed(2)}, polygon_points=${s.polygon.length}`
    )
    .join("\n");

  return `## Hole ${hole.hole_number} — Par ${hole.par}

### Distances
${teeBoxDistances}

### Hole Coordinates
- Tee: lat ${hole.tee_latitude.toFixed(6)}, lng ${hole.tee_longitude.toFixed(6)}
- Green center: lat ${hole.green_latitude.toFixed(6)}, lng ${hole.green_longitude.toFixed(6)}
${hole.handicap_index != null ? `- Handicap index: ${hole.handicap_index}` : ""}

### Detected Course Features (${segments.length} total)
Summary: ${segmentSummary}

${detailedSegments || "  (no segment detail available)"}

---

## Player Profile

- Shot shape: ${profile.shot_shape}
- Miss tendency: ${profile.miss_tendency}
- Risk tolerance: ${profile.risk_tolerance}
- Preferred tee box: ${profile.preferred_tee_box}
- Strengths: ${profile.strengths.length > 0 ? profile.strengths.join(", ") : "not specified"}
- Weaknesses: ${profile.weaknesses.length > 0 ? profile.weaknesses.join(", ") : "not specified"}

### Club Distances (carry / total)
${clubList || "  (no clubs on file — use typical amateur distances)"}

---

Please generate a complete hole strategy as a JSON object matching the HoleStrategyOutput interface. Account for this player's specific shot shape, miss tendency, and risk tolerance when recommending clubs and targets. Reference specific yardages and club names from the player's bag wherever possible.`;
}
