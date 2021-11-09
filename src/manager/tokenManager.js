let tokenManager = {};
const httpUtils = require('../utils/httpUtils');

const sensibleFtUtils = require('../utils/sensibleFTUtils');
tokenManager.sensibleFt = sensibleFtUtils;

const localManager = require('./LocalManager')
// const baseList = [
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: '5d15eedd93c90d91e0d76de5cc932c833baf8336',
//         network: 'mainnet',
//         name: 'TSC',
//         decimal: 8,
//         fixed: 8,
//         unit: 'TSC',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ],
//         logo: '/img/tsc.png'
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: 'c52b5ee305834e3ceb97ee931ed5e453543ba2d8',
//         network: 'mainnet',
//         name: 'bsv/TSC',
//         decimal: 8,
//         fixed: 8,
//         unit: 'bsv/TSC',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ]
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: '67cfb6b1b163946a738cb0c2bed781d57d8099a7',
//         network: 'mainnet',
//         name: 'USDT',
//         decimal: 6,
//         fixed: 6,
//         unit: 'USDT',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ],
//         logo: '/img/usdt.png'
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: '47a928f6abc1c93582729fe62fccb54e7548fe98',
//         network: 'mainnet',
//         name: 'bsv/USDT',
//         decimal: 8,
//         fixed: 8,
//         unit: 'bsv/USDT',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ]
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: '54256eb1b9c815a37c4af1b82791ec6bdf5b3fa3',
//         network: 'mainnet',
//         name: 'MC',
//         decimal: 8,
//         fixed: 8,
//         unit: 'MC',
//         signers: [
//             'https://satotx.showpay.top',
//             'https://satotx2.showpay.top',
//             'https://satotx3.showpay.top',
//             'https://s1.satoplay.com',
//             'https://satotx.metasv.com'
//         ],
//         logo: '/img/mc.png'
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: '8764ede9fa7bf81ba1eec5e1312cf67117d47930',
//         network: 'mainnet',
//         name: 'bsv/MC',
//         decimal: 8,
//         fixed: 8,
//         unit: 'bsv/MC',
//         signers: [
//             'https://satotx.showpay.top',
//             'https://satotx2.showpay.top',
//             'https://satotx3.showpay.top',
//             'https://s1.satoplay.com',
//             'https://satotx.metasv.com'
//         ]
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: '341476e63af470912dbd166b19cfb21429c32566',
//         network: 'mainnet',
//         name: 'BOEX',
//         decimal: 0,
//         fixed: 0,
//         unit: 'BOEX',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ],
//         logo: '/img/boex.jpeg'
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: 'fd1d84f1c60592878b000f4e53b0de31117f772f',
//         network: 'mainnet',
//         name: 'bsv/BOEX',
//         decimal: 8,
//         fixed: 8,
//         unit: 'bsv/BOEX',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ]
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: '8e9c53e1a38ff28772db99ee34a23bb305062a1a',
//         network: 'mainnet',
//         name: 'OVTS',
//         decimal: 3,
//         fixed: 3,
//         unit: 'OVTS',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ],
//         logo: '/img/OVTS.png'
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: '1c5c53b9f6209a85266ccd8fccfb5790101dd11c',
//         network: 'mainnet',
//         name: 'bsv/OVTS',
//         decimal: 8,
//         fixed: 8,
//         unit: 'bsv/OVTS',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ]
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: 'ac42d90b83291e9c83d25bfe654cf83e0042b5a7',
//         network: 'mainnet',
//         name: 'BART',
//         decimal: 8,
//         fixed: 8,
//         unit: 'BART',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ]
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: '7b674d5fa1b60da14aae43e61842a290a172e16a',
//         network: 'mainnet',
//         name: 'bsv/BART',
//         decimal: 8,
//         fixed: 8,
//         unit: 'bsv/BART',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ]
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: '525d000031b3d45303cf96f3c38a890012d93040',
//         network: 'mainnet',
//         name: 'WHST',
//         decimal: 6,
//         fixed: 6,
//         unit: 'WHST',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ],
//         logo: '/img/whst.jpg'
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: '121e946a8b1ea87dae4484cd00d5ef94112d3b43',
//         network: 'mainnet',
//         name: 'bsv/WHST',
//         decimal: 8,
//         fixed: 8,
//         unit: 'bsv/WHST',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ]
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: 'ba85ed5e6f4492e2789f92d8c66cbe211943bdfc',
//         network: 'mainnet',
//         name: 'ASC',
//         decimal: 8,
//         fixed: 8,
//         unit: 'ASC',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ],
//         logo: '/img/asc.png'
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: 'b9a582fe1df1f6f9e052b6972c590b409d39fe78',
//         network: 'mainnet',
//         name: 'bsv/ASC',
//         decimal: 8,
//         fixed: 8,
//         unit: 'bsv/ASC',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ]
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: 'f460d392aea8ee18a0e315588ff22ab8ca1c84b6',
//         network: 'mainnet',
//         name: 'CEO',
//         decimal: 0,
//         fixed: 0,
//         unit: 'CEO',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ],
//         logo: '/img/ceo.jpg'
//     },
//     {
//         codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
//         genesis: '0b75d5dfabfeff2b1d989bc692a199f1ef094209',
//         network: 'mainnet',
//         name: 'bsv/CEO',
//         decimal: 8,
//         fixed: 8,
//         unit: 'bsv/CEO',
//         signers: [
//             'https://s1.satoplay.com',
//             'https://satotx.showpay.top',
//             'https://satotx.volt.id',
//             'https://satotx.metasv.com',
//             'https://satotx.tswap.io'
//         ]
//     }
// ]

