let apiUtils = {};
const httpUtils = require('./httpUtils');

const config = require('../config/base')

// const host = config.debug?"http://127.0.0.1:30021":"https://sensilet.com/api"
const host = "https://sensilet.com/api"

apiUtils.getApplicationList = function () {
    return httpUtils.get(`${host}/application_list`)
}
apiUtils.getBsvPrice = function () {

    return httpUtils.get(`${host}/bsv_price`)
}
apiUtils.getTokenPrice = function (genesis) {
    if (genesis)
        return httpUtils.get(`${host}/token_price/${genesis}`)
    else
        return httpUtils.get(`${host}/token_price`)
}
apiUtils.getTokenList = function () {
    return httpUtils.get(`${host}/token_list`)
}
apiUtils.getNftInfoList = function () {
    return httpUtils.get(`${host}/nft_list`)
}

apiUtils.getTokenListVersion = function () {
    return httpUtils.get(`${host}/token_data_version`)
}

apiUtils.getDataVersion = function () {
    return httpUtils.get(`${host}/data_version`)
}

apiUtils.getVersion = function () {
    return httpUtils.get(`${host}/version_and_notice`);
}
apiUtils.getTokenInfo = function (genesis, codehash) {
    return httpUtils.get(`https://api.sensiblequery.com/ft/genesis-info/${codehash}/${genesis}?appid=sensilet`)
}

apiUtils.listNftByGenesis = function (codehash, genesis, address, cursor, size) {
    return httpUtils.get(`https://api.sensiblequery.com/nft/utxo-data/${codehash}/${genesis}/${address}?cursor=${cursor}&size=${size}&appid=sensilet`)
}

apiUtils.GetRawTxById = async function (metaTxId) {
    return httpUtils.get(`https://api.sensiblequery.com/rawtx/${metaTxId}?appid=sensilet`)
}

apiUtils.getRawTx = function (txid) {
    return httpUtils.get(`https://api.whatsonchain.com/v1/bsv/main/tx/${txid}/hex`)
}


module.exports = apiUtils;
