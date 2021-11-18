const responseHandlers = new Map();
const eventHandlers = {};
const sensibleSdk = require("sensible-sdk");

require('./utils/globalUtils')
require('./config/errorCode')
const walletManager = require("./manager/WalletManager");
const tokenManager = require("./manager/tokenManager");

const bsv = require('bsv');
window.bsv = bsv;
window.sensibleSdk = sensibleSdk;
window.walletManager = walletManager;
window.tokenManager = tokenManager;
const SensibleNFTObj = new sensibleSdk.SensibleNFT({
    network: "mainnet", //mainnet or testnet
    feeb: 0.5,
    // signers
});

browser.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
        window.open('/popup.html')
    }
    if (details.reason === 'update') {
        // 更新事件
        // alert("已更新")
    }
});

async function launchPopup(message, sender, sendResponse, checkConnected = true) {
    if (checkConnected && !await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    console.log(sender)


    const searchParams = new URLSearchParams();
    searchParams.set('origin', sender.origin);
    searchParams.set('network', message.data.params.network);
    searchParams.set('request', JSON.stringify(message.data));

    // TODO consolidate popup dimensions
    chrome.windows.getLastFocused((focusedWindow) => {
        chrome.windows.create({
            url: 'popup.html#' + searchParams.toString(),
            type: 'popup',
            width: 375,
            height: 625,
            top: focusedWindow.top,
            left: focusedWindow.left + (focusedWindow.width - 375),
            setSelfAsOpener: true,
            focused: true,
        });
    });
    responseHandlers.set(message.data.id, sendResponse);
}

function checkConnect(sender) {
    return new Promise((resolve => {
        chrome.storage.local.get('connectedWallets', (result) => {
            const connectedWallet = (result.connectedWallets || {})[sender.origin];
            resolve(connectedWallet !== undefined && connectedWallet != null)
        });
    }))
}

function handleConnect(message, sender, sendResponse) {
    // launchPopup(message, sender, sendResponse);
    chrome.storage.local.get('connectedWallets', (result) => {
        const connectedWallet = (result.connectedWallets || {})[sender.origin];
        if (!connectedWallet) {
            launchPopup(message, sender, sendResponse, false);
        } else {
            // 对于已经连接过的， 直接返回
            console.log(message.data);
            sendResponse({
                result: "success",
                id: message.data.id,
                data: walletManager.getMainAddress()
            });
        }
    });
}

function handleDisconnect(message, sender, sendResponse) {
    chrome.storage.local.get('connectedWallets', (result) => {
        delete result.connectedWallets[sender.origin];
        chrome.storage.local.set(
            {connectedWallets: result.connectedWallets},
            () => sendResponse({result: "success", id: message.data.id}),
        );
    });
}

async function handleListGenesis(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        sendResponse({
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
        sendResponse({
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
        sendResponse({
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
        sendResponse({
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
        sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    let {} = message.data.params;
    let tokenList = await tokenManager.listUserTokens();
    sendResponse({
        id: message.data.id,
        data: tokenList,
        result: "success"
    })
}

async function handleCheckTokenUtxo(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }

    let {genesis, codehash} = message.data.params;
    let utxoCount = await tokenManager.sensibleFt.getUtxoCount(genesis, codehash, walletManager.getMainAddress());
    // console.log(utxoCount)

    let bsvUtxoCount = await walletManager.getBsvUtxoCount();

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
        sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    let {} = message.data.params;
    sendResponse({
        id: message.data.id,
        data: walletManager.getMainAddress(),
        result: "success"
    })
}

async function handleGetPublicKey(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }

    let {} = message.data.params;
    sendResponse({
        id: message.data.id,
        data: walletManager.getMainPubKey(),
        result: "success"
    })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message, "onMessage");

    if (message.channel === 'sato_contentscript_background_channel') {
        if (message.data.method === 'addEvent') {
            let eventName = message.data.detail;
            if (!eventHandlers[eventName])
                eventHandlers[eventName] = [];
            console.log(message.data.id,eventName, '###')
            eventHandlers[eventName].push({
                id: message.data.id,
                tabId:sender.tab.id
            })

        } else if (message.data.method === 'removeEvent') {
            let eventName = message.data.detail;
            if (!eventHandlers[eventName])
                return false
            eventHandlers[eventName] = eventHandlers[eventName].filter(item=>item.id!==message.data.id)
        } else if (message.data.method === 'connect') {
            handleConnect(message, sender, sendResponse);
        } else if (message.data.method === 'listGenesis') {
            handleListGenesis(message, sender, sendResponse);
        } else if (message.data.method === 'listNft') {
            handleListNft(message, sender, sendResponse);
        } else if (message.data.method === 'disConnect') {
            handleDisconnect(message, sender, sendResponse);
        } else if (message.data.method === 'isConnect') {
            handleIsConnect(message, sender, sendResponse);
        } else if (message.data.method === 'getBsvBalance') {
            handleGetBsvBalance(message, sender, sendResponse);
        } else if (message.data.method === 'getTokenBalance') {
            handleGetTokenBalance(message, sender, sendResponse);
        } else if (message.data.method === 'checkTokenUtxoCount') {
            handleCheckTokenUtxo(message, sender, sendResponse);
        } else if (message.data.method === 'getAddress') {
            handleGetAddress(message, sender, sendResponse);
        } else if (message.data.method === 'getPublicKey') {
            handleGetPublicKey(message, sender, sendResponse);
        } else {
            launchPopup(message, sender, sendResponse);
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
        console.log(eventHandlers[eventName])
        if (eventHandlers[eventName]) {
            for (let i = 0; i < eventHandlers[eventName].length; i++) {
                let {tabId, id} = eventHandlers[eventName][i]
                chrome.tabs.sendMessage(tabId,{
                    channel:"sato_background_event_channel",
                    id,
                    data:message.data
                })
            }
        }

    }
})
;
