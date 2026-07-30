export function triggerSelfDestructAnimation(containerElement, onComplete) {
  if (!containerElement) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const rect = containerElement.getBoundingClientRect();

  canvas.width = rect.width;
  canvas.height = rect.height;
  canvas.style.position = 'fixed';
  canvas.style.left = `${rect.left}px`;
  canvas.style.top = `${rect.top}px`;
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';

  document.body.appendChild(canvas);
  containerElement.style.visibility = 'hidden';

  let opacity = 1.0;
  let animationFrameId = null;

  function render() {
    opacity -= 0.03;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (opacity > 0) {
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#f85149';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      animationFrameId = requestAnimationFrame(render);
    } else {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      canvas.remove();
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  }

  animationFrameId = requestAnimationFrame(render);
}