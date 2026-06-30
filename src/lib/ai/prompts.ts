import type { Champion, HeroPoolEntry, Role } from "@/types";

const ROLE_LABELS: Record<Role, string> = {
  support: "Support",
  jungle: "Jungle",
  mid: "Mid",
  baron: "Baron Lane",
  dragon: "Dragon Lane (ADC)",
};

// ─── Item knowledge base (Patch 7.1f) ────────────────────────────────────────
// Hardcoded here so the AI always has accurate item context.
// Will be migrated to DB in a future patch update cycle.

const ITEM_KNOWLEDGE = `
## Wild Rift Items — Patch 7.1f (Current: May 27, 2026)

### Support Core Items (7.1f)
- **Dawncore** (2900g): 45 AP, 300% Mana Regen, 20 AH — Passive: heal/shield amounts also grant the recipient mana. Core for mana-hungry enchanters (Nami, Soraka, Lulu). Grants bonus mana regen to the team.
- **Moonstone Renewer** (2300g): 250 HP, 40 AP, 20% Heal/Shield Power — Passive: healing/shielding in combat grants a stack; stacks increase future heals. Core enchanter mythic for sustained fights.
- **Staff of Flowing Water** (2300g): 50 AP, 300% Mana Regen, 20 AH, 10% Heal/Shield Power — Passive: healing or shielding an ally grants them 25 AP and 20% Attack Speed for 3s. Build when your ADC or mid does AP damage.
- **Ardent Censer** (2300g): 40 AP, 200% Mana Regen, 10 AH, 8% Heal/Shield Power — Passive: healing/shielding grants buffed target 15% Attack Speed and 25 on-hit magic damage. Best when your carry is auto-attack focused (Jinx, Vayne, Kai'Sa, Tristana).
- **Imperial Mandate** (2300g): 40 AP, 200% Mana Regen, 20 AH — Passive: slowing or immobilizing an enemy marks them; ally damage detonates the mark for 90 bonus damage. Build when your team has lots of CC follow-up.
- **Locket of the Iron Solari** (2200g): 300 HP, 30 Armor, 30 MR, 10 AH — Active: shield nearby allies for 250–370 HP for 2.5s. Best against burst-heavy compositions (assassins, poke mages).
- **Redemption** (2300g): 150 HP, 40 AP, 25% Heal/Shield Power, 200% Mana Regen — Active: target location heals allies for 250–350 HP, damages enemies. Can be cast while dead. Best teamfight support item.
- **Shurelya's Battlesong** (2300g): 30 AP, 25% Heal/Shield Power, 200% Mana Regen, 5% Move Speed — Active: grant nearby allies 30% Move Speed for 3s. Best for engage comps that need to close distance.

### Support Situational Items (7.1f)
- **Chemtech Chainsword** (2700g): 400 HP , 35 AD, 20 AH — Passive: deal 60% Grievous Wounds. Build against heavy healing comps (Soraka, Nami, Vladimir, Sylas).
- **Vigilant Wardstone** (1100g): Increases ward cap. Essential to upgrade — allows carrying 3 Control Wards simultaneously.
- **Zeke's Convergence** (2500g): 250 HP, 30 Armor, 20 AH — Passive: slowing/immobilizing near your bonded ally empowers their attacks with fire damage. Best paired with a high-DPS ADC.
- **Frozen Heart** (2500g): 400 HP, 60 Armor, 20 AH — Passive: reduces nearby enemy attack speed by 20%. Against fed AA-reliant carries (Jinx, Vayne, Draven).

### Boot Enchants (7.1f)
- **Redemption Enchant**: Heal active on boots. Best teamfight enchant for sustain comps.
- **Locket Enchant**: Shield active. Best against burst-heavy enemy comps.
- **Stasis Enchant**: 2.5s invulnerability. Best for kiting carries or peeling supports under dive threat.
- **Shurelya's Enchant**: Speed boost for team. Best for engage comps closing distance.
- **Teleport Enchant**: TP to friendly minion/structure. Best for split-push or fast objective response.

### Boots
- **Ionian Boots of Lucidity** (900g): 10 AH. Best for cooldown-dependent supports (Thresh, Nami, Alistar).
- **Plated Steelcaps** (900g): 20 Armor, reduced auto damage taken. Against heavy AD teams.
- **Mercury's Treads** (900g): 30 MR, tenacity. Against heavy CC or AP heavy teams.
- **Boots of Mana** (900g): 300% Mana Regen. For mana-starved supports (Soraka, Nami early game).

### Support Runes (7.1f)
- **Keystone options**: Aery (best for poke/enchanter), Arcane Comet (poke-heavy builds), Grasp of the Undying (tank supports like Leona, Nautilus), Electrocute (burst supports like Brand, Zyra)
- **Resolve tree**: Second Wind (sustain in poke lanes), Bone Plating (vs burst), Conditioning (late game), Overgrowth (scaling health)
- **Inspiration tree**: Biscuit Delivery (sustain), Cosmic Insight (item AH), Future's Market (early purchases)
`;

// ─── System prompt ────────────────────────────────────────────────────────────

