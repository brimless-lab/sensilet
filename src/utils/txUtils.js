const apiUtils = require("./apiUtils");
const metaDataDao = require("@/dao/metaDataDao");
const httpUtils = require("@/utils/httpUtils");
const txUtils = {};

let bg = chrome.extension && chrome.extension.getBackgroundPage();
if (!bg)
    window.location.reload();

const BN = bg.sensibleSdk.BN;
const TxDecoder = bg.sensibleSdk.TxDecoder;
const API_NET = bg.sensibleSdk.API_NET;
const bsv156 = bg.sensibleSdk.bsv;

txUtils.txTypeWord = {
    0: "NFT",
    1: "TOKEN",
    2: "BSV",
    3: "OP_RETURN",
    4: "UNKNOWN",
}

txUtils.txType = {
    "SENSIBLE_NFT": 0,
    "SENSIBLE_FT": 1,
    "P2PKH": 2,
    "OP_RETURN": 3,
    "UNKNOWN": 4,
}

txUtils.getTxInfo = function (rawHex) {
    return TxDecoder.decodeTx(new bsv156.Transaction(rawHex), config.network)
};

txUtils.getInputsInfo = function (script, satoshis) {
    return TxDecoder.decodeOutput(new bsv156.Transaction.Output({
        satoshis, script
    }), config.network)
}

txUtils.sign = (wif, {txHex, scriptHex, address, inputIndex, satoshis, sigtype,}) => {
    if (!sigtype)
        sigtype = bsv156.crypto.Signature.SIGHASH_ALL | bsv156.crypto.Signature.SIGHASH_FORKID;

    let sighash = bsv156.Transaction.Sighash.sighash(
        new bsv156.Transaction(txHex),
        sigtype,
        inputIndex,
        new bsv156.Script(scriptHex),
        new BN(satoshis)
    ).toString("hex");

    let privateKey = null;
    if (address) {
        if (walletManager.checkBsvAddress(address)) {
            if (address !== walletManager.getMainAddress()) {
                throw new Error("unsupported address in inputInfos")
            } else
                privateKey = bsv156.PrivateKey.fromWIF(wif);
        } else   //传了address却不是地址，则视为path去衍生
            privateKey = bsv156.PrivateKey.fromWIF(walletManager.getWif(address));  //address :比如 /0/0
    } else
        privateKey = bsv156.PrivateKey.fromWIF(wif);

    let publicKey = privateKey.toPublicKey().toString();

    let sig = bsv156.crypto.ECDSA.sign(
        Buffer.from(sighash, "hex"),
        privateKey,
        "little"
    );

    return {
        publicKey,
        r: sig.r.toString("hex"),
        s: sig.s.toString("hex"),
        sig: sig.set({nhashtype: sigtype}).toTxFormat().toString("hex"),
    }
}

txUtils.signTransaction = function (txHex, inputInfos) {
    const tx = new bsv156.Transaction(txHex);

    return inputInfos.map((v) => {
        let privateKey = null;
        if (v.address) {
            if (walletManager.checkBsvAddress(v.address)) {
                if (v.address !== walletManager.getMainAddress()) {
                    throw new Error("unsupported address in inputInfos")
                } else
                    privateKey = bsv156.PrivateKey.fromWIF(walletManager.getMainWif());
            } else   //传了address却不是地址，则视为path去衍生
                privateKey = bsv156.PrivateKey.fromWIF(walletManager.getWif(v.address));
        } else
            privateKey = bsv156.PrivateKey.fromWIF(walletManager.getMainWif());

        let sighash = bsv156.Transaction.Sighash.sighash(
            tx,
            v.sighashType,
            v.inputIndex,
            new bsv156.Script(v.scriptHex),
            new bsv156.crypto.BN(v.satoshis)
        ).toString("hex");

        var sig = bsv156.crypto.ECDSA.sign(
            Buffer.from(sighash, "hex"),
            privateKey,
            "little"
        ).set({
            nhashtype: v.sighashType,
        }).toString();
        return {sig, publicKey: privateKey.toPublicKey().toString()};
    });
}

txUtils.getMetaData = async function (metaTxId, metaOutputIndex) {
    let metaData = null;
    if (metaTxId === "0000000000000000000000000000000000000000000000000000000000000000")
        return {}
    try {
        //从DB中读取缓存数据
        metaData = await metaDataDao.find(metaTxId)
        if (!metaData) {    //没有则发起请求
            let _res = await apiUtils.getRawTx(metaTxId);
            let tx = new bsv156.Transaction(_res);
            let chunks = tx.outputs[metaOutputIndex].script.chunks;
            let jsonData = chunks[2].buf.toString();
            if (jsonData === 'meta') {
                let data = chunks[7].buf.toString();
                metaData = JSON.parse(data);
                metaData.type = "metaid"
                metaData.description = metaData.desc;
                metaData.officialSite = metaData.website;
                if (metaData.icon)
                    metaData.image = 'https://showman.showpay.io/metafile/' + metaData.icon.replace('metafile://', "")
            } else {
                metaData = JSON.parse(jsonData);
                metaData.type = "standard"

                // console.log(metaData,"metaData")
                if (metaData && metaData.tokenUri) {
                    let result = await httpUtils.get(metaData.tokenUri)
                    if (result) {
                        metaData.name = result.name;
                        metaData.image = result.image;
                        metaData.animation_url = result.animation_url;
                        metaData.description = result.description;
                        metaData.attributes = result.attributes;
                        metaData.officialSite = result.external_url || result.officialSite;

                    }
                }
            }
            if (metaData) {
                console.log("#### metaData")
                await metaDataDao.add(metaTxId, metaData)
            }
        }


    } catch (e) {
        console.error('parse metadata failed', e);
    }
    if (config.debug)
        console.log(metaData, 'metaData')
    return metaData;
    // return {};
}


module.exports = txUtils;
