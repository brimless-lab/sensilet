let config = {
    network:"mainnet",
    walletName:"Sensilet",
    version:"0.1.13",
    versionCode:13,
    path:"m/44'/0'/0'",
    debug:false,
    host :"https://sensilet.com/api",
    sensibleUrl:"https://api.sensiblequery.com",
    // sensibleUrl:"https://test-bsv1-sq-api.playonchain.net",
};
console.log('init config');

//脚本执行顺序有点问题，这里先加上global
global.config = config;
module.exports =config;
