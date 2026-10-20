export interface ScriptTextSegment {
  text: string;
  bold: boolean;
  italic: boolean;
}

/** Supports (bold text) and **bold italic text** in script copy. */
export function parseScriptText(value: string): ScriptTextSegment[] {
  const pattern = /(\*\*[^*]+\*\*|\([^()\n]+\))/g;
  const segments: ScriptTextSegment[] = [];
  let cursor = 0;

  for (const match of value.matchAll(pattern)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > cursor) {
      segments.push({ text: value.slice(cursor, index), bold: false, italic: false });
    }

    if (token.startsWith("**")) {
      segments.push({ text: token.slice(2, -2), bold: true, italic: true });
    } else {
      segments.push({ text: token, bold: true, italic: false });
    }
    cursor = index + token.length;
  }

  if (cursor < value.length) {
    segments.push({ text: value.slice(cursor), bold: false, italic: false });
  }

  return segments;
}
