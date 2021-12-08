let tokenManager = {};
const httpUtils = require('../utils/httpUtils');
const apiUtils = require('../utils/apiUtils');

const sensibleFtUtils = require('../utils/sensibleFTUtils');
tokenManager.sensibleFt = sensibleFtUtils;

const localManager = require('./LocalManager')


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
        required: false,
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
        required: false,
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

function getLocalTokenTable() {

    let tokenList = getLocalTokenList();
    let tokenTable = {};
    tokenList.forEach((item) => {
        tokenTable[item.genesis] = item;
    })
    return tokenTable;
}

async function getAllTokenTable() {
    let tokenTable = localManager.getAllTokenTable();
    if (!tokenTable) {
        //    通过网络获取全部token信息
        tokenTable = {};
        let {data, version} = await apiUtils.getTokenList()


        if (data) {
            if (data.hot)
                data.hot.forEach(item => {
                    tokenTable[item.genesis] = item

                })

            if (data.list)
                data.list.forEach(item => {
                    tokenTable[item.genesis] = item
                })


            localManager.setAllTokenTable(tokenTable, version)
            // localStorage.setItem('allTokenTable', JSON.stringify(tokenTable));
        }
    }

    return tokenTable
}

tokenManager.getTokenListNet = async function () {
    let {data, version} = await apiUtils.getTokenList()

    let local = getLocalTokenList();
    if (data) {
        let temp = {};

        if (local && local.length > 0)
            local.forEach(item => {
                temp[item.genesis] = true
            })

        let allTokenTable = {};

        //过滤掉已经添加的token
        data = data.filter(item => {
            allTokenTable[item.genesis] = item
            return !temp[item.genesis]
        })

        localManager.setAllTokenTable(allTokenTable, version)
    }
    // console.log(data)

    return data
}
//
tokenManager.refreshLocalTokenData = async function () {
    let localList = getLocalTokenList();
    let allTokenTable = await getAllTokenTable();
    // console.log(localList,'#2')
    for (let i = 0; localList && i < localList.length; i++) {
        console.log(allTokenTable[localList[i].genesis])
        if (allTokenTable[localList[i].genesis]) {
            let tokenInfo = allTokenTable[localList[i].genesis];

            if (!tokenInfo.fixed)
                tokenInfo.fixed = tokenInfo.decimal;
            if (!tokenInfo.unit)
                tokenInfo.unit = tokenInfo.name;
            if (!tokenInfo.logo)
                tokenInfo.logo = '/img/empty-token.png';
            if (!tokenInfo.network)
                tokenInfo.network = 'mainnet';

            tokenInfo.topped = localList[i].topped;

            localList[i] = tokenInfo;
        }
    }
    tokenManager.reSaveToken(localList)
}


tokenManager.reSaveToken = function (tokenList = []) {
    localStorage.setItem('tokenList', JSON.stringify(tokenList))
}
tokenManager.addToken = function (tokenInfo) {
    for (let key in infoLimit) {
        if (infoLimit[key].required) {
            if (tokenInfo[key] === undefined || tokenInfo[key] == null)
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
            return new Error(getErrorMsg(errorCode.GENESIS_EXIST));
        }
    }

    if (!tokenInfo.fixed)
        tokenInfo.fixed = tokenInfo.decimal;
    if (!tokenInfo.unit)
        tokenInfo.unit = tokenInfo.name;
    if (!tokenInfo.logo)
        tokenInfo.logo = '/img/empty-token.png';
    if (!tokenInfo.network)
        tokenInfo.network = 'mainnet';

    tokenInfo.topped = false; //排序设定

    tokenList.push(tokenInfo);

    localStorage.setItem('tokenList', JSON.stringify(tokenList))
};


