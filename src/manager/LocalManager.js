let localManager = {};


localManager.refreshLockInfoList = function () {
    // _lockInfoList = localStorage.getItem('lockInfoList');
    // _lockInfoList = _lockInfoList ? JSON.parse(_lockInfoList) : null;
}

// localManager.refreshLockInfoList();
function getIndex() {
    let localInfo = localManager.getCurrentAccount();
    let lockInfoList = localManager.listAccount();
    for (let i = 0; i < lockInfoList.length; i++) {
        if (localInfo.locked === lockInfoList[i].locked)
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

    let lockInfoList = localStorage.getItem('lockInfoList');
    lockInfoList = lockInfoList ? JSON.parse(lockInfoList) : null;

    return lockInfoList;
};

localManager.saveAccountList = function (lockInfoList) {
    localStorage.setItem('lockInfoList', JSON.stringify(lockInfoList));
};

localManager.removeAccount = function () {
    localStorage.removeItem("lockInfo");
};
localManager.chooseAccount = function (accountInfo) {

    localStorage.setItem('lockInfo', JSON.stringify(accountInfo));
};

localManager.saveAlias = function (accountInfo) {
    let lockInfoList = localManager.listAccount()
    for (let i = 0; i < lockInfoList.length; i++) {
        if (accountInfo.locked === lockInfoList[i].locked) {
            lockInfoList[i].alias = accountInfo.alias;
            break
        }
    }
    localStorage.setItem('lockInfoList', JSON.stringify(lockInfoList));

    let lockInfo = localManager.getCurrentAccount();

    if (lockInfo && accountInfo.locked === lockInfo.locked) {
        lockInfo['alias'] = accountInfo.alias;
        localStorage.setItem('lockInfo', JSON.stringify(lockInfo));
    }
};

localManager.saveAccount = function (accountInfo) {
    let lockInfoList = localManager.listAccount()
    for (let i = 0; i < lockInfoList.length; i++) {
        if (accountInfo.locked === lockInfoList[i].locked) {
            lockInfoList[i] = accountInfo;
            break
        }
    }
    localStorage.setItem('lockInfoList', JSON.stringify(lockInfoList));

    let lockInfo = localManager.getCurrentAccount();

    if (lockInfo && accountInfo.locked === lockInfo.locked) {
        lockInfo = accountInfo;
        localStorage.setItem('lockInfo', JSON.stringify(lockInfo));
    }
};


localManager.listGenesis = function () {
    let lockInfo = localManager.getCurrentAccount();

    return lockInfo.genesisList || [];
};


localManager.saveGenesis = function (info) {
    let lockInfo = localManager.getCurrentAccount();

    if (lockInfo.genesisList) {
        lockInfo.genesisList.push(info)
    } else {
        lockInfo['genesisList'] = [info]
    }

    setItem('lockInfo', lockInfo);
    let lockInfoList = localManager.listAccount()
    lockInfoList[getIndex()] = lockInfo;
    setItem('lockInfoList', lockInfoList);
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
    localStorage.setItem('isSettingChecked', 'yes')
}
localManager.isSettingChecked = function () {
    let str = localStorage.getItem('isSettingChecked')
    // console.log(str)
    return str && str === 'yes';
}


localManager.isAddressRegistered = function (address) {
    let list = localStorage.getItem('registeredAddress')
    if (!list)
        return false
    list = JSON.parse(list)
    return list.indexOf(address) > -1;
}

localManager.setAddressRegistered = function (address) {
    let list = localStorage.getItem('registeredAddress')
    if (!list)
        list = '[]'
    list = JSON.parse(list)
    if (list.indexOf(address) < 0) {
        list.push(address);
        localStorage.setItem('registeredAddress', JSON.stringify(list))
    }
}
localManager.getShowTokenType = function () {
    return localStorage.getItem('showTokenType') || 'added'
}
localManager.setShowTokenType = function (type) {
    localStorage.setItem('showTokenType', type)
}

localManager.setAllTokenTable = function (data, version) {
    setItem('allTokenTable', data)
    setItem('tokenVersion', version)
}

localManager.getAllTokenTable = function () {
    return getObjItem("allTokenTable")
}
localManager.getTokenTableVersion = function () {
    let temp = localStorage.getItem("tokenVersion");
    return temp ? (isNaN(temp) ? 0 : parseInt(temp)) : 0;
}

localManager.getNftDataVersion = function () {
    let temp = localStorage.getItem("nftDataVersion");
    return temp ? (isNaN(temp) ? 0 : parseInt(temp)) : 0;
}

localManager.setNftInfoTable = function (data, version) {
    setItem('nftInfoTable', data)
    setItem('nftDataVersion', version)
}
localManager.getNftInfoTable = function () {
    return getObjItem('nftInfoTable')
}

localManager.getRecentAddress = function () {
    let temp = localStorage.getItem('recentAddress'+config.hostFix)
    return temp ? JSON.parse(temp) : [];
}
localManager.addRecentAddress = function (address, tag, alias = "") {
    let temp = localManager.getRecentAddress();
    let index = temp.findIndex((item => item.address === address));

    if (index > -1) {
        //    如果已经存在，移到开头
        let target = (temp.splice(index, 1))[0]
        target.timestamp = Date.now();
        if (!target.tags)
            target.tags = []
        if (target.tags.indexOf(tag) < 0) {
            target.tags.push[tag]
        }
        temp.unshift(target)
    } else {
        temp.unshift({
            address,
            alias,
            timestamp: Date.now(),
            tags: [tag]
        })
    }
    localStorage.setItem('recentAddress'+config.hostFix, JSON.stringify(temp))

}
localManager.clearRecentAddress = function () {
    localStorage.removeItem('recentAddress')
}

localManager.getNftInfoCache = function (key) {
    let nftInfo = getObjItem('unknown_nft_cache')
    return nftInfo && nftInfo[key]
}
localManager.saveNftInfoCache = function (key, data) {
    let nftInfo = getObjItem('unknown_nft_cache') || {};
    nftInfo[key] = data;

    setItem("unknown_nft_cache", nftInfo)

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
