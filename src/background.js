const responseHandlers = new Map();
const eventHandlers = {};
const sensibleSdk = require("sensible-sdk");

require('./utils/globalUtils')
require('./config/errorCode')
const config = require('./config/base')
const walletManager = require("./manager/WalletManager");
const tokenManager = require("./manager/tokenManager");
const connectManager = require('./manager/ConnectManager');

const indexedDBUtils = require('./utils/IndexedDBUtils');
indexedDBUtils.link();

const bsvOrigin = require('bsv');
window.bsvOrigin = bsvOrigin;
const Testnet = {}
Object.keys(bsvOrigin).forEach(function (key) {
    Testnet[key] = bsvOrigin[key].Testnet
        ? bsvOrigin[key].Testnet
        : bsvOrigin[key]
})

if (config.network === 'testnet') { //替换为测试网对象
    window.bsv = Testnet;

    window.bsv.changePrivateKeyNetwork = (mainnetWif) => {
        const br = bsvOrigin.PrivKey.fromWif(mainnetWif).toBuffer()
        br[0] = 0xef;
        return bsv.PrivKey.fromBuffer(
            br
        ).toWif();
    }
} else {
    window.bsv = bsvOrigin;
    window.bsvOrigin = Testnet;

    window.bsv.changePrivateKeyNetwork = (mainnetWif) => {
        const br = Testnet.PrivKey.fromWif(mainnetWif).toBuffer()
        br[0] = 0x80;
        return bsv.PrivKey.fromBuffer(
            br
        ).toWif();
    }
}
// console.log(window.bsv)

window.config = config;
window.sensibleSdk = sensibleSdk;
window.walletManager = walletManager;
window.tokenManager = tokenManager;
window.indexedDBUtils = indexedDBUtils;

window.passwordAesTable = {};

//触发一次
try {
    walletManager.isNeedUnlock();
} catch (e) {
    // console.error(e)
}

const SensibleNFTObj = new sensibleSdk.SensibleNFT({
    network: config.network, //mainnet or testnet
    feeb: config.fee,
    // signers
});

browser.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
        window.open('/popup.html')
    }
    if (details.reason === 'update') {
        // 更新事件
        //处理一个图片错误
        tokenManager.fixPic();
    }
});


async function createHandler(message, sender, sendResponse, handler) {
    try {
        await handler(message, sender, sendResponse);
    } catch (e) {
        sendResponse({
            id: message.data.id,
            msg: e && e.message || e,
            result: "fail"
        })
    }
}

async function launchPopup(message, sender, sendResponse, checkConnected = true) {
    if (checkConnected && !await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    // console.log(sender)

    if (message.data.method === 'signTx') {      //对于signTX，其参数可能过大(>10M)而不适合放在连接上，通过内存直接传递
        window.signTxList = message.data.params.list;
        message.data.params.list = []
    }

    const searchParams = new URLSearchParams();
    searchParams.set('origin', sender.origin);
    searchParams.set('network', message.data.params.network);
    searchParams.set('request', JSON.stringify(message.data));

    // TODO consolidate popup dimensions
    chrome.windows.getLastFocused((focusedWindow) => {
        chrome.windows.create({
            url: 'popup.html#' + searchParams.toString(),
            type: 'popup',
            width: 391,
            height: 640,
            top: focusedWindow.top,
            left: focusedWindow.left + (focusedWindow.width - 391),
            setSelfAsOpener: true,
            focused: true,
        });
    });
    responseHandlers.set(message.data.id, sendResponse);
}

async function checkConnect(sender) {
    let address = walletManager.getMainAddress();
    return connectManager.isConnected(address, sender.origin)
}

async function handleConnect(message, sender, sendResponse) {
    let address = walletManager.getMainAddress();
    if (await connectManager.isConnected(address, sender.origin)) {
        sendResponse({
            result: "success",
            id: message.data.id,
            data: address
        });

    } else
        return launchPopup(message, sender, sendResponse, false);

}

async function handleDisconnect(message, sender, sendResponse) {
    let address = walletManager.getMainAddress();

    await connectManager.disconnect(address, sender.origin)
    sendResponse({result: "success", id: message.data.id})
}

async function handleGetVersion(message, sender, sendResponse) {

    sendResponse({
        result: "success", data: {
            version: config.version,
            versionCode: config.versionCode,
        }, id: message.data.id
    })
}

async function handleIsHDAccount(message, sender, sendResponse) {

    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }

    let mode = walletManager.getAccountMode();
    sendResponse({result: "success", data: mode === 'account.mode_HD', id: message.data.id})
}

async function handleListGenesis(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }

    let address = message.data.params.address;
    let data = await SensibleNFTObj.getSummary(address);
    sendResponse({
        id: message.data.id,
        data,
        result: "success"
    })
}

async function handleIsConnect(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "success",
            id: message.data.id,
            data: false
        });
    } else
        sendResponse({
            result: "success",
            id: message.data.id,
            data: true
        });
}

async function handleListNft(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    let {address, genesis, codehash} = message.data.params;
    let data = await SensibleNFTObj.getSummaryDetail(codehash, genesis, address);
    sendResponse({
        id: message.data.id,
        data,
        result: "success"
    })
}

