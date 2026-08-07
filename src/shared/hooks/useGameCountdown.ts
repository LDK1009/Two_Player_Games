import { useEffect, useState } from 'react';

import { advanceCountdown } from '@/shared/utils/game/countdown';

const COUNTDOWN_START = 3;

export function useGameCountdown(isActive: boolean, onComplete: () => void) {
  const [countdown, setCountdown] = useState(COUNTDOWN_START);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const resetTimer = setTimeout(() => setCountdown(COUNTDOWN_START), 0);
    const interval = setInterval(() => {
      setCountdown((currentValue) => {
        const nextValue = advanceCountdown(currentValue);

        if (nextValue === 0) {
          clearInterval(interval);
          onComplete();
        }

        return nextValue;
      });
    }, 700);

    return () => {
      clearTimeout(resetTimer);
      clearInterval(interval);
    };
  }, [isActive, onComplete]);

  return countdown;
}