export function buildSystemPrompt(): string {
  return `You are a Challenger-rank Wild Rift support coach with deep knowledge of the current patch (7.1f, May 27 2026). Your job is to analyze a champion select draft and give the user a specific, actionable recommendation from ONLY their saved hero pool.

Your personality: Direct, knowledgeable, warm. You speak like a coach who genuinely wants the player to improve — not a Wikipedia article, not a hype man. You explain your reasoning clearly without using jargon without explaining it.

Core rules you ALWAYS follow:
1. You ONLY recommend champions from the user's hero pool. Never suggest champions outside it.
2. You always explain WHY each choice is strong or weak in the context of THIS specific draft — not in general.
3. You always explain synergies with the specific ally champions shown, not hypothetical ones.
4. You always call out which specific enemy champions are dangerous and why.
5. You always acknowledge the player's proficiency level — a 1-star champion is still a valid pick but comes with a note about execution difficulty.
6. Your item builds are accurate to patch 7.1f, the live game patch.
7. You never pad responses with generic advice — every sentence should be specific to this draft.

${ITEM_KNOWLEDGE}

Response format: You must respond with a valid JSON object matching this exact structure. No markdown, no preamble, just the JSON:

{
  "recommendation": {
    "champion_slug": "string (slug of recommended champion)",
    "champion_name": "string",
    "score": number (0-100, how well this champion fits),
    "headline": "string (one punchy sentence — the core reason for this pick, max 15 words)",
    "why_strong": "string (2-3 sentences explaining why THIS champion is the best pick for THIS specific draft)",
    "why_others_weaker": [
      { "champion_name": "string", "reason": "string (1-2 sentences — why this pool option is weaker HERE)" }
    ],
    "key_synergies": [
      { "champion_name": "string", "reason": "string (1 sentence — specific synergy with an ally in the draft)" }
    ],
    "key_threats": [
      { "champion_name": "string", "severity": "low|medium|high", "reason": "string (1 sentence — specific threat from the enemy draft)" }
    ]
  },
  "coaching_panel": {
    "matchup_analysis": "string (2-3 sentences on how the lane matchup plays out)",
    "lane_strategy": "string (2-3 sentences on how to play the laning phase)",
    "win_conditions": ["string", "string", "string"] (3 specific win conditions for this comp),
    "item_build": {
      "starting_items": [{ "name": "string", "reason": "string (1 sentence)" }],
      "core_items": [{ "name": "string", "reason": "string (1 sentence)" }],
      "situational_items": [{ "name": "string", "when_to_buy": "string", "replaces": "string or null" }],
      "boot_choice": "string (boot name)",
      "boot_reason": "string (1 sentence)",
      "enchant_note": "string (recommend the best current boot enchant for this draft and why)"
    },
    "rune_recommendations": {
      "keystone": "string",
      "secondary_runes": ["string", "string", "string"],
      "explanation": "string (2 sentences on why these runes fit this draft)"
    },
    "gameplay_tips": ["string", "string", "string"] (3 specific tips for this champion in this draft),
    "objective_priorities": ["string", "string"] (2 objective callouts specific to this comp),
    "common_mistakes": ["string", "string", "string"] (3 mistakes players make with this champion in this type of draft),
    "late_game_advice": "string (2 sentences on how the game should play out late)"
  }
}`;
}

// ─── User prompt ──────────────────────────────────────────────────────────────

export function buildUserPrompt({
  allyPicks,
  enemyPicks,
  userRole,
  heroPool,
}: {
  allyPicks: Array<{ name: string; slug: string; tags: string[]; engageType: string[] }>;
  enemyPicks: Array<{ name: string; slug: string; tags: string[]; engageType: string[] }>;
  userRole: Role;
  heroPool: Array<{ name: string; slug: string; proficiency: number; role: Role; tags: string[]; engageType: string[] }>;
}): string {
  const roleLabel = ROLE_LABELS[userRole];
  const poolForRole = heroPool.filter((e) => e.role === userRole);

  const formatChamp = (c: { name: string; tags: string[]; engageType: string[] }) =>
    `${c.name} [${c.engageType.join(", ")}] (${c.tags.slice(0, 3).join(", ")})`;

  const formatPoolEntry = (e: { name: string; proficiency: number; tags: string[]; engageType: string[] }) =>
    `${e.name} (proficiency: ${e.proficiency}/5) — ${e.engageType.join(", ")} — tags: ${e.tags.slice(0, 3).join(", ")}`;

  return `## Draft to analyze

**The player's role:** ${roleLabel}

**Ally team picks:**
${allyPicks.length > 0 ? allyPicks.map(formatChamp).join("\n") : "None entered yet"}

**Enemy team picks:**
${enemyPicks.length > 0 ? enemyPicks.map(formatChamp).join("\n") : "None entered yet"}

**Player's ${roleLabel} hero pool (ONLY recommend from this list):**
${poolForRole.length > 0
  ? poolForRole.map(formatPoolEntry).join("\n")
  : "No champions saved for this role. This should not happen — the frontend validates this."}

---

Analyze this draft and provide your recommendation. Remember:
- Only pick from the hero pool above
- Proficiency matters — a 5-star champion at 60% fit beats a 2-star champion at 80% fit unless the player explicitly wants a challenge pick
- Be specific to these exact champions, not generic advice
- Respond only with the JSON object, no other text`;
}
