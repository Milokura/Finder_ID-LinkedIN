/**
 * Heuristic parser to extract LinkedIn profile identifiers from raw HTML source code.
 */

export interface ExtractedProfileInfo {
  numericId: string | null;
  miniProfileId: string | null;
  name: string | null;
  headline: string | null;
  imageUrl: string | null;
  patternsMatched: { patternName: string; value: string }[];
  success: boolean;
}

export function cleanLinkedInUrl(url: string): string {
  let clean = url.trim();
  // Ensure protocol is present
  if (!/^https?:\/\//i.test(clean)) {
    clean = 'https://' + clean;
  }
  try {
    const parsed = new URL(clean);
    // Allow linkedin.com or subdomains
    if (!/linkedin\.com$/i.test(parsed.hostname)) {
      throw new Error('La URL debe pertenecer al dominio linkedin.com');
    }
    return parsed.toString();
  } catch (error) {
    throw new Error('Formato de URL inválido. Ejemplo: https://www.linkedin.com/in/nombre-usuario');
  }
}

export function extractProfileInfo(html: string): ExtractedProfileInfo {
  const info: ExtractedProfileInfo = {
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

  // --- Regex Rules for Numeric Member ID ---
  const numericRules = [
    { name: 'urn:li:member:<id>', regex: /urn:li:member:(\d+)/i },
    { name: 'urn:li:person:<id>', regex: /urn:li:person:(\d+)/i },
    { name: '"memberId":<id>', regex: /"memberId"\s*:\s*"?(\d+)"?/i },
    { name: 'memberId=<id>', regex: /[?&]memberId=(\d+)/i },
    { name: '"ownerId":<id>', regex: /"ownerId"\s*:\s*"?(\d+)"?/i },
    { name: 'vieweeId=<id>', regex: /&vieweeId=(\d+)/i },
    { name: 'viewee_id:<id>', regex: /viewee_id:\s*(\d+)/i },
    { name: 'objectUrn: "urn:li:member:<id>"', regex: /objectUrn\s*:\s*"urn:li:member:(\d+)"/i },
    { name: 'report-profile-<id>', regex: /id="report-profile-(\d+)"/i },
    { name: 'id=<id> inside URL links', regex: /[?&]id=(\d+)(?:&|$)/i }
  ];

  // --- Regex Rules for MiniProfile/Alternate Text ID ---
  const miniProfileRules = [
    { name: 'urn:li:fs_miniProfile:<id>', regex: /urn:li:fs_miniProfile:([A-Za-z0-9_\-+]{15,})/i },
    { name: '"miniProfile": "urn:li:fs_miniProfile:<id>"', regex: /"miniProfile"\s*:\s*"urn:li:fs_miniProfile:([A-Za-z0-9_\-+]{15,})"/i },
    { name: '"id": "urn:li:fs_miniProfile:<id>"', regex: /"id"\s*:\s*"urn:li:fs_miniProfile:([A-Za-z0-9_\-+]{15,})"/i }
  ];

  // --- Regex Rules for Name & Meta Attributes ---
  const nameRules = [
    { name: 'og:title', regex: /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i },
    { name: 'title tag', regex: /<title>([^<]+?)(?:\s*\|\s*LinkedIn)?<\/title>/i },
    { name: 'twitter:title', regex: /<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i }
  ];

  const headlineRules = [
    { name: 'og:description', regex: /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i },
    { name: 'description tag', regex: /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i },
    { name: 'twitter:description', regex: /<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i }
  ];

  const imageRules = [
    { name: 'og:image', regex: /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i },
    { name: 'twitter:image', regex: /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i }
  ];

  // Apply Numeric Rules
  for (const rule of numericRules) {
    const match = html.match(rule.regex);
    if (match && match[1]) {
      info.numericId = match[1];
      info.patternsMatched.push({ patternName: rule.name, value: match[1] });
      // Keep scanning but break once we have a definitive numericId
      break;
    }
  }

  // Apply MiniProfile Rules
  for (const rule of miniProfileRules) {
    const match = html.match(rule.regex);
    if (match && match[1]) {
      info.miniProfileId = match[1];
      info.patternsMatched.push({ patternName: rule.name, value: `urn:li:fs_miniProfile:${match[1]}` });
      break;
    }
  }

  // Apply Name Rules
  for (const rule of nameRules) {
    const match = html.match(rule.regex);
    if (match && match[1]) {
      let extractedName = match[1].trim();
      // Clean up common suffixes like " | LinkedIn" or "on LinkedIn"
      extractedName = extractedName.replace(/\s*\|\s*LinkedIn\s*$/i, '');
      extractedName = extractedName.replace(/\s*on\s*LinkedIn\s*$/i, '');
      info.name = extractedName;
      info.patternsMatched.push({ patternName: rule.name, value: extractedName });
      break;
    }
  }

  // Apply Headline Rules
  for (const rule of headlineRules) {
    const match = html.match(rule.regex);
    if (match && match[1]) {
      const value = match[1].trim();
      info.headline = value;
      info.patternsMatched.push({ patternName: rule.name, value });
      break;
    }
  }

  // Apply Image Rules
  for (const rule of imageRules) {
    const match = html.match(rule.regex);
    if (match && match[1]) {
      const value = match[1].trim();
      info.imageUrl = value;
      info.patternsMatched.push({ patternName: rule.name, value });
      break;
    }
  }

  // Determine Overall Success
  info.success = !!(info.numericId || info.miniProfileId);

  return info;
}
