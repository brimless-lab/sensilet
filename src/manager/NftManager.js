let nftManager = {};

const sensibleNftUtils = require('../utils/sensibleNftUtils');
const metaIdUtils = require('../utils/metaIdUtils');
const apiUtils = require('../utils/apiUtils');
nftManager.sensibleNft = sensibleNftUtils;

let bg = chrome.extension && chrome.extension.getBackgroundPage();
if (!bg)
    window.location.reload();
const {API_NET, API_TARGET, Wallet, SensibleApi} = bg.sensibleSdk;

nftManager.getNftInfoNet = async function () {
    let {data, version} = await apiUtils.getNftInfoList()
    if (data && data.length > 0) {
        //    转换成table存下来
        let table = {};
        data.forEach((item) => {
            table[item.genesis] = item;
        })
        localManager.setNftInfoTable(table, version)

        return table
    }
    return {}
}
nftManager.getNftInfoTable = async function(){
    let table = localManager.getNftInfoTable();
    if(!table){
        table = await nftManager.getNftInfoNet()
    }
    return table;
}

nftManager.listGenesis = async function () {
    return localManager.listGenesis();
};
nftManager.getNewGenesisPathIndex = function () {
    return nftManager.listGenesis().length + 1;
};
nftManager.listAllNft = function () {
    return sensibleNftUtils.getSummary(walletManager.getMainAddress())
};
nftManager.genesis = function (index, metaIdInfo, totalSupply = 9223372036854776000) { //2^63  默认值
    return new Promise(async (resolve, reject) => {

        try {
            let feeWif = walletManager.getMainWif();
            let path = `m/44'/0'/${index}'/0/0`;
            let {wif, pubKey} = walletManager.getWifAndPubKey(path);

            let {txid, genesis, codehash, sensibleId} = await sensibleNftUtils.genesis(
                feeWif, wif, totalSupply
            );

            localManager.saveGenesis({
                txid, genesis, codehash, index, path, pubKey, sensibleId,
                metaIdInfo
            });
        } catch (e) {
            console.log(e);
            let msg = "创建失败";
            if (e.message === "Insufficient balance.")
                msg += "：账户余额不足";
            antMessage.error(msg);
            reject(e)
        }
    })
};
nftManager.getCreateMetaIdForGenesisNftFee = () => 10000;

