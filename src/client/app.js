import { generateMasterKey, exportKeyToHash, importKeyFromHash } from '../crypto/keys.js';
import { encryptMessage, decryptMessage } from '../crypto/cipher.js';

const secretInput = document.getElementById('secretInput');
const shareBtn = document.getElementById('shareBtn');
const resultSection = document.getElementById('resultSection');
const shareUrlInput = document.getElementById('shareUrl');

const secretDisplay = document.getElementById('secretDisplay');
const createSection = document.getElementById('createSection');
const viewSection = document.getElementById('viewSection');

async function handleCreateShare() {
  const text = secretInput.value.trim();
  if (!text) return;

  const key = await generateMasterKey();
  const encrypted = await encryptMessage(text, key);
  const keyHash = await exportKeyToHash(key);
  const id = Math.random().toString(36).substring(2, 10);

  const response = await fetch('/api/store', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, payload: encrypted, ttl: 3600 })
  });

  if (response.ok) {
    const shareUrl = `${window.location.origin}/#id=${id}&key=${keyHash}`;
    shareUrlInput.value = shareUrl;
    resultSection.classList.remove('hidden');
  }
}

async function handleViewShare() {
  const hash = window.location.hash.substring(1);
  if (!hash) return;

  const params = new URLSearchParams(hash);
  const id = params.get('id');
  const keyHash = params.get('key');

  if (!id || !keyHash) return;

  createSection.classList.add('hidden');
  viewSection.classList.remove('hidden');

  const response = await fetch(`/api/fetch/${id}`);
  if (!response.ok) {
    secretDisplay.textContent = 'Payload not found or already destroyed.';
    return;
  }

  const { payload } = await response.json();
  const key = await importKeyFromHash(keyHash);
  const decrypted = await decryptMessage(payload, key);

  secretDisplay.textContent = decrypted;
}

if (shareBtn) {
  shareBtn.addEventListener('click', handleCreateShare);
}

window.addEventListener('DOMContentLoaded', handleViewShare);