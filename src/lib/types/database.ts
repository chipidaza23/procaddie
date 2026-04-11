// ============================================================
// ProCaddie — Single source of truth for all database types
// Every agent imports from here. Do NOT define duplicate types.
// ============================================================

// ---------- User & Profile ----------

export interface User {
  id: string;
  email: string;
  name: string | null;
  handicap_index: number | null;
  created_at: string;
  updated_at: string;
}

export type ShotShape = "draw" | "fade" | "straight" | "varies";
export type MissTendency = "left" | "right" | "short" | "long" | "varies";
export type RiskTolerance = "aggressive" | "moderate" | "conservative";
export type TeeBox = "championship" | "blue" | "white" | "forward";

export interface PlayerProfile {
  id: string;
  user_id: string;
  shot_shape: ShotShape;
  miss_tendency: MissTendency;
  risk_tolerance: RiskTolerance;
  strengths: string[];
  weaknesses: string[];
  preferred_tee_box: TeeBox;
  updated_at: string;
}

export type ClubType = "driver" | "wood" | "hybrid" | "iron" | "wedge" | "putter";

export interface ClubDistance {
  id: string;
  profile_id: string;
  club_name: string;
  carry_distance_yards: number;
  total_distance_yards: number;
  club_type: ClubType;
  sort_order: number;
}

// ---------- Course & Holes ----------

export interface Course {
  id: string;
  external_id: string;
  name: string;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  par: number;
  rating: number | null;
  slope: number | null;
  num_holes: number;
  last_synced_at: string | null;
  created_at: string;
}

export type FeatureType =
  | "fairway"
  | "green"
  | "bunker"
  | "water"
  | "rough"
  | "trees"
  | "cart_path";

export interface FeatureSegment {
  type: FeatureType;
  polygon: [number, number][];
  confidence: number;
}

export interface Hole {
  id: string;
  course_id: string;
  hole_number: number;
  par: number;
  distance_yards: Record<string, number>; // e.g. { "blue": 410, "white": 385 }
  handicap_index: number | null;
  tee_latitude: number | null;
  tee_longitude: number | null;
  green_latitude: number | null;
  green_longitude: number | null;
  aerial_image_url: string | null;
  feature_segments: FeatureSegment[] | null;
  created_at: string;
}

// ---------- Strategy ----------

export interface TeeStrategy {
  recommended_club: string;
  target_description: string;
  landing_zone: string;
  danger_side: string;
  backup_play: string;
  notes: string;
}

export interface ApproachStrategy {
  recommended_club: string;
  target_description: string;
  layup_distance: number | null;
  bailout_zone: string;
  pin_position_notes: string;
  notes: string;
}

export interface GreenStrategy {
  safe_miss_zones: string[];
  danger_miss_zones: string[];
  green_notes: string;
  approach_angle: string;
}

export interface ScoringNotes {
  birdie_strategy: string;
  par_strategy: string;
  bogey_avoidance: string;
}

export interface HoleStrategy {
  id: string;
  hole_id: string;
  profile_id: string;
  tee_strategy: TeeStrategy;
  approach_strategy: ApproachStrategy;
  green_strategy: GreenStrategy;
  scoring_notes: ScoringNotes;
  overall_notes: string;
  generated_at: string;
  claude_model_version: string;
}

// ---------- User Notes ----------

export type NoteType =
  | "general"
  | "tee"
  | "approach"
  | "green"
  | "weather"
  | "pin";

export interface UserNote {
  id: string;
  user_id: string;
  hole_id: string;
  note_text: string;
  note_type: NoteType;
  round_date: string | null;
  created_at: string;
  updated_at: string;
}
