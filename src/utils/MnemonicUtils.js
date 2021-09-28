let utils = {};
// import {Bip39} from 'bsv/lib/bip-39'
let aesUtils = require('../utils/aesUtils');

utils.createMnemonic = function () {

    return new bsv.Bip39().fromRandom().toString();
};

utils.saveMnemonic = function(mnemonic,password){

    //加盐
    password += 'SatoWallet';
    //计算hash，使用此hash作为秘钥
    password = bsv.Hash.sha256(Buffer.from( password)).toString('hex');

    //加密
    let locked = aesUtils.AESEncrypto(mnemonic,password);

    //加盐
    password += 'SatoWallet';
    //计算hash，使用此hash确认用户是否输入了正确的密码
    let passwordHash = bsv.Hash.sha256(Buffer.from( password)).toString('hex');


    let privateKey = bsv.Bip32.fromSeed(utils.getSeedFromMnemonic(mnemonic)).derive("m/44'/0'/0'/0/0").privKey;
    let address = bsv.Address.fromPrivKey(privateKey).toString();



    let lockInfoList = localStorage.getItem('lockInfoList') || '[]';
    lockInfoList = JSON.parse(lockInfoList);

    //检查是否已经存在
    for (let i = 0; i < lockInfoList.length; i++) {
        if(lockInfoList[i].address === address){
            return false;
        }
    }

    let saveInfo = {passwordHash,locked,address,alias:`Account ${lockInfoList.length+1}`};
    //本地保存
    localStorage.setItem('lockInfo',JSON.stringify(saveInfo));

    lockInfoList.push(saveInfo);
    localStorage.setItem('lockInfoList',JSON.stringify(lockInfoList));

    return true
};


utils.getSeedFromMnemonic = function(mnemonic){
    return new bsv.Bip39(mnemonic).toSeed();
};

module.exports = utils;
