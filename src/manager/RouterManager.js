let routerManager = {
    // current:"/"
};

let listener = [];

let current = "/";
let last = "/";

const pageConfigs = {
    '/': {
        needCreate: false,
        needUnlock: false,
    },
    '/unlock': {
        needCreate: true,
        needUnlock: false,
    },
    '/account': {
        needCreate: true,
        needUnlock: true,
    },
    '/connect': {
        needCreate: true,
        needUnlock: true,
    },
    '/issue': {
        needCreate: true,
        needUnlock: true,
    },
    '/genesis': {
        needCreate: true,
        needUnlock: true,
    },
    '/pay': {
        needCreate: true,
        needUnlock: true,
    },
    '/transferNft': {
        needCreate: true,
        needUnlock: true,
    },
    '/payToken': {
        needCreate: true,
        needUnlock: true,
    },
    '/signTx': {
        needCreate: true,
        needUnlock: true,
    },
    '/merge': {
        needCreate: true,
        needUnlock: true,
    },
    '/signMsg': {
        needCreate: true,
        needUnlock: true,
    },
    '/export': {
        needCreate: true,
        needUnlock: true,
    },

};

routerManager.init = function () {
    routerManager.goto('/');
    return current;
};
routerManager.getCurrentPage = function () {
    return current;
};
routerManager.addListener = function (event) {
    listener.push(event);
};
routerManager.data = null;
routerManager.goto = function (url, data) {
    //修改链接上的参数显示
    let needGoto = url;
    let pageConfig = pageConfigs[url];
    if (pageConfig) {
        if (pageConfig.needCreate && !walletManager.isMnemonicCreate()) {
            needGoto = '/'
        } else if (pageConfig.needUnlock && walletManager.isNeedUnlock()) {
            needGoto = '/unlock'
        }
    }

    if (url !== needGoto) {
        sessionStorage.setItem('go_for_url', url);
        if (data)
            sessionStorage.setItem('go_for_url_data', JSON.stringify(data))
    }

    routerManager.data = data;
    last = current;
    current = needGoto;

    for (let i = 0; i < listener.length; i++) {
        listener[i](current);
    }
};

routerManager.gotoHome = function () {
    history.pushState(null, null, location.pathname);
    routerManager.goto('/')
}

routerManager.goBack = function () {
    routerManager.goto(last);
}

module.exports = routerManager;
