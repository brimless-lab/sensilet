let sensibleUtils = {};
let bg = chrome.extension && chrome.extension.getBackgroundPage();
if(!bg)
    window.location.reload();
const config = require('../config/base');

const SensibleNFT = bg.sensibleSdk.SensibleNFT;
const SensibleNFTObj = new SensibleNFT({
    network: "mainnet", //mainnet or testnet
    feeb: 0.5,
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
        network: "mainnet", //mainnet or testnet
        purse: feeWif, //the wif of a bsv address to offer transaction fees
        feeb: 0.5,
        apiUrl:config.sensibleUrl

        // signers
    }).genesis({
        genesisWif,
        totalSupply
    })
};


sensibleUtils.issue = function(feeWif,genesisWif,receiverAddress,sensibleId,genesis,codehash){
    return new SensibleNFT({
        network: "mainnet", //mainnet or testnet
        purse: feeWif, //the wif of a bsv address to offer transaction fees
        feeb: 0.5,
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
        feeb: 0.5,
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
sensibleUtils.getSummaryDetail = function(codehash, genesis, address){
    return SensibleNFTObj.getSummaryDetail(codehash, genesis, address)
};

module.exports = sensibleUtils;
