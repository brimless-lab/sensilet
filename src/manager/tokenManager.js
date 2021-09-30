let tokenManager = {};
const sensibleFtUtils = require('../utils/sensibleFTUtils');
tokenManager.sensibleFt = sensibleFtUtils;

const baseList = [
    {
        codehash: "777e4dd291059c9f7a0fd563f7204576dcceb791",
        genesis: "8e9c53e1a38ff28772db99ee34a23bb305062a1a",
        network: "mainnet",
        name: "OVTS",
        logo: "/img/OVTS.png",
        decimal: 3,
        fixed: 3,
        unit: "OVTS",
    }, {
        officialSite: 'https://tokenswap.pro',
        codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
        genesis: '5d15eedd93c90d91e0d76de5cc932c833baf8336',
        network: "mainnet",
        name: "TSC",
        logo: '/img/tsc.png',
        decimal: 8,
        fixed: 8,
        unit: "TSC",
    }, {
        officialSite: 'https://omf.foundation/MetaCoin',
        codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
        genesis: '54256eb1b9c815a37c4af1b82791ec6bdf5b3fa3',
        network: "mainnet",
        name: "MetaCoin",
        logo: '/img/mc.png',
        decimal: 8,
        fixed: 8,
        unit: "MC",
    },

];
tokenManager.baseTokenList = baseList;

const infoLimit = {
    codehash: {
        required: true,
        type: 'string',
    },
    genesis: {
        required: true,
        type: 'string',
    },
    network: {
        required: false,
        type: 'string',
    },
    name: {
        required: true,
        type: 'string',
    },
    logo: {
        required: false,
        type: 'string',
    },
    decimal: {
        required: true,
        type: 'number',
    },
    fixed: {
        required: true,
        type: 'number',
    },
    unit: {
        required: false,
        type: 'string',
    },
    signers: {
        required: false,
    },
};

function getLocalTokenList() {

    let tokenList = localStorage.getItem('tokenList');
    return tokenList ? JSON.parse(tokenList) : [];
}

tokenManager.addToken = function (tokenInfo) {
    for (let key in infoLimit) {
        if (infoLimit[key].required) {
            if (!tokenInfo[key])
                return new Error(errorCode.PARAM_NOT_FOUND + `${key} is required`);
            else if (infoLimit[key].type && typeof tokenInfo[key] !== infoLimit[key].type) {
                return new Error(errorCode.PARAM_NOT_EXPECTED + `${key} need be a ${infoLimit[key].type}`);
            }
        } else if (tokenInfo[key] && infoLimit[key].type && typeof tokenInfo[key] !== infoLimit[key].type) {
            return new Error(errorCode.PARAM_NOT_EXPECTED + `${key} need be a ${infoLimit[key].type}`);
        }
    }

    let tokenList = getLocalTokenList();
    for (let i = 0; i < tokenList.length; i++) {
        if (tokenList[i].genesis === tokenInfo.genesis) {
            return new Error(errorCode.GENESIS_EXIST);
        }
    }

    tokenList.push(tokenInfo);

    localStorage.setItem('tokenList', JSON.stringify(tokenList))
};

tokenManager.listUserTokens = async function () {

    let tokenList = getLocalTokenList();

    let address = walletManager.getMainAddress();

    for (let i = 0; i < tokenList.length; i++) {
        tokenList[i].balance = await sensibleFtUtils.getBalance(tokenList[i].genesis, tokenList[i].codehash, address)
    }

    return tokenList;
};

tokenManager.getTokenInfo = async function (genesis) {
    let tokenList = getLocalTokenList();
    let tokenInfo = null;
    for (let i = 0; i < tokenList.length; i++) {
        if (tokenList[i].genesis === genesis) {
            tokenInfo = tokenList[i];
            break
        }
    }
    if (!tokenInfo)
        for (let i = 0; i < baseList.length; i++) {
            if (baseList[i].genesis === genesis) {
                tokenInfo = baseList[i];
                break
            }
        }

    if (tokenInfo) {
        tokenInfo.balance = await sensibleFtUtils.getBalance(tokenInfo.genesis, tokenInfo.codehash, walletManager.getMainAddress())
    }
    return tokenInfo

};

tokenManager.transfer = async function (receivers,broadcast, {genesis, codehash}) {
    let wif = walletManager.getMainWif();
    //转账时，bsv Utxo 需小于等于3，转账前检查


    //转账时，token Utxo 数需小于等于20，转账报错时检查
    return await sensibleFtUtils.transfer(genesis, codehash, wif, wif, receivers, 10,broadcast);
};


module.exports = tokenManager;
