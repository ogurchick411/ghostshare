export function triggerSelfDestructAnimation(containerElement, onComplete) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const rect = containerElement.getBoundingClientRect();

  canvas.width = rect.width;
  canvas.height = rect.height;
  canvas.style.position = 'absolute';
  canvas.style.left = `${rect.left}px`;
  canvas.style.top = `${rect.top}px`;
  canvas.style.pointerEvents = 'none';

  document.body.appendChild(canvas);
  containerElement.style.visibility = 'hidden';

  ctx.fillStyle = '#ff4d4d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let opacity = 1.0;
  const interval = setInterval(() => {
    opacity -= 0.05;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#ff4d4d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (opacity <= 0) {
      clearInterval(interval);
      canvas.remove();
      if (onComplete) onComplete();
    }
  }, 30);
}