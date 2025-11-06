#!/usr/bin/env node

/**
 * JWT Secret Generator
 * Generates secure random strings for JWT_SECRET and JWT_REFRESH_SECRET
 */

const crypto = require('crypto');

console.log('\n🔐 JWT Secrets Generator\n');
console.log('Copy these values to your Railway environment variables:\n');

console.log('JWT_SECRET=');
console.log(crypto.randomBytes(32).toString('hex'));

console.log('\nJWT_REFRESH_SECRET=');
console.log(crypto.randomBytes(32).toString('hex'));

console.log('\n✅ Generated secure 256-bit secrets');
console.log('💡 Never commit these to Git!\n');
