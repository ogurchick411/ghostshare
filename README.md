# GhostShare

Client-side encrypted ephemeral secret storage and sharing platform.

## Overview

GhostShare is a zero-knowledge application designed for secure, temporary message and secret exchange. Encryption and decryption processes are performed entirely on the client side using the Web Crypto API, ensuring that plain text data never reaches the server.

## Key Features

- End-to-End Encryption: Utilizes AES-GCM 256-bit algorithm via native browser APIs.
- Client-Side Key Generation: Cryptographic keys are generated locally and embedded in URL fragments (hashes), which are never transmitted in HTTP requests.
- Ephemeral Data Storage: Messages are stored in-memory on the server with configurable Time-To-Live (TTL) parameters.
- Single-Read Destruction: Fetched payloads are automatically purged from server memory upon retrieval.
- Data Sanitization: Automatic DOM and memory buffer zeroing after display expiration.
- Steganography Support: Integrated modules for least-significant-bit (LSB) image payload embedding.

## Project Structure

public/
├── index.html       # Application markup
└── style.css        # Core styling rules
src/
├── client/
│   ├── animator.js  # Visual canvas rendering helpers
│   ├── app.js       # Main application interface logic
│   └── timer.js     # Expiration timer manager
├── crypto/
│   ├── cipher.js    # AES-GCM encryption/decryption routines
│   ├── cleanup.js   # Memory and DOM wiping functions
│   ├── keys.js      # Key generation, import, and export utilities
│   └── steganography.js # LSB image data encoding/decoding
├── server/
│   └── index.js     # Native Node.js HTTP API server
└── utils/
    ├── encoding.js  # Binary and Base64 transformation helpers
    └── validation.js# Input sanitization and bounds checking
package.json

## API Endpoints

### POST /api/store
Stores an encrypted payload in server memory.
- Body Parameters:
  - id (string): Unique identifier for the payload.
  - payload (object): Encrypted data object containing ciphertext and initialization vector (IV).
  - ttl (number): Lifetime in seconds before automatic purging.

### GET /api/fetch/:id
Retrieves and immediately deletes the requested payload from server memory.
- Returns: JSON object containing the encrypted payload.
- Status Codes:
  - 200 OK: Payload found and returned.
  - 404 Not Found: Payload expired or already destroyed.

## Usage

1. Start the HTTP server:
   npm start

2. Open http://localhost:3000 in a Web Crypto supported browser.

## Security Model

The server acts solely as a temporary key-value storage engine. Because decryption keys are appended as URL hash fragments (#id=...&key=...), they remain strictly within the client context and are not accessible to network intermediaries or server logs.

## License

MIT License