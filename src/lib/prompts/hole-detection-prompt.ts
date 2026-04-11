export function buildDetectionPrompt(
  courseName: string,
  numHoles: number,
  holeYardages: { number: number; yards: number | null }[]
): string {
  const yardageList = holeYardages
    .map((h) => `Hole ${h.number}: ${h.yards != null ? `~${h.yards} yards` : "unknown"}`)
    .join("\n");

  return `This is a satellite image of ${courseName}, an ${numHoles}-hole golf course. The image is 2560x2560 pixels (high-resolution @2x retina capture).

Your task: identify the center pixel coordinates of each green and tee box for all ${numHoles} holes.

Visual cues:
- Greens are distinctive smooth oval or circular areas with a uniform, closely-mowed dark-green surface — they appear as clean, well-defined shapes distinct from the rougher fairway texture.
- Tee boxes are small rectangular or square closely-mowed areas at the start of each fairway — they are usually elevated or slightly different in tone from surrounding rough.
- Fairways are the mowed grass corridors connecting tees to greens.
- Number holes starting from near the clubhouse (usually at the bottom or edge of the image) in normal playing order.

Expected hole yardages (tee to green) for validation context:
${yardageList}

Return ONLY a valid JSON object in this exact format — no markdown, no explanation, no text before or after:
{
  "holes": [
    {
      "number": 1,
      "green": { "x": 640, "y": 1200 },
      "tee": { "x": 620, "y": 1800 },
      "confidence": 0.9
    }
  ]
}

Coordinates are pixel positions in the 2560x2560 image (origin top-left). Confidence is 0.0–1.0 reflecting how certain you are about the identification. Include an entry for every hole number 1 through ${numHoles}, even if confidence is low.`;
}
