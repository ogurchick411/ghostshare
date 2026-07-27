export async function encryptMessage(message, key) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    data
  );

  return {
    ciphertext: Array.from(new Uint8Array(encryptedBuffer)),
    iv: Array.from(iv)
  };
}

export async function decryptMessage(encryptedData, key) {
  const { ciphertext, iv } = encryptedData;
  const dataBuffer = new Uint8Array(ciphertext).buffer;
  const ivBuffer = new Uint8Array(iv);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer
    },
    key,
    dataBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}