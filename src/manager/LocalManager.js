let localManager = {};
let bg = chrome.extension.getBackgroundPage();


localManager.refreshLockInfoList = function () {
    _lockInfoList = localStorage.getItem('lockInfoList');
    _lockInfoList = _lockInfoList ? JSON.parse(_lockInfoList) : null;
}
localManager.refreshLockInfoList();


function getIndex() {
    let localInfo = localManager.getCurrentAccount();

    for (let i = 0; i < _lockInfoList.length; i++) {
        if (localInfo.address === _lockInfoList[i].address)
            return i;
    }
    return -1;
}

localManager.getList = function (key) {
    let list = localStorage.getItem(key);
    list = list ? JSON.parse(list) : [];
    return list;
};
localManager.push = function (key, item) {
    let list = localManager.getList(key);
    list.push(item);
    localStorage.setItem(key, JSON.stringify(list))
};


localManager.getCurrentAccount = function () {

    let lockInfo = localStorage.getItem('lockInfo');
    lockInfo = lockInfo ? JSON.parse(lockInfo) : null;

    return lockInfo;
};

localManager.listAccount = function () {
    if (!_lockInfoList) {
        let lockInfo = localManager.getCurrentAccount();
        if (lockInfo) {
            _lockInfoList = [lockInfo];
            localStorage.setItem('lockInfoList', JSON.stringify(_lockInfoList));
            return _lockInfoList;
        }
        return []
    }
    return _lockInfoList;
};

localManager.addAccount = function () {
    localStorage.removeItem("lockInfo");
    bg.passwordAes = "";

};
localManager.chooseAccount = function (accountInfo) {

    localStorage.setItem('lockInfo', JSON.stringify(accountInfo));
    bg.passwordAes = "";
};

localManager.saveAlias = function (accountInfo) {

    for (let i = 0; i < _lockInfoList.length; i++) {
        if (accountInfo.address === _lockInfoList[i].address) {
            _lockInfoList[i].alias = accountInfo.alias;
            break
        }
    }
    localStorage.setItem('lockInfoList', JSON.stringify(_lockInfoList));

    let lockInfo = localManager.getCurrentAccount();

    if (accountInfo.address === lockInfo.address) {
        lockInfo.alias = accountInfo.alias;
        localStorage.setItem('lockInfo', JSON.stringify(lockInfo));
    }
};


localManager.listGenesis = function () {
    let lockInfo = localManager.getCurrentAccount();

    return lockInfo.genesisList || [];
};


localManager.saveGenesis = function (info) {
    let lockInfo = localManager.getCurrentAccount();

    lockInfo.genesisList ? lockInfo.genesisList.push(info) : lockInfo.genesisList = [info];
    setItem('lockInfo', lockInfo);
    _lockInfoList[getIndex()] = lockInfo;
    setItem('lockInfoList', _lockInfoList);
};

localManager.setVersionChecked = function (versionCode) {
    localStorage.setItem('versionCodeChecked', versionCode)
}
localManager.getVersionChecked = function () {
    let code = localStorage.getItem('versionCodeChecked')
    if (code)
        return parseInt(code)
    else
        return 0;
}


localManager.setSettingChecked = function () {
    localStorage.setItem('isSettingChecked','yes')
}
localManager.isSettingChecked = function () {
    let str = localStorage.getItem('isSettingChecked')
    // console.log(str)
    return str && str === 'yes';
}


localManager.isAddressRegistered = function (address) {
    let list = localStorage.getItem('registeredAddress')
    if(!list)
        return false
    list = JSON.parse(list)
    return list.indexOf(address) > -1;
}

localManager.setAddressRegistered = function (address) {
    let list = localStorage.getItem('registeredAddress')
    if(!list)
        list = '[]'
    list = JSON.parse(list)
    if(list.indexOf(address)<0){
        list.push(address);
        localStorage.setItem('registeredAddress',JSON.stringify(list))
    }
}
localManager.getShowTokenType = function (){
    return localStorage.getItem('showTokenType') || 'mine'
}
localManager.setShowTokenType = function (type){
    localStorage.setItem('showTokenType',type)
}

function getObjItem(key) {
    let temp = localStorage.getItem(key);
    return temp ? JSON.parse(temp) : null;
}

function setItem(key, value) {
    if (typeof value === 'object')
        value = JSON.stringify(value);
    localStorage.setItem(key, value)
}

module.exports = localManager;
