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
  if (!key) throw new Error("Key is required for export");
  const exported = await crypto.subtle.exportKey("raw", key);
  const hashArray = Array.from(new Uint8Array(exported));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function importKeyFromHash(hashString) {
  if (!hashString || typeof hashString !== "string") {
    throw new Error("Invalid key hash string provided");
  }

  const matches = hashString.match(/.{1,2}/g);
  if (!matches || matches.length !== 32) {
    throw new Error("Invalid key length: expected 256-bit key in hex format");
  }

  const bytes = new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
  
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