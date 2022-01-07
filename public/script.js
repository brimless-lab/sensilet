//用于给网站提供接口
if (!window.sensilet)
    window.sensilet = {};

window.sensilet.postMessage = (message, callback) => {
    const listener = (event) => {
        if (event.detail.id === message.id) {

            window.removeEventListener('sato_contentscript_message', listener);
            if (callback && typeof callback === "function") {
                callback(event.detail)
            }
        }
        // console.log(event, 'script.js listener')
    };

    window.addEventListener('sato_contentscript_message', listener);

    window.dispatchEvent(
        new CustomEvent('sato_injected_script_message', {detail: message}),
    );
};
window.sensilet.on =  (eventName,callback)=>{
    let id = eventName+ Date.now() + "" + Math.floor(Math.random() * 1000000);

    //注册事件响应
    window.addEventListener('sato_contentscript_event', (event)=>{
        if (event.detail.id === id) {
            if (callback && typeof callback === "function") {
                callback(event.detail)
            }
        }
    },{once:false});

    //向bg注册事件
    window.dispatchEvent(
        new CustomEvent('sato_injected_script_message', {detail:{
            id,
            method:"addEvent",
            detail: eventName
        }}),
    );

    //页面刷新、关闭时移除事件
    window.addEventListener("unload",(event)=>{
        console.log("on unload, remove event listener")
        window.dispatchEvent(
            new CustomEvent('sato_injected_script_message', {detail:{
                    id,
                    method:"removeEvent",
                    detail: eventName
                }}),
        );
    })

}

function action(actionName, params) {
    return new Promise((resolve, reject) => {
        if (!params)
            params = {};
// console.log(params,'params');
        window.sensilet.postMessage({
            method: actionName,
            params,
            id: actionName + Date.now() + "" + Math.floor(Math.random() * 1000000),
        }, (result) => {
            if (result.result === 'success') {
                // console.log(result)
                resolve(result.data)
            } else {
                // console.log(result)
                reject(new Error(result.msg || result.result))
            }
        })
    })
}

window.sensilet.requestAccount = (params) => {
    return action('connect', params)
};
window.sensilet.exitAccount = (params) => {
    return action('disConnect', params)
};
window.sensilet.isConnect = (params) => {
    return action('isConnect', params)
};
window.sensilet.getAccount = window.sensilet.requestAccount

window.sensilet.getBsvBalance = (params) => {
    return action('getBsvBalance', params)
};
window.sensilet.getSensibleFtBalance = (params) => {
    return action('getTokenBalance', params)
};

/**
 *
 * @param receivers Array<{address : string,amount : number}>
 * @param broadcast boolean 是否广播
 */
window.sensilet.transferBsv = ({receivers, broadcast}) => {
    if (broadcast === undefined || broadcast == null)
        broadcast = true
    return action('pay', {broadcast, receivers})
};


window.sensilet.transferSensibleFt = ({genesis,codehash, rabinApis, broadcast, receivers}) => {
    if (broadcast === undefined || broadcast == null)
        broadcast = true
    return action('payToken', {broadcast, genesis,codehash, rabinApis, receivers})
};

window.sensilet.signTx = ({list}) => {
    return action('signTx', {list})
};
window.sensilet.signMsg = ({msg}) => {
    return action('signMsg', {msg})
};
window.sensilet.checkTokenUtxoCount = ({genesis,codehash}) => {
    return action('checkTokenUtxoCount', {genesis,codehash})
};
/*
const transferAll = await bsv.transferAll()
*/
window.sensilet.transferAll = async (params) => {
    let result = [];
    for (let i = 0; params && i < params.length; i++) {
        if(i>0 &&result[i-1].utxo ){
            params[i].utxo = result[i-1].utxo;
        }
        result[i] = await action(params[i].genesis ? 'payToken' : 'pay', params[i])
    }
    return result;
}


window.sensilet.payWithoutBroadcast = ({receivers}, callback) => {
    return action('pay', {
        receivers,
        broadcast: false,
    }, callback)
};


window.sensilet.getVersion = (callback)=>{
    return action('getVersion', {}, callback)
}

// 以下是nft部分
window.sensilet.genesis = (params, callback) => {
    return action('genesis', params, callback)
};
window.sensilet.issue = (params, callback) => {
    return action('issue', params, callback)
};
/**
 *
 * @param params
 * @param callback
 */
window.sensilet.transferNft = (params, callback) => {
    return action('transferNft', params, callback)
};

window.sensilet.listGenesis = (params, callback) => {
    return action('listGenesis', params, callback)
};
window.sensilet.listNft = (params, callback) => {
    return action('listNft', params, callback)
};


// 以下是web3 支持
window.sensilet.getAddress =()=>{
    return action('getAddress', {})

}
window.sensilet.getPublicKey =()=>{
    return action('getPublicKey', {})
}
window.sensilet.getPublicKeyAndAddress =(hdPath)=>{
    return action('getPublicKeyAndAddress', {hdPath})
}

window.sensilet.signTransaction =(txHex,inputInfos)=>{
    return action('signTransaction', {txHex,inputInfos})
}

window.sensilet.signMessage =(msg)=>{
    return action('signMsg', {msg,noNeedAddress:true})
}

console.log('script loaded #');
