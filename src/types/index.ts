// ---------- Input ----------
export interface ProfileInput {
  photos: PhotoFile[];
  bio: string;
  age?: number;
  job?: string;
  interests?: string;
}

export interface PhotoFile {
  id: string;
  base64: string; // data:<mime>;base64,<data>
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  originalName: string;
}

// ---------- Claude raw response ----------
export interface ClaudePhotoScore {
  photoId: string;
  jawline: number;         // 0-4
  smileEyeContact: number; // 0-4
  lightingSkin: number;    // 0-2
  background: number;      // 0-1
  lifestyle: number;       // 0-1
  subtotal: number;        // 0-12
  feedback: string[];      // 3 actionable tips
  enhanceable: boolean;
}

export interface ClaudeBioScore {
  text: string;
  partnerInterest: number;   // 0-8
  originality: number;       // 0-7
  adventurousness: number;   // 0-5
  length: number;            // 0-5
  noNegativity: number;      // 0-5
  subtotal: number;          // 0-30
  feedback: string[];
}

export interface ClaudeAnalysisResponse {
  photos: ClaudePhotoScore[];
  bio: ClaudeBioScore;
}

// ---------- Computed scores ----------
export interface CompletenessScore {
  photoCountPts: number;
  bioPts: number;
  optionalFieldsPts: number;
  subtotal: number;
}

export interface AnalysisResult {
  photoScores: ClaudePhotoScore[];
  bioScore: ClaudeBioScore;
  completenessScore: CompletenessScore;
  photosTotalPts: number; // top-5 × subtotals, max 60
  totalScore: number;     // 0-100
  worstPhotoIds: string[];
}

// ---------- Enhancement ----------
export interface EnhancementResult {
  photoId: string;
  originalBase64: string;
  enhancedUrl: string;
  newPhotoScore: ClaudePhotoScore;
  scoreDelta: number;
}
