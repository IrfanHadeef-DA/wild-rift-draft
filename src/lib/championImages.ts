// Data Dragon CDN — official Riot-hosted champion portraits, free and public.
// Pattern: https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{key}.png
// Most keys match the champion name, but several are irregular and must be mapped.

export const DDRAGON_VERSION = "14.23.1";

const SPECIAL_KEYS: Record<string, string> = {
  "wukong": "MonkeyKing",
  "nunu": "Nunu",
  "vel-koz": "Velkoz",
  "kai-sa": "Kaisa",
  "kha-zix": "Khazix",
  "k-sante": "KSante",
  "kog-maw": "KogMaw",
  "twisted-fate": "TwistedFate",
  "xin-zhao": "XinZhao",
  "jarvan-iv": "JarvanIV",
  "lee-sin": "LeeSin",
  "miss-fortune": "MissFortune",
  "master-yi": "MasterYi",
  "dr-mundo": "DrMundo",
  "aurelion-sol": "AurelionSol",
  "tahm-kench": "TahmKench",
};

export function getChampionImageUrl(slug: string): string {
  const key = SPECIAL_KEYS[slug] ?? toPascalCase(slug);
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${key}.png`;
}

function toPascalCase(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