// tokenManager.baseTokenList = baseList;

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
    let tokenTable = localStorage.getItem('allTokenTable');
    if (!tokenTable) {
        //    通过网络获取全部token信息
        tokenTable = {};
        let data = (await httpUtils.get('https://sensilet.com/api/token_list')).data

        if (data) {
            if (data.hot)
                data.hot.forEach(item => {
                    tokenTable[item.genesis] = item

                })

            if (data.list)
                data.list.forEach(item => {
                    tokenTable[item.genesis] = item
                })


            localStorage.setItem('allTokenTable', JSON.stringify(tokenTable));
        }
    } else
        tokenTable = JSON.parse(tokenTable)

    return tokenTable
}

tokenManager.getTokenListNet = async function () {
    let data = (await httpUtils.get('https://sensilet.com/api/token_list')).data

    let local = getLocalTokenList();
    if (data) {
        let temp = {};

        if (local && local.length > 0)
            local.forEach(item => {
                temp[item.genesis] = true
            })

        let allTokenTable = {};
        if (data.hot)
            //标记 为已添加
            // data.hot.map(item => {
            //     item.added = temp[item.genesis] || false;
            //     return item
            // })
            //
            //直接过滤掉
            data.hot = data.hot.filter(item => {
                allTokenTable[item.genesis] = item
                return !temp[item.genesis]
            })
        if (data.list)
            // data.list.map(item => {
            //     item.added = temp[item.genesis]|| false;
            //     return item
            // })
            //直接过滤掉
            data.list = data.list.filter(item => {
                allTokenTable[item.genesis] = item
                return !temp[item.genesis]
            })

        localStorage.setItem('allTokenTable', JSON.stringify(allTokenTable));
    }

    return data
}
tokenManager.reSaveToken = function (tokenList=[]){
    localStorage.setItem('tokenList', JSON.stringify(tokenList))
},
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


tokenManager.listUserTokens = async function () {

    let onlyShowAdded = localManager.getShowTokenType() === 'added';

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


        }


        if (onlyShowAdded) {
            //仅显示已添加的
            let localList = getLocalTokenList();
            for (let i = 0; localList && i < localList.length; i++) {
                let index = tempList.findIndex(item => item.genesis === localList[i].genesis);
                if (index < 0) {
                    localList[i].balance = 0;
                }else
                    localList[i].balance = tempList[index].balance

                if(!localList[i].logo && tokenTable[localList[i].genesis]){
                    localList[i].logo = tokenTable[localList[i].genesis].logo
                }
            }
            tokenList = localList;
        }else
            tokenList = tempList;

    } else {
        //查询接口返回错误时
        tokenList = getLocalTokenList();
        for (let i = 0; i < tokenList.length; i++) {
            tokenList[i].balance = await sensibleFtUtils.getBalance(tokenList[i].genesis, tokenList[i].codehash, address).catch(e => 0)
        }
    }
    if(tokenList && tokenList.length>0){
        tokenList.sort((a,b)=>{
            if(a.sort>0 && b.sort===undefined){
                return -1;
            }
            if(b.sort>0 && a.sort===undefined){
                return 1;
            }
            return b -a
        })
    }

    // console.log(tokenList)

    return tokenList;
};

tokenManager.getTokenInfoNet = async function (genesis, codehash) {

    let result = await httpUtils.get(`https://api.sensiblequery.com/ft/genesis-info/${codehash}/${genesis}`)
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


module.exports = tokenManager;
