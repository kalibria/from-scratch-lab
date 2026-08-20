import { useEffect, useState } from 'react';

export function useCountdown(deadline: Date) {
  const [remainingMs, setRemainingMs] = useState(() => deadline.getTime() - Date.now());

  useEffect(() => {
    setRemainingMs(deadline.getTime() - Date.now());
    const id = setInterval(() => setRemainingMs(deadline.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return remainingMs;
}
