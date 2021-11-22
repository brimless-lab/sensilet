let apiUtils = {};
const httpUtils = require('./httpUtils');

apiUtils.getApplicationList = function () {
    return httpUtils.get('https://sensilet.com/api/application_list')
}
apiUtils.getBsvPrice = function () {
    if (config.debug)
        return httpUtils.get('http://127.0.0.1:30021/bsv_price')
    return httpUtils.get('https://sensilet.com/api/bsv_price')
}
apiUtils.getTokenPrice = function () {
    if (config.debug)
        return httpUtils.get('http://127.0.0.1:30021/token_price')
    return httpUtils.get('https://sensilet.com/api/token_price')
}


apiUtils.getVersion = function () {
    return httpUtils.get('https://sensilet.com/api/version_and_notice');
}
apiUtils.getTokenInfo = function (genesis, codehash) {
    return httpUtils.get(`https://api.sensiblequery.com/ft/genesis-info/${codehash}/${genesis}`)
}

module.exports = apiUtils;
