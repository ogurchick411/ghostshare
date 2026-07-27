export async function generateMasterKey() {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportKeyToHash(key) {
  const exported = await crypto.subtle.exportKey("raw", key);
  const hashArray = Array.from(new Uint8Array(exported));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function importKeyFromHash(hashString) {
  const bytes = new Uint8Array(
    hashString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
  return await crypto.subtle.importKey(
    "raw",
    bytes.buffer,
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
}