export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
