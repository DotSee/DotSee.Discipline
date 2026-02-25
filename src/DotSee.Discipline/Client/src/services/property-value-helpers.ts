/**
 * Extract the plain string value from a property value for deduplication/comparison.
 * RTE (Tiptap) stores values as { markup: string, blocks: {...} }.
 * TextBox and TextArea store values as plain strings.
 */
export function getCurrentStringValue(rawValue: unknown): string {
  if (rawValue == null) return '';
  if (typeof rawValue === 'string') return rawValue;
  if (typeof rawValue === 'object' && 'markup' in rawValue) {
    return (rawValue as { markup: string }).markup ?? '';
  }
  return String(rawValue);
}

/**
 * Build a new property value from a version string returned by the API.
 *
 * For RTE properties, the API returns the raw stored value which is a JSON string
 * like '{"markup":"<p>Hello</p>","blocks":{...}}'. We need to parse it and
 * return the object so the Tiptap editor can render it.
 *
 * For TextBox/TextArea, the API returns a plain string.
 *
 * We detect the format by checking the current live value: if it's an object
 * with a 'markup' property, we know this is an RTE field.
 */
export function buildNewValue(currentRawValue: unknown, versionValue: string): unknown {
  const isRte = currentRawValue != null && typeof currentRawValue === 'object' && 'markup' in currentRawValue;

  if (isRte) {
    // The API returns the stored value as a JSON string for RTE properties.
    // Try to parse it as an RTE value object.
    try {
      const parsed = JSON.parse(versionValue);
      if (parsed && typeof parsed === 'object' && 'markup' in parsed) {
        return parsed;
      }
    } catch {
      // Not valid JSON — treat it as raw HTML markup (older Umbraco format)
    }
    // Fallback: wrap plain HTML string into the RTE object structure
    return { ...(currentRawValue as Record<string, unknown>), markup: versionValue };
  }

  return versionValue;
}