async function handleGetBsvBalance(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }

    let {} = message.data.params;
    let address = walletManager.getMainAddress();
    let balance = await walletManager.getBsvBalance(address)
    sendResponse({
        id: message.data.id,
        data: {
            address,
            balance
        },
        result: "success"
    })
}

async function handleGetTokenBalance(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    let {} = message.data.params;
    let tokenList = await tokenManager.listUserTokens(true);
    sendResponse({
        id: message.data.id,
        data: tokenList,
        result: "success"
    })
}

async function handleCheckTokenUtxo(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }

    let {genesis, codehash} = message.data.params;
    let utxoCount = await tokenManager.sensibleFt.getUtxoCount(genesis, codehash, walletManager.getMainAddress());


    let bsvUtxoCount = await walletManager.getBsvUtxoCount();
    // console.log(utxoCount, bsvUtxoCount, 'utxo check')
    if (utxoCount < 20 && bsvUtxoCount <= 3) {
        sendResponse({
            id: message.data.id,
            result: "success",
            data: true,
        })
    } else {
        launchPopup(message, sender, sendResponse)
    }
}


async function handleGetAddress(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }

    let {path} = message.data.params;
    sendResponse({
        id: message.data.id,
        data: path ? walletManager.getAddress(path) : walletManager.getMainAddress(),
        result: "success"
    })
}

async function handleGetPublicKey(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }

    let {path} = message.data.params;
    sendResponse({
        id: message.data.id,
        data: path ? walletManager.getPubKey(path) : walletManager.getMainPubKey(),
        result: "success"
    })

}


async function handleGetPublicKeyAndAddress(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    if (walletManager.isSinglePrivateKey()) {
        return sendResponse({
            result: "fail",
            id: message.data.id,
            msg: "User account is single private key mode"
        });
    }
    // console.log('hdPath', message)
    let {hdPath} = message.data.params;
    sendResponse({
        id: message.data.id,
        data: walletManager.getPublicKeyAndAddress(hdPath),
        result: "success"
    })
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.log(message, sender.origin, "onMessage");

    if (message.channel === 'sato_contentscript_background_channel') {
        if (message.data.method === 'addEvent') {
            let eventName = message.data.detail;
            if (!eventHandlers[eventName])
                eventHandlers[eventName] = [];
            // console.log(message.data.id, eventName, '###')
            eventHandlers[eventName].push({
                id: message.data.id,
                tabId: sender.tab.id,
                origin: sender.origin,
            })

        } else if (message.data.method === 'removeEvent') {
            let eventName = message.data.detail;
            if (!eventHandlers[eventName])
                return false
            eventHandlers[eventName] = eventHandlers[eventName].filter(item => item.id !== message.data.id)
        } else if (message.data.method === 'connect') {
            createHandler(message, sender, sendResponse, handleConnect);
        } else if (message.data.method === 'listGenesis') {
            createHandler(message, sender, sendResponse, handleListGenesis);
        } else if (message.data.method === 'listNft') {
            createHandler(message, sender, sendResponse, handleListNft);
        } else if (message.data.method === 'disConnect') {
            createHandler(message, sender, sendResponse, handleDisconnect);
        } else if (message.data.method === 'isConnect') {
            createHandler(message, sender, sendResponse, handleIsConnect);
        } else if (message.data.method === 'getBsvBalance') {
            createHandler(message, sender, sendResponse, handleGetBsvBalance);
        } else if (message.data.method === 'getTokenBalance') {
            createHandler(message, sender, sendResponse, handleGetTokenBalance);
        } else if (message.data.method === 'checkTokenUtxoCount') {
            createHandler(message, sender, sendResponse, handleCheckTokenUtxo);
        } else if (message.data.method === 'getAddress') {
            createHandler(message, sender, sendResponse, handleGetAddress);
        } else if (message.data.method === 'getPublicKey') {
            createHandler(message, sender, sendResponse, handleGetPublicKey);
        } else if (message.data.method === 'getPublicKeyAndAddress') {
            createHandler(message, sender, sendResponse, handleGetPublicKeyAndAddress);
        } else if (message.data.method === 'getVersion') {
            createHandler(message, sender, sendResponse, handleGetVersion);
        } else if (message.data.method === 'isHDAccount') {
            createHandler(message, sender, sendResponse, handleIsHDAccount);
        } else {
            createHandler(message, sender, sendResponse, launchPopup);
        }
        // keeps response channel open
        return true;
    } else if (message.channel === 'sato_extension_background_channel') {
        const responseHandler = responseHandlers.get(message.data.id);
        if (responseHandler) {
            responseHandlers.delete(message.data.id);
            responseHandler(message.data);
        }
    } else if (message.channel === 'sato_extension_background_event_channel') {
        //    事件通道
        let eventName = message.eventName;
        // console.log(eventHandlers[eventName],'###')
        if (eventHandlers[eventName]) {
            for (let i = 0; i < eventHandlers[eventName].length; i++) {
                let {tabId, id, origin} = eventHandlers[eventName][i]
                if (!message.data || !message.data.origin || origin === message.data.origin) { //如果传了origin，则需要相等
                    // console.log('aaa')
                    chrome.tabs.sendMessage(tabId, {
                        channel: "sato_background_event_channel",
                        id,
                        data: message.data
                    })
                }
            }
        }

    }
})
;
