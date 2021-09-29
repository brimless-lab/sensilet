let localManager = {};
let bg = chrome.extension.getBackgroundPage();

let _lockInfo = localStorage.getItem('lockInfo');
_lockInfo = _lockInfo ? JSON.parse(_lockInfo) : null;
let _lockInfoList = null;


localManager.refreshLockInfoList = function (){
    _lockInfoList = localStorage.getItem('lockInfoList');
    _lockInfoList = _lockInfoList ? JSON.parse(_lockInfoList) : null;
}
localManager.refreshLockInfoList();

let _index = -1;

function getIndex() {
    if (_index > 0)
        return _index;
    for (let i = 0; i < _lockInfoList.length; i++) {
        if (_lockInfo.address === _lockInfoList[i].address)
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
    if (!_lockInfo) {
        _lockInfo = localStorage.getItem('lockInfo');
        _lockInfo = _lockInfo ? JSON.parse(_lockInfo) : null;
    }
    return _lockInfo;
};

localManager.listAccount = function () {
    if (!_lockInfoList) {
        if (_lockInfo) {
            _lockInfoList = [_lockInfo];
            localStorage.setItem('lockInfoList', JSON.stringify(_lockInfoList));
            return _lockInfoList;
        }
        return []
    }
    return _lockInfoList;
};

localManager.addAccount = function () {
    _lockInfo = null;
    localStorage.removeItem("lockInfo");
    bg.passwordAes = "";

};
localManager.chooseAccount = function (accountInfo) {
    _lockInfo = accountInfo;
    localStorage.setItem('lockInfo', JSON.stringify(_lockInfo));
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

    if (accountInfo.address === _lockInfo.address) {
        _lockInfo.alias = accountInfo.alias;
        localStorage.setItem('lockInfo', JSON.stringify(_lockInfo));
    }
};


localManager.listGenesis = function () {
    return _lockInfo.genesisList || [];
};


localManager.saveGenesis = function (info) {
    _lockInfo.genesisList ? _lockInfo.genesisList.push(info) : _lockInfo.genesisList = [info];
    setItem('lockInfo', _lockInfo);
    _lockInfoList[getIndex()] = _lockInfo;
    setItem('lockInfoList', _lockInfoList);
};

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
