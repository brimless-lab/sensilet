let eventManager = {}

eventManager.dispatchAccountChange = function (data){
    chrome.runtime.sendMessage({
        channel: 'sato_extension_background_event_channel',
        eventName:"account_change",
        data,
    });
}

eventManager.dispatchDisconnect = function (data){
    chrome.runtime.sendMessage({
        channel: 'sato_extension_background_event_channel',
        eventName:"disconnect",
        data,
    });
}

eventManager.dispatchNetworkChange = function (data){
    chrome.runtime.sendMessage({
        channel: 'sato_extension_background_event_channel',
        eventName:"network_change",
        data,
    });
}

module.exports = eventManager;
