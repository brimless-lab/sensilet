let walletManager = {};


let bg =chrome.extension && chrome.extension.getBackgroundPage();
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

function getRootKey(fromSeed = false) {
    if (mRootKey)
        return mRootKey;
    if (fromSeed)
        mRootKey = bsv.Bip32.fromSeed(walletManager.getSeedFromLocked());
    else
        mRootKey = bsv.Bip32.fromSeed(mnemonicUtils.getSeedFromMnemonic(walletManager.getMnemonic()));
    return mRootKey;
}

function getPrivateKeyObj(path = '/0/0') {

    let lockInfo = JSON.parse(localStorage.getItem('lockInfo'));
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }
    path = (lockInfo.path ? lockInfo.path : "m/44'/0'/0'") + path
    // console.log(path)
    if (lockInfo.isSinglePrivateKey) {
        return bsv.PrivKey.fromWif(walletManager.getMnemonic());
    } else if (lockInfo.hasPassphrase) {
        return getRootKey(true).derive(path).privKey
    } else {
        return getRootKey().derive(path).privKey
    }
}


walletManager.init = function () {
    walletManager.getCurrentAccount = localManager.getCurrentAccount;
    walletManager.listAccount = localManager.listAccount;

    walletManager.removeAccount = localManager.removeAccount;
    walletManager.chooseAccount = localManager.chooseAccount;
    walletManager.saveAlias = localManager.saveAlias;
    walletManager.refreshLockInfoList = localManager.refreshLockInfoList;

    return walletManager;
};

walletManager.reload = function () {
    mMainAddress = "";
    mRootKey = "";
    mMainAddress = "";
    mPassword = "";
}
walletManager.isSinglePrivateKey = function () {
    let lockInfo = JSON.parse(localStorage.getItem('lockInfo'));
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }

    return lockInfo.isSinglePrivateKey || false;
}
walletManager.getAccountMode = function (lockInfo) {
    if (!lockInfo)
        lockInfo = JSON.parse(localStorage.getItem('lockInfo'));
    if (!lockInfo) {
        return ""
    }
    if (lockInfo.isSinglePrivateKey)
        return "account.mode_single_key"

    return "account.mode_HD"

}
walletManager.isMnemonicCreate = function () {
    let lockInfo = localManager.getCurrentAccount();
    return lockInfo !== '' && lockInfo !== null;
};

//是否需要解锁钱包
walletManager.isNeedUnlock = function () {
    let lockInfo = JSON.parse(localStorage.getItem('lockInfo'));
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }

    //默认密码
    if (lockInfo.passwordHash === 'b9eb1134beb66506cbdfa320686147d297ba2f3597d772ee92e7dc83e025ac44') {

        mPassword = bsv.Hash.sha256(Buffer.from('SatoWallet#2021' + 'SatoWallet')).toString('hex');

        return false
    }
//    从bg的对象中查询
    return !bg.passwordAesTable[lockInfo.address] && !mPassword;
};
walletManager.isDefaultPassword = function () {
    let lockInfo = JSON.parse(localStorage.getItem('lockInfo'));
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }
    return lockInfo.passwordHash === 'b9eb1134beb66506cbdfa320686147d297ba2f3597d772ee92e7dc83e025ac44'
}
walletManager.checkPassword = function (password) {
    let lockInfo = localManager.getCurrentAccount();
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }
    password += 'SatoWallet';
    password = bsv.Hash.sha256(Buffer.from(password)).toString('hex');
    let passwordHash = bsv.Hash.sha256(Buffer.from(password + 'SatoWallet')).toString('hex');

    return passwordHash === lockInfo.passwordHash
}
walletManager.unlock = function (password, keep) {

    let lockInfo = localManager.getCurrentAccount();
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }
    password += 'SatoWallet';
    password = bsv.Hash.sha256(Buffer.from(password)).toString('hex');
    let passwordHash = bsv.Hash.sha256(Buffer.from(password + 'SatoWallet')).toString('hex');

    if (passwordHash === lockInfo.passwordHash) {
        //加密保存密码到内存中
        mPassword = password;
        if (keep)
            bg.passwordAesTable[lockInfo.address] = aesUtils.AESEncrypto(password, passwordAesKey);

        return true;
    }
    return false;
};
walletManager.getMnemonic = function () {
    let lockInfo = localManager.getCurrentAccount();
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }

    if (!mPassword) {
        if (!bg.passwordAesTable[lockInfo.address]) {
            try {

            }catch (e) {

            }
            throw new Error('Unlock Wallet First');
        }

        mPassword = aesUtils.AESDecrypto(bg.passwordAesTable[lockInfo.address], passwordAesKey)
    }
    return aesUtils.AESDecrypto(lockInfo.locked, mPassword)
};

walletManager.getPath = function () {
    let lockInfo = localManager.getCurrentAccount();
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }

    return lockInfo.path || config.path
};

walletManager.getSeedFromLocked = function () {
    let lockInfo = localManager.getCurrentAccount();
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }

    if (!mPassword) {
        if (!bg.passwordAesTable[lockInfo.address])
            throw new Error('Unlock Wallet First');

        mPassword = aesUtils.AESDecrypto(bg.passwordAesTable[lockInfo.address], passwordAesKey)
    }

    let seedStr = aesUtils.AESDecrypto(lockInfo.seedLocked, mPassword);

    return Buffer.from(seedStr, 'hex')
};

