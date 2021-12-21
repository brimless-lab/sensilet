let routerManager = {
    // current:"/"
};

let listener = [];

let current = "/";
let last = "/";

const pageConfigs = {
    '/create': {
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
    '/nftList': {
        needCreate: true,
        needUnlock: true,
    },
    '/signTransaction': {
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
    if (config.debug)
        console.log('goto', url)
    //修改链接上的参数显示
    let needGoto = url;
    let pageConfig = pageConfigs[url];
    if (pageConfig) {
        if (pageConfig.needCreate && !walletManager.isMnemonicCreate()) {
            needGoto = '/create'
        } else if (pageConfig.needUnlock && walletManager.isNeedUnlock()) {
            needGoto = '/unlock'
        }
    }

    if (url !== needGoto) {
        sessionStorage.setItem('go_for_url', url);
        if (data)
            sessionStorage.setItem('go_for_url_data', JSON.stringify(data))
    }
    if (config && config.debug) {
        localStorage.setItem('debug_need_goto', needGoto)
        localStorage.setItem('debug_need_goto_data', JSON.stringify(data||{}))
    }

    routerManager.data = data;
    last = current;
    current = needGoto;

    for (let i = 0; i < listener.length; i++) {
        listener[i](current);
    }
};
let goForUrl = '/account'
let goForData = null
routerManager.goFor = function (url, forUrl, data) {
    goForUrl = forUrl;
    goForData = data;
    routerManager.goto(url, data)
}
routerManager.goNext = function () {
    if (goForUrl !== '/account') {
        routerManager.goto(goForUrl, goForData)
    } else
        routerManager.gotoHome();
}

routerManager.gotoHome = function () {
    history.pushState(null, null, location.pathname);
    goForUrl = '/account'
    goForData = null
    routerManager.goto('/account')
}

routerManager.goBack = function () {
    routerManager.goto(last);
}

routerManager.gotoDebug = function () {
    let needGoto = localStorage.getItem('debug_need_goto')
    if(needGoto)
        routerManager.goto(needGoto, JSON.parse(localStorage.getItem("debug_need_goto_data") || "{}"))
    else
        routerManager.gotoHome()
}

module.exports = routerManager;
