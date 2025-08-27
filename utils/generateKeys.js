const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate RSA key pair
const generateKeys = () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Ensure directories exist
  const keysDir = path.join(__dirname, '..');
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }

  // Write keys to files
  fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);
  fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);

  console.log('RSA keys generated successfully!');
  console.log('Private key: private.pem');
  console.log('Public key: public.pem');
};

generateKeys();