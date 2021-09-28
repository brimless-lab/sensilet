const CryptoJS = require("crypto-js");

function AESEncrypto(str, key) {
    return CryptoJS.AES.encrypt(str, key).toString()
}

function AESDecrypto(str, key) {
    return CryptoJS.AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
}


module.exports = {
    AESEncrypto, AESDecrypto
};

// console.log( AESEncrypto('aaa','1234567890123456'),'en');
// console.log( AESDecrypto('U2FsdGVkX1+7WEV2xkft7J7uqHILK1o2eT4dUVAqicU=','1234567890123456'),'de');


// Encrypt
// var ciphertext = CryptoJS.AES.encrypt('my message', 'secret key 123').toString();

// Decrypt
// var bytes = CryptoJS.AES.decrypt('U2FsdGVkX19iAFuZHRrkS+J359pZHKdceTv3BVDNiKA=', 'secret key 123');
// var originalText = bytes.toString(CryptoJS.enc.Utf8);
//
// // console.log(ciphertext); // 'my message'
// console.log(originalText); // 'my message'
