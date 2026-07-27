export function validateSecretInput(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Input cannot be empty' };
  }
  
  if (text.length > 10000) {
    return { valid: false, error: 'Text exceeds maximum length of 10000 characters' };
  }

  return { valid: true };
}