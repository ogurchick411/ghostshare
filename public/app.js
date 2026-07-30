async function generateKey() {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

async function exportKey(key) {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

async function importKey(base64Key) {
  const binary = atob(base64Key);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'raw',
    bytes.buffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
}

async function encryptMessage(text, key) {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(text)
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...new Uint8Array(iv)))
  };
}

async function decryptMessage(payload, key) {
  const ciphertext = Uint8Array.from(atob(payload.ciphertext), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(payload.iv), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

// Elements for Tabs
const tabLink = document.getElementById('tab-link');
const tabHide = document.getElementById('tab-hide');
const tabExtract = document.getElementById('tab-extract');

const textMode = document.getElementById('text-mode');
const hideMode = document.getElementById('hide-mode');
const extractMode = document.getElementById('extract-mode');

// Secret Link Elements
const secretInput = document.getElementById('secret-input');
const ttlSelect = document.getElementById('ttl-select');
const createBtn = document.getElementById('create-btn');
const resultContainer = document.getElementById('result-container');
const stegoResult = document.getElementById('stego-result');
const extractedResult = document.getElementById('extracted-result');
const shareUrlInput = document.getElementById('share-url');
const copyBtn = document.getElementById('copy-btn');
const createView = document.getElementById('create-view');
const readView = document.getElementById('read-view');
const decryptedOutput = document.getElementById('decrypted-output');

// Tab Navigation Handler
function hideAllModes() {
  textMode.classList.add('hidden');
  hideMode.classList.add('hidden');
  extractMode.classList.add('hidden');
  resultContainer.classList.add('hidden');
  stegoResult.classList.add('hidden');
  extractedResult.classList.add('hidden');
  tabLink.classList.remove('active');
  tabHide.classList.remove('active');
  tabExtract.classList.remove('active');
}

if (tabLink && tabHide && tabExtract) {
  tabLink.addEventListener('click', () => {
    hideAllModes();
    tabLink.classList.add('active');
    textMode.classList.remove('hidden');
  });

  tabHide.addEventListener('click', () => {
    hideAllModes();
    tabHide.classList.add('active');
    hideMode.classList.remove('hidden');
  });

  tabExtract.addEventListener('click', () => {
    hideAllModes();
    tabExtract.classList.add('active');
    extractMode.classList.remove('hidden');
  });
}

if (createBtn) {
  createBtn.addEventListener('click', async () => {
    const text = secretInput.value.trim();
    if (!text) return alert('Enter a note before creating a link.');

    createBtn.disabled = true;
    createBtn.innerText = 'Encrypting...';

    try {
      const key = await generateKey();
      const rawKey = await exportKey(key);
      const encrypted = await encryptMessage(text, key);
      const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const ttl = parseInt(ttlSelect.value, 10);

      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, payload: encrypted, ttl })
      });

      if (!res.ok) throw new Error('Server response was not OK');

      const fullUrl = `${window.location.origin}/#id=${id}&key=${encodeURIComponent(rawKey)}`;
      shareUrlInput.value = fullUrl;
      resultContainer.classList.remove('hidden');
      secretInput.value = '';
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      createBtn.disabled = false;
      createBtn.innerText = 'Create Link';
    }
  });
}

if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    shareUrlInput.select();
    navigator.clipboard.writeText(shareUrlInput.value);
    copyBtn.innerText = 'Copied!';
    setTimeout(() => { copyBtn.innerText = 'Copy Link'; }, 2000);
  });
}

async function handleRoute() {
  const hash = window.location.hash.substring(1);
  if (!hash) return;

  const params = new URLSearchParams(hash);
  const id = params.get('id');
  const rawKey = params.get('key');

  if (!id || !rawKey) return;

  createView.classList.add('hidden');
  readView.classList.remove('hidden');

  try {
    const res = await fetch(`/api/fetch/${id}`);
    if (!res.ok) throw new Error('This note has been destroyed or expired.');

    const data = await res.json();
    const key = await importKey(decodeURIComponent(rawKey));
    const decrypted = await decryptMessage(data.payload, key);

    decryptedOutput.value = decrypted;
  } catch (err) {
    decryptedOutput.value = err.message;
  }
}

window.addEventListener('DOMContentLoaded', handleRoute);