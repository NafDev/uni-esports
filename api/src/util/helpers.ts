export function extractString(search: RegExp, text: string): string | undefined {
  const findMatch = text.match(search);
  return findMatch ? findMatch[0] : null;
}
