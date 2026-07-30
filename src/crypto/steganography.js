export function hideDataInPixels(imageData, binaryPayload) {
  if (!imageData || !binaryPayload) {
    throw new Error("Invalid arguments: imageData and binaryPayload are required");
  }

  const data = imageData.data;
  const payloadLength = binaryPayload.length;
  
  if (payloadLength * 8 > (data.length / 4) * 3) {
    throw new Error("Payload is too large for this image capacity");
  }

  let bitIndex = 0;
  const totalBits = payloadLength * 8;

  for (let i = 0; i < data.length && bitIndex < totalBits; i++) {
    if ((i + 1) % 4 === 0) continue;

    const byteIndex = Math.floor(bitIndex / 8);
    const bitPosition = 7 - (bitIndex % 8);
    const bit = (binaryPayload[byteIndex] >> bitPosition) & 1;

    data[i] = (data[i] & 0xfe) | bit;
    bitIndex++;
  }

  return imageData;
}

export function extractDataFromPixels(imageData, payloadLength) {
  if (!imageData || !payloadLength) {
    throw new Error("Invalid arguments: imageData and payloadLength are required");
  }

  const data = imageData.data;
  const totalBits = payloadLength * 8;
  const result = new Uint8Array(payloadLength);

  let bitIndex = 0;

  for (let i = 0; i < data.length && bitIndex < totalBits; i++) {
    if ((i + 1) % 4 === 0) continue;

    const bit = data[i] & 1;
    const byteIndex = Math.floor(bitIndex / 8);
    const bitPosition = 7 - (bitIndex % 8);

    result[byteIndex] |= (bit << bitPosition);
    bitIndex++;
  }

  return result;
}