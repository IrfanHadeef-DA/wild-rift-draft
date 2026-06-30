// ─── Champion Types ──────────────────────────────────────────────────────────

export type DamageType = "physical" | "magic" | "mixed";
export type EngageType = "engage" | "peel" | "poke" | "heal" | "utility" | "carry";
export type Difficulty = "easy" | "medium" | "hard";
export type Role = "support" | "jungle" | "mid" | "baron" | "dragon";

export interface Champion {
  id: string;
  slug: string;
  name: string;
  roles: Role[];
  damage_type: DamageType;
  engage_type: EngageType[];
  difficulty: Difficulty;
  patch_version: string;
  metadata: ChampionMetadata;
  updated_at: string;
}

export interface ChampionMetadata {
  title: string;
  image_url?: string;
  splash_url?: string;
  tags: string[];
  passive_name?: string;
  ability_names?: string[];
}

// ─── Hero Pool Types ─────────────────────────────────────────────────────────

export interface HeroPoolEntry {
  id: string;
  user_id: string;
  champion_id: string;
  role: Role;
  proficiency: 1 | 2 | 3 | 4 | 5;
  created_at: string;
  champion?: Champion;
}

// ─── Draft Types ─────────────────────────────────────────────────────────────

export interface DraftPick {
  champion_id: string;
  role?: Role;
  champion?: Champion;
}

export interface DraftState {
  ally_picks: DraftPick[];
  enemy_picks: DraftPick[];
  user_role: Role;
}

export interface DraftSession {
  id: string;
  user_id: string;
  picked_champion_id: string | null;
  ally_picks: DraftPick[];
  enemy_picks: DraftPick[];
  outcome: "win" | "loss" | "unknown" | null;
  created_at: string;
  picked_champion?: Champion;
}

// ─── Analysis Types ──────────────────────────────────────────────────────────

export interface Recommendation {
  champion_id: string;
  champion_name: string;
  score: number;
  why_strong: string;
  why_others_weaker: string[];
  key_synergies: SynergyNote[];
  key_threats: ThreatNote[];
}

export interface SynergyNote {
  champion_name: string;
  reason: string;
  strength: "weak" | "moderate" | "strong";
}

export interface ThreatNote {
  champion_name: string;
  reason: string;
  severity: "low" | "medium" | "high";
}

export interface CoachingPanel {
  matchup_analysis: string;
  lane_strategy: string;
  win_conditions: string[];
  item_build: ItemBuild;
  rune_recommendations: RunePage;
  boot_enchant: BootEnchant;
  gameplay_tips: string[];
  objective_priorities: string[];
  late_game_advice: string;
  common_mistakes: string[];
}

export interface ItemBuild {
  core_items: Item[];
  situational_items: SituationalItem[];
  starting_items: Item[];
  explanation: string;
}

export interface Item {
  name: string;
  reason: string;
  image_url?: string;
}

export interface SituationalItem extends Item {
  when_to_buy: string;
  replaces?: string;
}

export interface RunePage {
  keystone: string;
  secondary_runes: string[];
  explanation: string;
}

export interface BootEnchant {
  recommended: string;
  reason: string;
  situational?: string;
  situational_reason?: string;
}

// ─── Analysis Cache ───────────────────────────────────────────────────────────

export interface AnalysisCache {
  id: string;
  draft_hash: string;
  recommendation: Recommendation;
  coaching_panel: CoachingPanel;
  expires_at: string;
  created_at: string;
}

// ─── User / Profile ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export type ApiSuccess<T> = { data: T; error: null };
export type ApiError = { data: null; error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
