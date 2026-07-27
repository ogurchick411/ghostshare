export function startCountdown(durationSeconds, onTick, onComplete) {
  let remaining = durationSeconds;
  
  onTick(remaining);
  
  const interval = setInterval(() => {
    remaining--;
    onTick(remaining);
    
    if (remaining <= 0) {
      clearInterval(interval);
      if (onComplete) onComplete();
    }
  }, 1000);

  return interval;
}