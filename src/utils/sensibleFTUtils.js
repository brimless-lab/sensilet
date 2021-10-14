let utils = {};

//sensibleFtUtils 是加载在bg中
const SensibleFT = require('sensible-sdk').SensibleFT;

const config = require('../config/base');

const ft = new SensibleFT({
    network: config.network, //mainnet or testnet
    purse: "", //the wif of a bsv address to offer transaction fees
    feeb: 0.5,
    // signers,
});


utils.getBalance = function (genesis, codehash, address) {

    return ft.getBalance({
        codehash,
        genesis,
        address,
    });
};

utils.getUtxoCount = async (genesis, codehash, address) => {
    let {utxoCount} = await ft.getBalanceDetail({
        codehash,
        genesis,
        address
    });
    return utxoCount
};

utils.merge = async function (senderWif, purseWif, genesis,codehash,utxoCount){
    let ft = new SensibleFT({
        network: config.network,
        feeb: 0.5,
        purse: purseWif,
    });

    for (let i = 0; i < 10 && utxoCount > 20; i++) {
        await ft.merge(
            {
                ownerWif: senderWif,
                codehash,
                genesis,
            }
        );
        await sleep(2000);
        utxoCount -= 19;
    }
}

utils.transfer = async function (genesis, codehash, senderWif, purseWif, receivers, utxoCount, broadcast = true, utxo = null) {

    let ft = new SensibleFT({
        network: config.network,
        feeb: 0.5,
        purse: purseWif,
        // signers,
        // signerSelecteds: item.signerSelecteds,
    });
    if (utxo) {
        utxo.address = walletManager.getMainAddress();
        utxo.wif = walletManager.getMainWif();
    }

    for (let i = 0; i < 10 && utxoCount > 20; i++) {
        await ft.merge(
            {
                ownerWif: senderWif,
                codehash,
                genesis,
            }
        );
        await sleep(2000);
        utxoCount -= 19;
    }


    let transferParams = {
        senderWif,
        receivers,
        codehash,
        genesis,
        noBroadcast: !broadcast,
    }
    if(utxo){
        transferParams.utxos = [utxo]
    }


    return ft.transfer(transferParams)
};

utils.getTransferEsitimate = (codehash, genesis, receivers, senderWif) => {
    return ft.getTransferEstimateFee({
        codehash, genesis, receivers,
        senderWif,

    })
}

utils.getMergeEstimateFee = (codehash, genesis, senderWif) => {
    return ft.getMergeEstimateFee({
        codehash, genesis,
        ownerWif: senderWif,
        utxoMaxCount: 20
    })
}

module.exports = utils;
