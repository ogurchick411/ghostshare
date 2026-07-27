export function wipeBuffer(buffer) {
  if (!buffer) return;
  const view = new Uint8Array(buffer);
  for (let i = 0; i < view.length; i++) {
    view[i] = 0;
  }
}

export function wipeDOMElement(element) {
  if (!element) return;
  element.textContent = '';
  element.innerText = '';
}