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

function hideDataInPixels(imageData, messageText) {
  const encoder = new TextEncoder();
  const data = encoder.encode(messageText);
  const dataLength = data.length;

  const header = new Uint8Array(4);
  new DataView(header.buffer).setUint32(0, dataLength, false);

  const fullPayload = new Uint8Array(header.length + data.length);
  fullPayload.set(header, 0);
  fullPayload.set(data, header.length);

  const pixels = imageData.data;
  const maxBytes = Math.floor((pixels.length / 4) * 3 / 8);

  if (fullPayload.length > maxBytes) {
    throw new Error('Image too small for this message.');
  }

  let byteIdx = 0;
  let bitIdx = 0;

  for (let i = 0; i < pixels.length; i++) {
    if ((i + 1) % 4 === 0) continue;

    if (byteIdx < fullPayload.length) {
      const bit = (fullPayload[byteIdx] >> (7 - bitIdx)) & 1;
      pixels[i] = (pixels[i] & 0xFE) | bit;

      bitIdx++;
      if (bitIdx === 8) {
        bitIdx = 0;
        byteIdx++;
      }
    } else {
      break;
    }
  }

  return imageData;
}

function extractDataFromPixels(imageData) {
  const pixels = imageData.data;
  let headerBytes = new Uint8Array(4);
  let byteIdx = 0;
  let bitIdx = 0;
  let currentByte = 0;

  for (let i = 0; i < pixels.length && byteIdx < 4; i++) {
    if ((i + 1) % 4 === 0) continue;

    const bit = pixels[i] & 1;
    currentByte = (currentByte << 1) | bit;
    bitIdx++;

    if (bitIdx === 8) {
      headerBytes[byteIdx] = currentByte;
      currentByte = 0;
      bitIdx = 0;
      byteIdx++;
    }
  }

  const payloadLength = new DataView(headerBytes.buffer).getUint32(0, false);
  if (payloadLength <= 0 || payloadLength > pixels.length) {
    throw new Error('No hidden payload found in this image.');
  }

  const payload = new Uint8Array(payloadLength);
  byteIdx = 0;
  bitIdx = 0;
  currentByte = 0;

  let totalBitsRead = 0;
  const startBitOffset = 32;

  for (let i = 0; i < pixels.length && byteIdx < payloadLength; i++) {
    if ((i + 1) % 4 === 0) continue;

    if (totalBitsRead < startBitOffset) {
      totalBitsRead++;
      continue;
    }

    const bit = pixels[i] & 1;
    currentByte = (currentByte << 1) | bit;
    bitIdx++;

    if (bitIdx === 8) {
      payload[byteIdx] = currentByte;
      currentByte = 0;
      bitIdx = 0;
      byteIdx++;
    }
  }

  return new TextDecoder().decode(payload);
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

// Stego Hide Elements
const stegoInput = document.getElementById('stego-input');
const imageInput = document.getElementById('image-input');
const imageLabel = document.getElementById('image-label');
const clearImageBtn = document.getElementById('clear-image-btn');
const stegoBtn = document.getElementById('stego-btn');
const downloadImage = document.getElementById('download-image');

// Stego Extract Elements
const extractInput = document.getElementById('extract-input');
const extractLabel = document.getElementById('extract-label');
const clearExtractBtn = document.getElementById('clear-extract-btn');
const extractBtn = document.getElementById('extract-btn');
const extractedOutput = document.getElementById('extracted-output');

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

// File Pickers logic
if (imageInput) {
  imageInput.addEventListener('change', () => {
    if (imageInput.files[0]) {
      imageLabel.innerText = imageInput.files[0].name;
      clearImageBtn.classList.remove('hidden');
    }
  });
}

if (clearImageBtn) {
  clearImageBtn.addEventListener('click', (e) => {
    e.preventDefault();
    imageInput.value = '';
    imageLabel.innerText = 'Choose PNG Image';
    clearImageBtn.classList.add('hidden');
  });
}

if (extractInput) {
  extractInput.addEventListener('change', () => {
    if (extractInput.files[0]) {
      extractLabel.innerText = extractInput.files[0].name;
      clearExtractBtn.classList.remove('hidden');
    }
  });
}

if (clearExtractBtn) {
  clearExtractBtn.addEventListener('click', (e) => {
    e.preventDefault();
    extractInput.value = '';
    extractLabel.innerText = 'Choose Stego PNG Image';
    clearExtractBtn.classList.add('hidden');
    extractedResult.classList.add('hidden');
    extractedOutput.value = '';
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

if (stegoBtn) {
  stegoBtn.addEventListener('click', async () => {
    const text = stegoInput.value.trim();
    const file = imageInput.files[0];

    if (!text) return alert('Enter secret text first.');
    if (!file) return alert('Select a PNG image.');

    stegoBtn.disabled = true;
    stegoBtn.innerText = 'Processing...';

    try {
      const key = await generateKey();
      const encrypted = await encryptMessage(text, key);
      const rawKey = await exportKey(key);
      const payloadString = JSON.stringify({ payload: encrypted, key: rawKey });

      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const processedData = hideDataInPixels(imageData, payloadString);
          ctx.putImageData(processedData, 0, 0);

          downloadImage.href = canvas.toDataURL('image/png');
          stegoResult.classList.remove('hidden');
          stegoBtn.disabled = false;
          stegoBtn.innerText = 'Process & Download Image';

          stegoInput.value = '';
          imageInput.value = '';
          imageLabel.innerText = 'Choose PNG Image';
          clearImageBtn.classList.add('hidden');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Error: ' + err.message);
      stegoBtn.disabled = false;
      stegoBtn.innerText = 'Process & Download Image';
    }
  });
}

if (extractBtn) {
  extractBtn.addEventListener('click', () => {
    const file = extractInput.files[0];
    if (!file) return alert('Select a PNG image to extract secret.');

    extractBtn.disabled = true;
    extractBtn.innerText = 'Extracting...';

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const rawString = extractDataFromPixels(imageData);
          const parsed = JSON.parse(rawString);

          const key = await importKey(parsed.key);
          const decrypted = await decryptMessage(parsed.payload, key);

          extractedOutput.value = decrypted;
          extractedResult.classList.remove('hidden');
        } catch (err) {
          alert('Failed to extract: ' + err.message);
        } finally {
          extractBtn.disabled = false;
          extractBtn.innerText = 'Extract Secret Message';
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
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