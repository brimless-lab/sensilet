let utils = {};
// import {Bip39} from 'bsv/lib/bip-39'
let aesUtils = require('../utils/aesUtils');

utils.createMnemonic = function () {

    return new bsv.Bip39().fromRandom().toString();
};


utils.saveMnemonic = function (mnemonic, password, isSinglePrivateKey = false, passphrase = '', path = "m/44'/0'/0'") {

    //加盐
    password += 'SatoWallet';
    //计算hash，使用此hash作为秘钥
    password = bsv.Hash.sha256(Buffer.from(password)).toString('hex');

    //对于有passphrase的情况，加密储存的是助记词和passphrase

    //加密
    let locked = aesUtils.AESEncrypto(mnemonic, password);

    //加盐
    let password2 = password + 'SatoWallet';
    //计算hash，使用此hash确认用户是否输入了正确的密码
    let passwordHash = bsv.Hash.sha256(Buffer.from(password2)).toString('hex');

    let seed = isSinglePrivateKey ? "" : utils.getSeedFromMnemonic(mnemonic, passphrase);


    let privateKey = isSinglePrivateKey
        ? bsv.PrivKey.fromWif(mnemonic)
        : bsv.Bip32.fromSeed(seed).derive(`${path}/0/0`).privKey;
    let address = bsv.Address.fromPrivKey(privateKey).toString();


    let lockInfoList = localStorage.getItem('lockInfoList') || '[]';
    lockInfoList = JSON.parse(lockInfoList);

    //检查是否已经存在
    for (let i = 0; i < lockInfoList.length; i++) {
        if (lockInfoList[i]['address'+config.hostFix] === address) {
            return false;
        }
    }

    let saveInfo = {
        passwordHash,
        locked,
        alias: `Account ${lockInfoList.length + 1}`,
        isSinglePrivateKey, path,
    };
    saveInfo['address'+config.hostFix] = address;
    if (passphrase !== "") {
        saveInfo.seedLocked = aesUtils.AESEncrypto(seed.toString('hex'), password);
        saveInfo.hasPassphrase = true;
    }
    //本地保存
    localStorage.setItem('lockInfo', JSON.stringify(saveInfo));

    lockInfoList.push(saveInfo);
    localStorage.setItem('lockInfoList', JSON.stringify(lockInfoList));

    return true
};


utils.getSeedFromMnemonic = function (mnemonic, passphrase = '') {
    return new bsv.Bip39(mnemonic).toSeed(passphrase);
};

utils.getAddressFromMnemonic = function (mnemonic, passphrase = '',path="m/44'/0'/0'") {
    console.log(passphrase,path)
    return  bsv.Bip32.fromSeed(new bsv.Bip39(mnemonic).toSeed(passphrase)).derive(`${path}/0/0`).privKey;
};

module.exports = utils;
