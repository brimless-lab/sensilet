let config = {
    network:"mainnet",
    walletName:"Sensilet",
    version:"0.1.3",
    versionCode:4,
    path:"m/44'/0'/0'",

};
console.log('init config');

//脚本执行顺序有点问题，这里先加上global
global.config = config;
module.exports =config;
