const fs = require('fs');
const crypto = require('crypto');

// Generate RSA Key Pair (2048 bits)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // can use 4096 for stronger security
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
    },
});

// Save to files
fs.writeFileSync('private.pem', privateKey);
fs.writeFileSync('public.pem', publicKey);

console.log('✅ RSA key pair generated and saved as private.pem and public.pem');