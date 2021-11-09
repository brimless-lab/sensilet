const txUtils = {};

let bg = chrome.extension.getBackgroundPage();
if (!bg)
    window.location.reload();

const BN = bg.sensibleSdk.BN;
const TxDecoder = bg.sensibleSdk.TxDecoder;
const API_NET = bg.sensibleSdk.API_NET;
const bsv156 = bg.sensibleSdk.bsv;

txUtils.txTypeWord = {
    0: "SENSIBLE_NFT",
    1: "SENSIBLE_FT",
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
    return TxDecoder.decodeTx(new bsv156.Transaction(rawHex), API_NET.MAIN)
};

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

    let privateKey = new bsv156.PrivateKey(wif);
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

txUtils.signTransaction =  function (wif, txHex, inputInfos) {
    const tx = new bsv156.Transaction(txHex);
    let privateKey = bsv156.PrivateKey.fromWIF(wif);

    return inputInfos.map((v) => {

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


module.exports = txUtils;
