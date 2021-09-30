let walletManager = {};


let bg = chrome.extension.getBackgroundPage();
if (!bg)
    window.location.reload();

const {API_NET, API_TARGET, Wallet, SensibleApi} = require('sensible-sdk');

const localManager = require('./LocalManager');
let aesUtils = require('../utils/aesUtils');
let mnemonicUtils = require('../utils/MnemonicUtils');
const passwordAesKey = 'SatoWallet#2021#d7t2';
let mPassword = "";
let mRootKey = "";
let mMainAddress = "";
const sensibleApi = new SensibleApi(API_NET.MAIN, API_TARGET.SENSIBLE);

function getRootKey() {
    if (mRootKey)
        return mRootKey;
    mRootKey = bsv.Bip32.fromSeed(mnemonicUtils.getSeedFromMnemonic(walletManager.getMnemonic()));
    return mRootKey;
}


walletManager.init = function () {
    walletManager.getCurrentAccount = localManager.getCurrentAccount;
    walletManager.listAccount = localManager.listAccount;

    walletManager.addAccount = localManager.addAccount;
    walletManager.chooseAccount = localManager.chooseAccount;
    walletManager.saveAlias = localManager.saveAlias;
    walletManager.refreshLockInfoList = localManager.refreshLockInfoList;

    return walletManager;
};

walletManager.reload = function () {
    mMainAddress = "";
    mRootKey = "";
    mMainAddress = "";
}

walletManager.isMnemonicCreate = function () {
    let lockInfo = localManager.getCurrentAccount();
    return lockInfo !== '' && lockInfo !== null;
};

//是否需要解锁钱包
walletManager.isNeedUnlock = function () {
    let lockInfo = JSON.parse(localStorage.getItem('lockInfo'));
    if (!lockInfo) {
        throw new Error('请先创建钱包')
    }

    //默认密码
    if (lockInfo.passwordHash === 'b9eb1134beb66506cbdfa320686147d297ba2f3597d772ee92e7dc83e025ac44') {

        mPassword = bsv.Hash.sha256(Buffer.from('SatoWallet#2021' + 'SatoWallet')).toString('hex');

        return false
    }
//    从bg的对象中查询
    return !bg.passwordAes && !mPassword;
};

walletManager.unlock = function (password, keep) {

    let lockInfo = localManager.getCurrentAccount();
    if (!lockInfo) {
        throw new Error('请先创建钱包')
    }
    password += 'SatoWallet';
    password = bsv.Hash.sha256(Buffer.from(password)).toString('hex');
    let passwordHash = bsv.Hash.sha256(Buffer.from(password + 'SatoWallet')).toString('hex');

    bg.passwordAes = "";

    if (passwordHash === lockInfo.passwordHash) {
        //加密保存密码到内存中
        mPassword = password;
        if (keep)
            bg.passwordAes = aesUtils.AESEncrypto(password, passwordAesKey);

        return true;
    }

    return false;
};
walletManager.getMnemonic = function () {
    let lockInfo = localManager.getCurrentAccount();
    if (!lockInfo) {
        throw new Error('请先创建钱包')
    }

    if (!mPassword) {
        if (!bg.passwordAes)
            throw new Error('请先解锁钱包');

        mPassword = aesUtils.AESDecrypto(bg.passwordAes, passwordAesKey)
    }
    return aesUtils.AESDecrypto(lockInfo.locked, mPassword)

};

walletManager.signMessage = function (msg) {
    if (typeof msg === 'string')
        msg = Buffer.from(msg);

    let rootKey = getRootKey();
    let privateKey = rootKey.derive("m/44'/0'/0'/0/0").privKey;
    let address = bsv.Address.fromPrivKey(privateKey).toString();
    if (msg) {
        let sig = bsv.Bsm.sign(msg, bsv.KeyPair.fromPrivKey(privateKey)).toString();

        console.log(address, sig, msg)
        console.log(bsv.Bsm.verify(Buffer.from(msg, 'base64'), sig, bsv.Address.fromString(address)))


        return {address, sig}
    }
    return {address}
};

/*
主账户("m/44'/0'/0'/0/0)，用于接收 bsv、token、nft

次1账户("m/44'/0'/1'/0/0) 用于 genesis 新的nft
次2账户("m/44'/0'/1'/0/1) 用于 genesis 新nft 的metaid 树 root节点
 */
walletManager.getMainAddress = function () {
    if (mMainAddress !== "")
        return mMainAddress;
    let account = localManager.getCurrentAccount()
    if (account && account.address) {
        //通过本地储存获取
        mMainAddress = account.address;
        return mMainAddress
    } else {
        //通过私钥衍生
        let rootKey = getRootKey();

        let privateKey = rootKey.derive("m/44'/0'/0'/0/0").privKey;
        let address = bsv.Address.fromPrivKey(privateKey);
        mMainAddress = address.toString();

        return mMainAddress;
    }
};

walletManager.getMainWif = function () {
    return walletManager.getWif("m/44'/0'/0'/0/0")
};

walletManager.getWif = function (path) {
    console.log(path)
    return getRootKey().derive(path).privKey.toWif();
};
walletManager.getWifAndPubKey = function (path) {
    let privateKey = getRootKey().derive(path).privKey;
    return {wif: privateKey.toWif(), pubKey: bsv.PubKey.fromPrivKey(privateKey).toString(), address: bsv.Address.fromPrivKey(privateKey).toString()}
};
walletManager.getAddress = function (path) {
    return bsv.Address.fromPrivKey(getRootKey().derive(path).privKey).toString();
};


walletManager.getBsvBalance = async function (address) {
    if (!address)
        address = walletManager.getMainAddress();
    let a = await sensibleApi.getBalance(address);
    return {
        confirmed: a.balance || 0,
        unconfirmed: a.pendingBalance || 0,
        total: (a.balance || 0) + (a.pendingBalance || 0)
    };
};

walletManager.pay = async function (to, amount, broadcast) {
    let wif = walletManager.getMainWif();

    //发送单人
    let txComposer = await new Wallet(
        wif,
        API_NET.MAIN,
        0.5,
        API_TARGET.SENSIBLE
    ).send(to, amount, {
        noBroadcast: !broadcast,
    });

    return {rawHex: txComposer.getRawHex(), fee: txComposer.getUnspentValue(), txid: txComposer.getTxId()};
};

walletManager.payArray = async function (receivers, broadcast,wif = null) {
    if (!wif)
        wif = walletManager.getMainWif();

    //发送多人
    let txComposer = await new Wallet(
        wif,
        API_NET.MAIN,
        0.5,
        API_TARGET.SENSIBLE
    ).sendArray(receivers,{
        noBroadcast:!broadcast,
    });

    return {rawHex: txComposer.getRawHex(), fee: txComposer.getUnspentValue(), txid: txComposer.getTxId()};
};

walletManager.sendOpReturn = function (op, wif) {
    if (!wif)
        wif = walletManager.getMainWif();
    return new Wallet(
        wif,
        API_NET.MAIN,
        0.5,
        API_TARGET.SENSIBLE
    ).sendOpReturn(op);
};

walletManager.checkBsvAddress = function (address) {
    return bsv.Address.isValid(address)
};
walletManager.getSeedFromMnemonic = mnemonicUtils.getSeedFromMnemonic;
walletManager.createMnemonic = mnemonicUtils.createMnemonic;
walletManager.saveMnemonic = mnemonicUtils.saveMnemonic;

module.exports = walletManager;
