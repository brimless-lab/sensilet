let config = {
    network:"mainnet",
    walletName:"Sensilet",
    version:"0.1.14",
    versionCode:14,
    path:"m/44'/0'/0'",
    decimal:8,
    fixed:8,
    debug:false,
    fee:0.05,
    host :"https://sensilet.com/api",
    sensibleUrl:"https://api.sensiblequery.com",
    // sensibleUrl:"https://test-bsv1-sq-api.playonchain.net",
};
console.log('init config');

if(localStorage.getItem('network')==='testnet'){
    config.network = "testnet";
    config.sensibleUrl = "https://test-bsv1-sq-api.playonchain.net"
}

//脚本执行顺序有点问题，这里先加上global
global.config = config;
module.exports =config;
