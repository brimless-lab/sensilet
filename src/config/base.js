let config = {
    network:"mainnet",
    walletName:"Sensilet",
    version:"0.0.1",
    versionCode:1,

};
console.log('init config');

//脚本执行顺序有点问题，这里先加上global
global.config = config;
module.exports =config;
