let connectManager = {};
const key = "connectedWallets_v2"

connectManager.connect = function (address,origin) {
    return new Promise((resolve, reject) => {
        try {
            // let {address, sig} = walletManager.signMessage(msg);
            //保存链接记录
            chrome.storage.local.get(key, (result) => {
                let connectedWallets = result[key] || {};

                if (!connectedWallets[address])
                    connectedWallets[address] = {};

                connectedWallets[address][origin] = {
                    address,
                    connectTime: Date.now(),
                    autoApprove: true,
                };
                let setData = {};
                setData[key] = connectedWallets;
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
        chrome.storage.local.get(key, (result) => {

            let connectedWallet = ((result[key] || {})[address] || {})[origin];

            resolve(connectedWallet !== undefined && connectedWallet != null)
        });
    })
}


connectManager.disconnect = function (address,origin) {
    return new Promise(resolve => {

        chrome.storage.local.get(key, (result) => {
            let connectedWallets = result[key] || {};

            if (connectedWallets[address]) {

                delete connectedWallets[address][origin];

                let setData = {};
                setData[key] = connectedWallets;
                chrome.storage.local.set(setData);
            }
            resolve();
        });
    })
};
connectManager.list = function (address) {
    return new Promise(resolve => {

        chrome.storage.local.get(key, (result) => {
            let connectedWallets = result[key] || {}
            if (address)
                resolve(connectedWallets[address] || {});
            else
                resolve(connectedWallets);
        })
    })
};

module.exports = connectManager;
