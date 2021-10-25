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
// console.log(AESEncrypto('e4346c95c0acfc35862a3457d0bec89fb685c354896aa96fe361dd71c2dd7d821d2c7400fe3ff865bbc50614882b020f2692007cf8ccacaebbe61f537b953e57','c7631962a4bd15cf60a8af8331d6e484fa4c4733cebe622f5086d6e791e70bc8'))
// console.log(AESDecrypto(
    // 'U2FsdGVkX1+eZ7LdbrocTTXuPT708xgFBB5nIPOW8Z5EkoGktg+l3jQ4CuNBFYH4CPqEh2HHIp0VNTXtiYkay7SsngLJ75d4qFsQQO8i0fUg46nbEqNBuoBZPi48UqiUQky1OETyecacZhdecAkf92tOvsUpK9IvhcsBixVs6fckVI5lHanGIqpLYrTSOhTNWo7RXU+8lePKsayMeSRK/w==',
    // 'c7631962a4bd15cf60a8af8331d6e484fa4c4733cebe622f5086d6e791e70bc8'))
// Encrypt
// var ciphertext = CryptoJS.AES.encrypt('my message', 'secret key 123').toString();

// Decrypt
// var bytes = CryptoJS.AES.decrypt('U2FsdGVkX19iAFuZHRrkS+J359pZHKdceTv3BVDNiKA=', 'secret key 123');
// var originalText = bytes.toString(CryptoJS.enc.Utf8);
//
// // console.log(ciphertext); // 'my message'
// console.log(originalText); // 'my message'
