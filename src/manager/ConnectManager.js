let connectManager = {};


// const key =

function getKey(){
    return config.isTestnet?"connectedWallets_testnet" :"connectedWallets_v2";
}

connectManager.connect = function (address,origin) {
    return new Promise((resolve, reject) => {
        try {
            // let {address, sig} = walletManager.signMessage(msg);
            //保存链接记录
            chrome.storage.local.get(getKey(), (result) => {
                let connectedWallets = result[getKey()] || {};

                if (!connectedWallets[address])
                    connectedWallets[address] = {};

                connectedWallets[address][origin] = {
                    address,
                    connectTime: Date.now(),
                    autoApprove: true,
                };
                let setData = {};
                setData[getKey()] = connectedWallets;
                chrome.storage.local.set(setData);

                resolve(address)
            });
        } catch (e) {
            reject(e)
        }
    })
};
connectManager.isConnected = function(address,origin){
    return new Promise(resolve => {
        chrome.storage.local.get(getKey(), (result) => {

            let connectedWallet = ((result[getKey()] || {})[address] || {})[origin];
            // console.log(connectedWallet,address,origin,'###')
            resolve(connectedWallet !== undefined && connectedWallet != null)
        });
    })
}


connectManager.disconnect = function (address,origin,notify=false) {
    return new Promise(resolve => {

        chrome.storage.local.get(getKey(), (result) => {
            let connectedWallets = result[getKey()] || {};

            if (connectedWallets[address]) {

                delete connectedWallets[address][origin];

                let setData = {};
                setData[getKey()] = connectedWallets;
                chrome.storage.local.set(setData);
            }
            if(notify)
                eventManager.dispatchDisconnect({address,origin})
            resolve();
        });
    })
};
connectManager.list = function (address) {
    return new Promise(resolve => {

        chrome.storage.local.get(getKey(), (result) => {

            let connectedWallets = result[getKey()] || {}
            console.log(result,connectedWallets,address)
            if (address)
                resolve(connectedWallets[address] || {});
            else
                resolve(connectedWallets);
        })
    })
};

module.exports = connectManager;
