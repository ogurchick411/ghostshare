# GhostShare

> Zero-Knowledge, Client-Side Encrypted Ephemeral Storage & Steganography Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-blue.svg)](https://nodejs.org/)
[![Crypto](https://img.shields.io/badge/Security-AES--GCM%20256--bit-orange.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20(Native)-success.svg)]()

GhostShare is a privacy-focused web application designed for sharing sensitive data, notes, and secrets without leaving a trace. Built with native Web Crypto APIs and zero external dependencies.

---

## Key Highlights

* **End-to-End Client Encryption:** Plaintext never leaves the browser. Encrypted via AES-GCM 256-bit.
* **Zero-Knowledge Architecture:** Decryption keys are embedded strictly in the URL hash (`#key=...`). The server never sees or logs your keys.
* **One-Time Self-Destruct:** Payloads are instantly deleted from server memory upon the first read request.
* **Pixel Steganography:** Built-in LSB (Least Significant Bit) engine to conceal encrypted payloads inside image pixels.
* **Zero-Dependency Native Server:** Extremely lightweight Node.js HTTP core running without third-party packages.

---

## Quick Start

### Prerequisites
Make sure you have Node.js 18+ installed on your system

### Running Locally

1. Clone the repository:
   git clone https://github.com/ogurchick411/ghostshare.git
   cd ghostshare

2. Start the server:
   npm start

3. Open http://localhost:3000 in your browser

---

## Tech Stack & Architecture

* **Frontend:** Vanilla JS (ES Modules), HTML5 Canvas, Modern CSS Grid/Variables.
* **Cryptography:** Native `window.crypto.subtle` (AES-GCM, Raw Key Import/Export, LSB Steganography).
* **Backend:** Native Node.js `http` module with in-memory TTL map state.

---

## Security Model

[ Browser / Client ]                         [ Server Node.js ]
1. Generates AES-256 Key                      
2. Encrypts Payload locally                   
3. Sends Ciphertext only -------------------> Stores in Memory (Map)
4. Key appended to URL Hash (#key)            
                                              Reads & Immediately 
5. Receiver decrypts via Hash Key <---------- Deletes from Memory

---

## License

Distributed under the MIT License. See LICENSE for more information.

---

If you find this project useful or interesting, please consider leaving a Star on GitHub!
