let sensibleUtils = {};
let bg = chrome.extension && chrome.extension.getBackgroundPage();
if(!bg)
    window.location.reload();

const config = require('../config/base');

const bsv156 = bg.sensibleSdk.bsv;
const { SensibleApi } = require("@sensible-contract/sensible-api");
const sensibleApi = new SensibleApi(config.sensibleUrl);

const SensibleNFT = bg.sensibleSdk.SensibleNFT;
const SensibleNFTObj = new SensibleNFT({
    network: config.network, //mainnet or testnet
    feeb: config.fee,
    apiUrl:config.sensibleUrl

    // signers
});
/*
//以下代码需插入到 sensible-sdk/disk/index.js
const Buffer = require('buffer/index').Buffer;
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.Buffer = Buffer;
}
 */



sensibleUtils.getGenesisFee = function(op){
    return SensibleNFTObj.getGenesisEstimateFee({opreturnData:op})
};
sensibleUtils.getIssueFee = function(sensibleId, genesisPublicKey,op){
    console.log(sensibleId,genesisPublicKey,"getIssueFee")
    return SensibleNFTObj.getIssueEstimateFee({sensibleId, genesisPublicKey,opreturnData:op})
};

sensibleUtils.getTransferFee = function({genesis, codehash, tokenIndex, senderWif, senderPrivateKey, senderPublicKey, opreturnData}){
    console.log(genesis,codehash,tokenIndex,senderWif,"getTransferFee")
    return SensibleNFTObj.getTransferEstimateFee({genesis, codehash, tokenIndex, senderWif, senderPrivateKey, senderPublicKey, opreturnData})
};

/**
 *
 * @param feeWif 手续费私钥
 * @param genesisWif 发行方私钥
 * @param totalSupply   发行量
 */
sensibleUtils.genesis = function(feeWif,genesisWif,totalSupply){
    totalSupply +="";
    return new SensibleNFT({
        network: config.network, //mainnet or testnet
        purse: feeWif, //the wif of a bsv address to offer transaction fees
        feeb: config.fee,
        apiUrl:config.sensibleUrl

        // signers
    }).genesis({
        genesisWif,
        totalSupply
    })
};


sensibleUtils.issue = function(feeWif,genesisWif,receiverAddress,sensibleId,genesis,codehash){
    return new SensibleNFT({
        network: config.network, //mainnet or testnet
        purse: feeWif, //the wif of a bsv address to offer transaction fees
        feeb: config.fee,
        apiUrl:config.sensibleUrl

        // signers
    }).issue({
        genesis,
        codehash,
        genesisWif,
        receiverAddress,
        sensibleId,
        //todo metaTxId 这个哪里获取，需要自己创建并维护metaid树
        // metaTxId:,
    })
};

sensibleUtils.transfer = function(feeWif,senderWif,receiverAddress,genesis,codehash,tokenIndex,signers){
    let params = {
        network: "mainnet", //mainnet or testnet
        purse: feeWif, //the wif of a bsv address to offer transaction fees
        feeb: config.fee,
        apiUrl:config.sensibleUrl
        // signers
    }
    if(signers)
        params.signers = signers

    return new SensibleNFT(params).transfer({
        senderWif,
        receiverAddress,
        genesis,
        codehash,
        tokenIndex,
    });
};

sensibleUtils.getSummary = function(address){
    return SensibleNFTObj.getSummary(address)
};

sensibleUtils.getSummaryDetail = function (codehash, genesis, address) {
    return SensibleNFTObj.getSummaryDetail(codehash, genesis, address)
};

function parseSensibleID(sensibleID) {
    let sensibleIDBuf = Buffer.from(sensibleID, "hex");
    let genesisTxId = sensibleIDBuf.slice(0, 32).reverse().toString("hex");
    let genesisOutputIndex = sensibleIDBuf.readUIntLE(32, 4);
    return {
      genesisTxId,
      genesisOutputIndex,
    };
}


sensibleUtils.findNftSigners = async function findNftSigner(codehash, genesis, tokenIndex) {
	let nftDetail = await sensibleApi.getNftUtxoDetail(codehash, genesis, tokenIndex);
	if (!nftDetail) return null;
    let { genesisTxId } = parseSensibleID(nftDetail.sensibleId);
	let out = await sensibleApi.getTxOut(genesisTxId, 1);
	if (!out) return null;
    let script = new bsv156.Script(out.scriptPk);
    if (!script.chunks[7]) return null;
    let data = JSON.parse(script.chunks[7].buf.toString());
    return data.signers;
}

module.exports = sensibleUtils;
