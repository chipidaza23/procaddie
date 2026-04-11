// ============================================================
// ProCaddie — API request/response contracts
// Phase 2 (API routes) and Phase 3 (UI) both import from here.
// ============================================================

import type { FeatureSegment, HoleStrategy } from "./database";

// ---------- Course Search ----------

export interface CourseSearchParams {
  query: string;
  limit?: number;
  offset?: number;
}

export interface CourseSearchResult {
  external_id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  par: number;
  num_holes: number;
}

export interface CourseSearchResponse {
  results: CourseSearchResult[];
  total: number;
}

// ---------- AI Pipeline ----------

export interface SegmentRequest {
  aerial_image_url: string;
  hole_id: string;
}

export interface SegmentResponse {
  hole_id: string;
  segments: FeatureSegment[];
  processing_time_ms: number;
}

export interface StrategyRequest {
  hole_id: string;
  profile_id: string;
}

export interface StrategyResponse {
  strategy: HoleStrategy;
  tokens_used: number;
  cached: boolean;
}

export interface ProcessCourseRequest {
  course_id: string;
  profile_id: string;
}

export interface ProcessCourseProgress {
  hole_number: number;
  total_holes: number;
  status: "segmenting" | "strategizing" | "complete" | "error";
  message?: string;
}

export interface ProcessCourseResponse {
  course_id: string;
  holes_processed: number;
  total_tokens: number;
  errors: { hole_number: number; error: string }[];
}

// ---------- Questionnaire ----------

export interface QuestionnaireMessage {
  role: "user" | "assistant";
  content: string;
}

export interface QuestionnaireRequest {
  messages: QuestionnaireMessage[];
}

// ---------- User Notes ----------

export interface CreateNoteRequest {
  hole_id: string;
  note_text: string;
  note_type: string;
  round_date?: string;
}

export interface UpdateNoteRequest {
  note_text?: string;
  note_type?: string;
  round_date?: string;
}
