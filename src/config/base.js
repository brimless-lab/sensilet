let config = {
    network:"mainnet",
    walletName:"Sensilet",
    version:"0.1.6",
    versionCode:7,
    path:"m/44'/0'/0'",
    debug:true,
};
console.log('init config');

//脚本执行顺序有点问题，这里先加上global
global.config = config;
module.exports =config;
