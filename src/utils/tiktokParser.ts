/**
 * Heuristic parser to extract TikTok profile identifiers from raw HTML source code.
 */

export interface ExtractedTikTokProfileInfo {
  numericId: string | null; // e.g., "id" or "userId" (18-20 digits)
  miniProfileId: string | null; // maps to secUid
  name: string | null; // nickname
  headline: string | null; // signature / bio
  imageUrl: string | null; // avatar
  patternsMatched: { patternName: string; value: string }[];
  success: boolean;
}

export function cleanTikTokUrl(url: string): string {
  let clean = url.trim();
  // Support custom handles like @username
  if (clean.startsWith('@')) {
    clean = 'https://www.tiktok.com/' + clean;
  }
  
  if (!/^https?:\/\//i.test(clean)) {
    clean = 'https://' + clean;
  }
  
  try {
    const parsed = new URL(clean);
    if (!/tiktok\.com$/i.test(parsed.hostname)) {
      throw new Error('La URL debe pertenecer al dominio tiktok.com');
    }
    return parsed.toString();
  } catch (error) {
    throw new Error('Formato de URL inválido. Ejemplo: https://www.tiktok.com/@tiktok o @usuario');
  }
}

export function extractTikTokProfileInfo(html: string): ExtractedTikTokProfileInfo {
  const info: ExtractedTikTokProfileInfo = {
    numericId: null,
    miniProfileId: null,
    name: null,
    headline: null,
    imageUrl: null,
    patternsMatched: [],
    success: false,
  };

  if (!html || typeof html !== 'string') {
    return info;
  }

  // --- Regex Rules for TikTok Numeric User ID (18-20 digits) ---
  const numericRules = [
    { name: '"authorId":"<id>"', regex: /"authorId"\s*:\s*"(\d{17,21})"/i },
    { name: '"userId":"<id>"', regex: /"userId"\s*:\s*"(\d{17,21})"/i },
    { name: '"id":"<id>" inside UserModule', regex: /"UserInfo":[\s\S]*?"id"\s*:\s*"(\d{17,21})"/i },
    { name: '"id":"<id>" general', regex: /"id"\s*:\s*"(\d{17,21})"/i },
    { name: 'roomId:"<id>"', regex: /"roomId"\s*:\s*"(\d{17,21})"/i },
    { name: 'tt_user_id cookies/params', regex: /tt_user_id=(\d{17,21})/i }
  ];

  // --- Regex Rules for secUid ---
  const secUidRules = [
    { name: '"secUid":"<id>"', regex: /"secUid"\s*:\s*"([A-Za-z0-9_\-+]{30,})"/i },
    { name: '"secUserId":"<id>"', regex: /"secUserId"\s*:\s*"([A-Za-z0-9_\-+]{30,})"/i },
    { name: 'secUid=<id>', regex: /[?&]secUid=([A-Za-z0-9_\-+]{30,})/i }
  ];

  // --- Regex Rules for Nickname & Metadata ---
  const nameRules = [
    { name: '"nickname":"<name>"', regex: /"nickname"\s*:\s*"([^"]+)"/i },
    { name: 'og:title', regex: /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i },
    { name: 'title tag', regex: /<title>([^<]+?)<\/title>/i }
  ];

  const headlineRules = [
    { name: '"signature":"<bio>"', regex: /"signature"\s*:\s*"([^"]+)"/i },
    { name: 'og:description', regex: /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i }
  ];

  const imageRules = [
    { name: '"avatarLarger":"<url>"', regex: /"avatarLarger"\s*:\s*"([^"]+)"/i },
    { name: '"avatarMedium":"<url>"', regex: /"avatarMedium"\s*:\s*"([^"]+)"/i },
    { name: 'og:image', regex: /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i }
  ];

  // Apply Numeric Rules
  for (const rule of numericRules) {
    const match = html.match(rule.regex);
    if (match && match[1]) {
      info.numericId = match[1];
      info.patternsMatched.push({ patternName: rule.name, value: match[1] });
      break;
    }
  }

  // Apply secUid Rules
  for (const rule of secUidRules) {
    const match = html.match(rule.regex);
    if (match && match[1]) {
      info.miniProfileId = match[1];
      info.patternsMatched.push({ patternName: rule.name, value: match[1] });
      break;
    }
  }

  // Apply Name Rules
  for (const rule of nameRules) {
    const match = html.match(rule.regex);
    if (match && match[1]) {
      let val = match[1].trim();
      // Clean up Unicode escapes if any
      try {
        val = JSON.parse(`"${val}"`);
      } catch (e) {}
      info.name = val;
      info.patternsMatched.push({ patternName: rule.name, value: val });
      break;
    }
  }

  // Apply Signature/Headline Rules
  for (const rule of headlineRules) {
    const match = html.match(rule.regex);
    if (match && match[1]) {
      let val = match[1].trim();
      try {
        val = JSON.parse(`"${val}"`);
      } catch (e) {}
      info.headline = val;
      info.patternsMatched.push({ patternName: rule.name, value: val });
      break;
    }
  }

  // Apply Avatar Image Rules
  for (const rule of imageRules) {
    const match = html.match(rule.regex);
    if (match && match[1]) {
      let val = match[1].trim();
      try {
        val = JSON.parse(`"${val}"`);
      } catch (e) {}
      info.imageUrl = val;
      info.patternsMatched.push({ patternName: rule.name, value: val });
      break;
    }
  }

  info.success = !!(info.numericId || info.miniProfileId || info.name);

  return info;
}
