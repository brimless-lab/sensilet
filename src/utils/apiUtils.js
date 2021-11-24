let apiUtils = {};
const httpUtils = require('./httpUtils');

const config = require('../config/base')

const host = config.debug?"http://127.0.0.1:30021":"https://sensilet.com/api"

apiUtils.getApplicationList = function () {
    return httpUtils.get(`${host}/application_list`)
}
apiUtils.getBsvPrice = function () {

    return httpUtils.get(`${host}/bsv_price`)
}
apiUtils.getTokenPrice = function () {
    return httpUtils.get(`${host}/token_price`)
}
apiUtils.getTokenList = function () {
    return httpUtils.get(`${host}/token_list`)
}

apiUtils.getTokenListVersion = function () {
    return httpUtils.get(`${host}/token_data_version`)
}

apiUtils.getVersion = function () {
    return httpUtils.get(`${host}/version_and_notice`);
}
apiUtils.getTokenInfo = function (genesis, codehash) {
    return httpUtils.get(`https://api.sensiblequery.com/ft/genesis-info/${codehash}/${genesis}`)
}

module.exports = apiUtils;
