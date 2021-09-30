let utils = {};

//sensibleFtUtils 是加载在bg中
const SensibleFT =require('sensible-sdk').SensibleFT;

const config = require('../config/base');

const ft = new SensibleFT({
    network: config.network, //mainnet or testnet
    purse: "", //the wif of a bsv address to offer transaction fees
    feeb: 0.5,
    // signers,
});


utils.getBalance = function (genesis,codehash, address) {

    return ft.getBalance({
        codehash,
        genesis,
        address,
    });
};

utils.getUtxoCount =async (genesis,codehash,address)=>{
    let {utxoCount} =await ft.getBalanceDetail({
        codehash,
        genesis,
        address
    });
    return utxoCount
};


utils.transfer = async function (genesis, codehash,senderWif, purseWif, receivers,utxoCount,broadcast=true) {

     let ft = new SensibleFT({
        network: config.network,
        feeb: 0.5,
        purse: purseWif,
        // signers,
        // signerSelecteds: item.signerSelecteds,
    });


    for (let i = 0; i < 10 && utxoCount > 20; i++) {
        await ft.merge(
            {
                ownerWif: senderWif,
                codehash ,
                genesis,
            }
        );
        await sleep(2000);
        utxoCount -= 19;
    }

     return ft.transfer({
         senderWif,
         receivers,
         codehash,
         genesis,
         noBroadcast:!broadcast,
     })
};

utils.getTransferEsitimate = (codehash, genesis, receivers,senderWif)=>{
    // getTransferEstimateFee({
    // codehash, genesis, receivers, senderWif,
    // senderPrivateKey, senderPublicKey, ftUtxos,
    // ftChangeAddress, isMerge, opreturnData, utxoMaxCount,
    // }: {
    // return SensibleNFTObj.getTransferEstimateFee({genesis, codehash, tokenIndex, senderWif, senderPrivateKey, senderPublicKey, opreturnData})



    return  ft.getTransferEstimateFee({
         codehash, genesis, receivers,
        senderWif,

     })
}

module.exports = utils;
