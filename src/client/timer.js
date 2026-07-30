export function startCountdown(durationSeconds, onTick, onComplete) {
  let remaining = Math.max(0, durationSeconds);
  
  if (typeof onTick === 'function') {
    onTick(remaining);
  }
  
  const interval = setInterval(() => {
    remaining--;
    
    if (typeof onTick === 'function') {
      onTick(remaining);
    }
    
    if (remaining <= 0) {
      clearInterval(interval);
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  }, 1000);

  return {
    stop: () => clearInterval(interval),
    getRemaining: () => remaining
  };
}