export function formatSpeakingTimer(remainingMs: number): { text: string; isOvertime: boolean } {
  const isOvertime = remainingMs <= 0;
  const totalSeconds = Math.round(Math.abs(remainingMs) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  return { text: isOvertime ? `+${formatted}` : formatted, isOvertime };
}
