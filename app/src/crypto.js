// much of this is from http://stackoverflow.com/questions/34814480/how-to-load-a-public-key-in-pem-format-for-encryption

export function test_crypto() {
    var private_key_object = null;
    var public_key_object = null;

    var promise_key = null;

    var crypto = window.crypto || window.msCrypto;

    if(crypto.subtle)
    {
        alert("Cryptography API Supported");

        // Parameters:
        // 1. Asymmetric Encryption algorithm name and its requirements
        // 2. Boolean indicating extractable. which indicates whether or not the raw keying material may be exported
        // by the application (http://www.w3.org/TR/WebCryptoAPI/#dfn-CryptoKey-slot-extractable)
        // 3. Usage of the keys. (http://www.w3.org/TR/WebCryptoAPI/#cryptokey-interface-types)
        promise_key = crypto.subtle.generateKey({name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([0x01, 0x00, 0x01]), hash: {name: "SHA-256"}}, false, ["encrypt", "decrypt"]);

        promise_key.then(function(key){
            private_key_object = key.privateKey;
            public_key_object = key.publicKey;
        });

        promise_key.catch = function(e){
            console.log(e.message);
        }

    }
    else
    {
        alert("Cryptography API not Supported");
    }
}

export function test_import_key() {
    // TODO: change key for prod
    var pubKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu7ZT5F/JRZORtLRGqSEM
IiYfdOdTCEoiTYWnUe9BhCKa5ajgVq5Yc3QtkiJHgcAFciK7K0FE/ph7/j7rirzy
DtLJa8eqzEZd37TO9/vV078tyAuFzOO8l3Yn32w0DsnegQQf/epOD0lXzjl+MBtO
imZAwqExef0TOGacWok7A28abwm3aSWnn6bF5djtJskSk7BlV8YYe4KtfeM1fxm3
PeWiEPAVYnXcG89IrTDLV9f9naFa5z+5a4ahzOxqJ1DfhnUlgd/y0oezw/qvjbwM
ZLOj785YJ+zkH1TTu73EI7hsRvuPMJdufIIaFbvESSX5XRANjpkDI8Yb/NDEtkWB
QwIDAQAB
-----END PUBLIC KEY-----`

    if (crypto.subtle) {

      var start = new Date().getTime();
      var cleartext = '1'

      importPublicKey(pubKey).then(function(key) {
        crypto.subtle.encrypt(encryptAlgorithm, key, textToArrayBuffer(cleartext)).then(function(cipheredData) {
            var cipheredValue = arrayBufferToBase64String(cipheredData);
            console.log('data:')
            console.log(cipheredData)
            console.log('value:')
            console.log(cipheredValue);

        });
      });
    }
}


var crypto = window.crypto || window.msCrypto;
var encryptAlgorithm = {
  name: "RSA-OAEP",
  hash: {
    name: "SHA-1"
  }
};

function arrayBufferToBase64String(arrayBuffer) {
  var byteArray = new Uint8Array(arrayBuffer)
  var byteString = '';
  for (var i=0; i<byteArray.byteLength; i++) {
    byteString += String.fromCharCode(byteArray[i]);
  }
  return btoa(byteString);
}

function base64StringToArrayBuffer(b64str) {
  var byteStr = atob(b64str);
  var bytes = new Uint8Array(byteStr.length);
  for (var i = 0; i < byteStr.length; i++) {
    bytes[i] = byteStr.charCodeAt(i);
  }
  return bytes.buffer;
}

function textToArrayBuffer(str) {
  var buf = unescape(encodeURIComponent(str)); // 2 bytes for each char
  var bufView = new Uint8Array(buf.length);
  for (var i=0; i < buf.length; i++) {
    bufView[i] = buf.charCodeAt(i);
  }
  return bufView;
}

function convertPemToBinary(pem) {
  var lines = pem.split('\n');
  var encoded = '';
  for(var i = 0;i < lines.length;i++){
    if (lines[i].trim().length > 0 &&
        lines[i].indexOf('-BEGIN RSA PRIVATE KEY-') < 0 &&
        lines[i].indexOf('-BEGIN RSA PUBLIC KEY-') < 0 &&
        lines[i].indexOf('-BEGIN PUBLIC KEY-') < 0 &&
        lines[i].indexOf('-END PUBLIC KEY-') < 0 &&
        lines[i].indexOf('-END RSA PRIVATE KEY-') < 0 &&
        lines[i].indexOf('-END RSA PUBLIC KEY-') < 0) {
      encoded += lines[i].trim();
    }
  }
  return base64StringToArrayBuffer(encoded);
}

function importPublicKey(pemKey) {
  return new Promise(function(resolve) {
    var importer = crypto.subtle.importKey("spki", convertPemToBinary(pemKey), encryptAlgorithm, false, ["encrypt"]);
    importer.then(function(key) {
      resolve(key);
    });
  });
}