nftManager.createMetaIdForGenesisNft = async function ({index, name, desc, icon, callback}) {

    let rootPath = `m/44'/0'/${index}'/0/1`;
    let infoPath = `m/44'/0'/${index}'/0/10`;
    let namePath = `m/44'/0'/${index}'/0/11`;
    let protocolsPath = `m/44'/0'/${index}'/0/100`;

    //创建根节点
    let rootInfo = walletManager.getWifAndPubKey(rootPath);
    let infoInfo = walletManager.getWifAndPubKey(infoPath);
    let nameInfo = walletManager.getWifAndPubKey(namePath);
    let protocolsInfo = walletManager.getWifAndPubKey(protocolsPath);

    if (callback)
        callback(0, '准备创建MetaId信息');
    //给这些地址打入手续费
    let feeTxid = await walletManager.payArray([{
        address: rootInfo.address,
        amount: 6000,
    }, {
        address: infoInfo.address,
        amount: 2000,
    }, {
        address: protocolsInfo.address,
        amount: 2000,
    },]);

    if (callback)
        callback(1, '正在创建ROOT节点');

    //等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000));


    let rootTxid = (await walletManager.sendOpReturn(metaIdUtils.buildMetaData(rootInfo.pubKey, 'NULL', 'ROOT'), rootInfo.wif)).txid;

    let infoTxid = "";
    let nameTxid = "";
    let descTxid = "";
    let iconTxid = "";
    if (name || desc || icon) {
        if (callback)
            callback(2, '正在创建Info节点');
        infoTxid = (await walletManager.sendOpReturn(metaIdUtils.buildMetaData(infoInfo.pubKey, rootTxid, "Info", "", "0", "", "text/plain", "UTF-8"), rootInfo.wif)).txid;
        if (name) {
            if (callback)
                callback(3, '正在记录名称信息');
            nameTxid = (await walletManager.sendOpReturn(metaIdUtils.buildMetaData(nameInfo.pubKey, infoTxid, "name", name, "0", "0", "text/plain", "UTF-8"), infoInfo.wif)).txid;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (desc) {
            if (callback)
                callback(4, '正在记录描述信息');
            descTxid = (await walletManager.sendOpReturn(metaIdUtils.buildMetaData(nameInfo.pubKey, infoTxid, "desc", desc, "0", "0", "text/plain", "UTF-8"), infoInfo.wif)).txid;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (icon) {
            if (callback)
                callback(5, '正在记录icon信息');
            iconTxid = (await walletManager.sendOpReturn(metaIdUtils.buildMetaData(nameInfo.pubKey, infoTxid, "icon", icon, "0", "0", "text/plain", "UTF-8"), infoInfo.wif)).txid;
        }
    }


//    创建protocols 节点
    if (callback)
        callback(6, '正在创建创建Protocols节点');
    let protocolsTxid = (await walletManager.sendOpReturn(metaIdUtils.buildMetaData(protocolsInfo.pubKey, rootTxid, "Protocols", "", 0, "", "text/plain", "utf-8"), rootInfo.wif)).txid;

//    创建nft协议节点  这里直接用root节点作为公钥 方便创建子节点
    if (callback)
        callback(7, '正在创建创建NFT协议节点');
    let nftProtocolTxid = (await walletManager.sendOpReturn(metaIdUtils.buildMetaData(rootInfo.pubKey, protocolsTxid, "NftIssue", "f18d5098a90d", "0", "1.0.3", "text/plain", "UTF-8"), protocolsInfo.wif)).txid

    return {
        rootTxid, protocolsTxid, nftProtocolTxid,
        infoTxid, nameTxid, descTxid, iconTxid
    }
};

nftManager.createMetaIdNodeForIssue = function () {
    let timeIndex = Date.now(); //这里以时间戳作为衍生路径，还要记录在metaid上
};

nftManager.issue = function (genesisInfo) {
    return new Promise(async (resolve, reject) => {

        try {
            let feeWif = walletManager.getMainWif();
            let receiveAddress = walletManager.getMainAddress();
            let genesisWif = walletManager.getWif(genesisInfo.path);
            let result = await sensibleNftUtils.issue(feeWif, genesisWif, receiveAddress, genesisInfo.sensibleId, genesisInfo.genesis, genesisInfo.codehash);
            resolve(result);
        } catch (e) {
            console.log(e);
            let msg = "创建失败";
            if (e.message === "Insufficient balance.")
                msg += "：账户余额不足";
            antMessage.error(msg);
            reject(e)
        }
    })
};

nftManager.transfer = function (receiverAddress, genesis, codehash, tokenIndex) {

    return new Promise(async (resolve, reject) => {

        try {
            let feeWif = walletManager.getMainWif();
            let result = await sensibleNftUtils.transfer(feeWif, feeWif, receiverAddress, genesis, codehash, tokenIndex)
            resolve(result);
        } catch (e) {
            let msg = "转移失败";
            if (e.message.indexOf("Insufficient balance.") >= 0)
                msg += "：账户余额不足";
            else if (e.message.indexOf("Invalid Address string provided") >= 0)
                msg += "：无效的地址";
            antMessage.error(msg);
            reject(e)
        }
    });
};

// chrome.storage.local.set({aaa1:[{aaa:'bbbb'}]})
// chrome.storage.local.get('genesisInfo', (result) => {
//     let genesisInfo = (result.genesisInfo || []);
//     genesisInfo.push({
//         // txid, genesis, codehash, index, path
//         aaa:"测试测试",
//     });
//     chrome.storage.local.set({genesisInfo})
// });
// chrome.storage.local.remove("genesisInfo",(result)=>{console.log(result)})
// chrome.storage.local.get("genesisInfo",(result)=>{console.log(result)})


module.exports = nftManager;


