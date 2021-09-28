let manager = {};

manager.connect = function (origin, msg = "") {
    return new Promise((resolve, reject) => {
        try {
            // let {address, sig} = walletManager.signMessage(msg);
            let address = walletManager.getMainAddress();
            //保存链接记录
            chrome.storage.local.get('connectedWallets', (result) => {
                let connectedWallets = result.connectedWallets || {};

                connectedWallets[origin] = {
                    address,
                    autoApprove: true,
                };
                chrome.storage.local.set({connectedWallets});

                resolve(address)
            });
        } catch (e) {
            reject(e)
        }
    })

};

manager.disconnect = function (origin) {
    chrome.storage.local.get('connectedWallets', (result) => {
        let connectedWallets = result.connectedWallets || {};

        delete connectedWallets[origin];

        chrome.storage.local.set({connectedWallets});
    });
};
manager.list = function () {
    chrome.storage.local.get('connectedWallets', (result) => {
        return result.connectedWallets || {};
    })
};

module.exports = manager;
