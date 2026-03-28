// ---------- Input ----------
export interface ProfileInput {
  photos: PhotoFile[];
  bio: string;
  age?: number;
  job?: string;
  interests?: string;
  height?: number;
  education?: string;
  relationshipGoal?: string;
}

export interface PhotoFile {
  id: string;
  base64: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  originalName: string;
}

// ---------- Claude raw response ----------
export interface ClaudePhotoScore {
  photoId: string;
  jawline: number;
  smileEyeContact: number;
  lightingSkin: number;
  background: number;
  lifestyle: number;
  subtotal: number;
  feedback: string[];
  feedbackDetail: string[];
  enhanceable: boolean;
}

export interface ClaudeBioScore {
  text: string;
  partnerInterest: number;
  originality: number;
  adventurousness: number;
  length: number;
  noNegativity: number;
  subtotal: number;
  feedback: string[];
}

export interface VibeAnalysis {
  vibeLabel: string;        // e.g. "Avontuurlijk & Warm"
  vibeEmoji: string;        // single emoji representing the vibe
  vibeScore: number;        // 0-10
  vibeDescription: string;  // 2-3 zinnen over de algehele indruk
  unintendedSignals: string[]; // 2-4 dingen die je onbedoeld communiceert
  conversationHooks: string[]; // 2-4 concrete haakjes uit bio/foto's die gespreksstarters zijn
  firstImpression: {
    verdict: "Stopper" | "Twijfelgeval" | "Passer";
    score: number;           // 0-10
    reasoning: string;       // 1-2 zinnen waarom
  };
}

export interface ClaudeAnalysisResponse {
  photos: ClaudePhotoScore[];
  bio: ClaudeBioScore;
  vibe: VibeAnalysis;
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
  vibe: VibeAnalysis;
  photosTotalPts: number;
  totalScore: number;
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

// ---------- Iteration tracker ----------
export interface ScoreSnapshot {
  date: string;       // ISO date string
  totalScore: number;
  photosTotalPts: number;
  bioSubtotal: number;
  photoCount: number;
}
