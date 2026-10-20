/** Estimates narration time using a conversational pace of 150 words per minute. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/u).length : 0;
}

export function estimateVoiceOverSeconds(text: string): number {
  return Math.round((countWords(text) * 60) / 150);
}

export function formatEstimatedDuration(seconds: number): string {
  if (seconds < 60) return `~${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds ? `~${minutes} min ${remainingSeconds} s` : `~${minutes} min`;
}
