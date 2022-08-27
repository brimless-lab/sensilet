let config = {
    network: "mainnet",
    walletName: "Sensilet",
    version: "0.1.15",
    versionCode: 15,
    path: "m/44'/0'/0'",
    decimal: 8,
    fixed: 8,
    debug: false,
    fee: 0.05,
    host: "https://sensilet.com/api",
    sensibleUrl: "https://api.sensiblequery.com",
    // sensibleUrl:"https://api.sensiblequery.com/test",
    needMerge:20,
};

config.configNetwork = function () {
    if (localStorage.getItem('network') === 'testnet') {
        //测试网
        config.network = "testnet";
        config.sensibleUrl = "https://api.sensiblequery.com/test"
        config.hostFix = '_testnet'
        config.isTestnet = true;
    } else {
        //主网
        config.network = "mainnet";
        config.sensibleUrl = "https://api.sensiblequery.com";
        config.hostFix = ''
        config.isTestnet = false;
    }
}

config.configNetwork();

console.log('init config');


//脚本执行顺序有点问题，这里先加上global
global.config = config;
module.exports = config;
