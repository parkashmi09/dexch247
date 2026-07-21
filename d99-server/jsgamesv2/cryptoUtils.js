import crypto from 'crypto';

function CryptoUtils() {}

CryptoUtils.generateSignature = function(params, secret) {
  var sortedParams = Object.keys(params)
    .sort()
    .map(function(key) { return key + '=' + params[key]; })
    .join('&');
  return crypto.createHmac('sha256', secret).update(sortedParams).digest('hex');
};

CryptoUtils.encryptPayload = function(payload, key) {
  var iv = crypto.randomBytes(16);
  var cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  var encrypted = cipher.update(JSON.stringify(payload));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

CryptoUtils.decryptPayload = function(payload, key) {
  var parts = payload.split(':');
  var iv = parts[0];
  var encrypted = parts[1];
  var decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv, 'hex'));
  var decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
};

CryptoUtils.generateToken = function(length) {
  length = length || 32;
  return crypto.randomBytes(length).toString('hex');
};

export default CryptoUtils;