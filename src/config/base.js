let config = {
    network:"mainnet",
    walletName:"Sensilet",
    version:"0.1.12",
    versionCode:3,

};
console.log('init config');

//脚本执行顺序有点问题，这里先加上global
global.config = config;
module.exports =config;