walletManager.signMessage = function (msg, noNeedAddress) {
    if (typeof msg === 'string')
        msg = Buffer.from(msg);

    // let rootKey = getRootKey();
    // let privateKey = rootKey.derive("m/44'/0'/0'/0/0").privKey;
    let privateKey = getPrivateKeyObj("/0/0")
    let address = bsv.Address.fromPrivKey(privateKey).toString();
    if (msg) {
        let sig = bsv.Bsm.sign(msg, bsv.KeyPair.fromPrivKey(privateKey)).toString();

        // console.log(address, sig, msg)
        // console.log(bsv.Bsm.verify(Buffer.from(msg, 'base64'), sig, bsv.Address.fromString(address)))


        return noNeedAddress ? sig : {address, sig}
    }
    return {address}
};

/*
主账户("/0/0)，用于接收 bsv、token、nft

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
        // let rootKey = getRootKey();
        // let privateKey = rootKey.derive("/0/0").privKey;
        try {
            let privateKey = getPrivateKeyObj("/0/0")
            let address = bsv.Address.fromPrivKey(privateKey);
            mMainAddress = address.toString();

            return mMainAddress;
        } catch (e) {
            return ""
        }

    }
};


walletManager.getMainWif = function () {
    return walletManager.getWif("/0/0")
};

walletManager.getMainPubKey = function () {
    return walletManager.getWifAndPubKey("/0/0").pubKey
};

walletManager.getPubKey = function (path='/0/0') {
    return walletManager.getWifAndPubKey(path).pubKey
};

walletManager.getWif = function (path = '/0/0') {
    return getPrivateKeyObj(path).toWif();
};
walletManager.getWifAndPubKey = function (path = '/0/0') {
    let privateKey = getPrivateKeyObj(path);
    return {wif: privateKey.toWif(), pubKey: bsv.PubKey.fromPrivKey(privateKey).toString(), address: bsv.Address.fromPrivKey(privateKey).toString()}
};
walletManager.getAddress = function (path = '/0/0') {
    return bsv.Address.fromPrivKey(getPrivateKeyObj(path)).toString();
};
walletManager.getPublicKeyAndAddress = function (path) {
    let wifAndPubKey = walletManager.getWifAndPubKey(path)
    delete wifAndPubKey.wif
    return wifAndPubKey
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

walletManager.getBsvUtxoCount = async function (address) {
    if (!address)
        address = walletManager.getMainAddress();
    let _res = await sensibleApi.getUnspents(address)
    return _res.length;
}

walletManager.mergeBsvUtxo = async function (wif) {

    await new Wallet(wif, API_NET.MAIN, 0.5, API_TARGET.SENSIBLE).merge()

    return await sleep(2000)
}
walletManager.getSendAllInfo = async function (wif) {
    let txComposer = await new Wallet(wif, API_NET.MAIN, 0.5, API_TARGET.SENSIBLE).merge({
        noBroadcast: true
    })

    return {amount: txComposer.getOutput(0).satoshis, fee: txComposer.getUnspentValue()}
}

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

walletManager.payArray = async function (receivers, broadcast, wif = null) {
    // console.log('pay array')
    if (!wif)
        wif = walletManager.getMainWif();

    // console.log(receivers)

    //发送多人
    let txComposer = await new Wallet(
        wif,
        API_NET.MAIN,
        0.5,
        API_TARGET.SENSIBLE
    ).sendArray(receivers, {
        noBroadcast: !broadcast,
    });

    // console.log(txComposer)
    return {rawHex: txComposer.getRawHex(), fee: txComposer.getUnspentValue(), txid: txComposer.getTxId(), tx: txComposer.tx, isInvalid: txComposer.getFeeRate() < 0.5};
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
walletManager.getAddressFromMnemonic = mnemonicUtils.getAddressFromMnemonic;
walletManager.createMnemonic = mnemonicUtils.createMnemonic;
walletManager.saveMnemonic = mnemonicUtils.saveMnemonic;


/*
 *
 * 以下是对单私钥模式的支持
 */
walletManager.getAddressFromWif = function (wif) {
    return bsv.Address.fromPrivKey(bsv.PrivKey.fromWif(wif)).toString()
}

walletManager.deleteCurrent = function () {
    let lockInfo = localManager.getCurrentAccount()
    if (!lockInfo)
        return

    let lockInfoList = localManager.listAccount()

    // 删除
    if (lockInfoList) {
        lockInfoList = lockInfoList.filter((item) => item.address !== lockInfo.address)
    }

    if (bg.passwordAesTable[lockInfo.address]) {
        delete bg.passwordAesTable[lockInfo.address]
    }

    localManager.saveAccountList(lockInfoList)
    localManager.removeAccount();
    walletManager.reload();
}

walletManager.changePassword = function (oldPwd,newPwd){
    let lockInfo = localManager.getCurrentAccount();
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }
    oldPwd += 'SatoWallet';
    oldPwd = bsv.Hash.sha256(Buffer.from(oldPwd)).toString('hex');
    let passwordHash = bsv.Hash.sha256(Buffer.from(oldPwd + 'SatoWallet')).toString('hex');

    if( passwordHash !== lockInfo.passwordHash){
        throw new Error('wrong password')
    }

    //change locked & passwordHash
    let mnemonic =  aesUtils.AESDecrypto(lockInfo.locked, oldPwd);

    newPwd += 'SatoWallet';
    newPwd = bsv.Hash.sha256(Buffer.from(newPwd)).toString('hex');

    lockInfo['passwordHash'] = bsv.Hash.sha256(Buffer.from(newPwd + 'SatoWallet')).toString('hex');
    lockInfo['locked'] = aesUtils.AESEncrypto(mnemonic,newPwd);

    localManager.saveAccount(lockInfo);

    walletManager.reload();
}

module.exports = walletManager;
