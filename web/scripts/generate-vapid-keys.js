#!/usr/bin/env node

/**
 * Generate VAPID key pair for Web Push Notifications.
 *
 * Usage:
 *   node scripts/generate-vapid-keys.js
 *
 * Output:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY values
 *   ready to paste into your .env file.
 */

const crypto = require("node:crypto");

function generateVapidKeys() {
  // VAPID uses the P-256 curve (prime256v1)
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.generateKeys();

  // Public key: uncompressed 65-byte point, base64url-encoded
  const publicKey = ecdh
    .getPublicKey()
    .toString("base64url");

  // Private key: 32-byte scalar, base64url-encoded
  const privateKey = ecdh
    .getPrivateKey()
    .toString("base64url");

  return { publicKey, privateKey };
}

const keys = generateVapidKeys();

console.log("\n  VAPID Key Pair Generated\n");
console.log("  Add these to your .env file:\n");
console.log(`  NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`  VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log();