tokenManager.listUserTokens = async function (showAll = false) {

    let onlyShowAdded = localManager.getShowTokenType() === 'added';
    if (showAll)
        onlyShowAdded = false;

    let tokenList = [];

    let address = walletManager.getMainAddress();

    let result = await sensibleFtUtils.getAllBalance(address, 0, 10000)

    if (result.code === 0) {
        let tempList = result.data || [];

        let tokenTable = await getAllTokenTable();
        for (let i = 0; i < tempList.length; i++) {
            if (tokenTable[tempList[i].genesis])
                tempList[i].logo = tokenTable[tempList[i].genesis].logo;        // 给数据加上logo

            tempList[i].balance += tempList[i].pendingBalance;
            tempList[i].name = tempList[i].symbol

        }


        if (onlyShowAdded) {
            //仅显示已添加的
            let localList = getLocalTokenList();
            for (let i = 0; localList && i < localList.length; i++) {
                let index = tempList.findIndex(item => item.genesis === localList[i].genesis);
                if (index < 0) {
                    localList[i].balance = 0;
                } else
                    localList[i].balance = tempList[index].balance

                if (!localList[i].logo && tokenTable[localList[i].genesis]) {
                    localList[i].logo = tokenTable[localList[i].genesis].logo
                }
            }
            tokenList = localList;
        } else
            tokenList = tempList;

    } else {
        //查询接口返回错误时
        tokenList = getLocalTokenList();
        for (let i = 0; i < tokenList.length; i++) {
            tokenList[i].balance = await sensibleFtUtils.getBalance(tokenList[i].genesis, tokenList[i].codehash, address).catch(e => 0)
        }
    }
    if (tokenList && tokenList.length > 0) {
        tokenList.sort((a, b) => {
            if (a.sort > 0 && b.sort === undefined) {
                return -1;
            }
            if (b.sort > 0 && a.sort === undefined) {
                return 1;
            }
            return b.sort - a.sort
        })
        //

    }

    // console.log(tokenList)

    return tokenList;
};

tokenManager.addPriceForTokenList = async function (tokenList) {
    if (tokenList && tokenList.length > 0) {

        // // 获取一下币价
        let priceTable = (await apiUtils.getTokenPrice()).data;

        tokenList.forEach(item => {
            if (priceTable[item.genesis] && priceTable[item.genesis].USDT) {
                if (item.balance > 0) {
                    // console.log(item.balance)
                    item.usd = (item.balance / Math.pow(10, item.decimal) * priceTable[item.genesis].USDT).toFixed(2);
                } else
                    item.usd = "0.00"
            } else
                item.usd = "";
        })
    }
}

tokenManager.getTokenInfoNet = async function (genesis, codehash) {

    // let result = await httpUtils.get(`https://api.sensiblequery.com/ft/genesis-info/${codehash}/${genesis}`)
    let result = await apiUtils.getTokenInfo(genesis, codehash)
    if (!result || result.code !== 0)
        return null

    let tokenInfo = result.data;

    return {
        codehash: codehash,
        genesis: genesis,
        network: 'mainnet',
        name: tokenInfo.name,
        decimal: tokenInfo.decimal,
        fixed: tokenInfo.fixed || tokenInfo.decimal,
        unit: tokenInfo.symbol,
        logo: tokenInfo.icon,
    }
}

tokenManager.getTokenInfo = async function (genesis, codehash) {
    //从已添加的列表中获取
    let tokenTable = getLocalTokenTable();
    let tokenInfo = tokenTable[genesis];

    //没有则从所有token列表中获取信息
    if (!tokenInfo) {
        let allInfo = await getAllTokenTable()
        tokenInfo = allInfo[genesis];
    }

    //仍然没有就从api获取
    if (!tokenInfo) {
        tokenInfo = await tokenManager.getTokenInfoNet(genesis, codehash)
    }

    //查询余额
    if (tokenInfo) {
        tokenInfo.balance = await sensibleFtUtils.getBalance(tokenInfo.genesis, tokenInfo.codehash, walletManager.getMainAddress())
    }
    return tokenInfo

};


tokenManager.transfer = async function (receivers, broadcast, {genesis, codehash}, utxo, signers) {
    let wif = walletManager.getMainWif();

    //转账时，bsv Utxo 需小于等于3，转账前检查
    let utxoCount = await sensibleFtUtils.getUtxoCount(genesis, codehash, walletManager.getMainAddress());

    //转账时，token Utxo 数需小于等于20，转账报错时检查
    return sensibleFtUtils.transfer(genesis, codehash, wif, wif, receivers, utxoCount, broadcast, utxo, signers);
};

tokenManager.fixPic = function () {
    let list = getLocalTokenList()
    for (let i = 0; list && i < list.length; i++) {
        if (list[i].genesis === "5d15eedd93c90d91e0d76de5cc932c833baf8336") {
            if (list[i].logo !== '/img/tsc.png') {
                list[i].logo = '/img/tsc.png'
                tokenManager.reSaveToken(list)
            }
            break;
        }
    }
}


module.exports = tokenManager;
