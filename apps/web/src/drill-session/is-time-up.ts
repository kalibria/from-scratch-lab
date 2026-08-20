export function isTimeUp(deadline: Date, now: Date): boolean {
  return now.getTime() >= deadline.getTime();
}
