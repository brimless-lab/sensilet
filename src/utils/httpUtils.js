let httpUtils = {};

const axios = require('axios');

httpUtils.get = function (url,params){
    if(!params)
        params = {};
    //接口请求带上版本号
    params.versionCode = config.versionCode;
    return new Promise((resolve, reject) => {
        axios.get(url,{params}).then(res=>{
            if(res.status===200){
                resolve(res.data)
            }else
                reject(new Error(errorCode.NETWORK_ERR))
        })
    })
}

httpUtils.post = function (url,params){
    if(!params)
        params = {};
    //接口请求带上版本号
    params.versionCode = config.versionCode;
    return new Promise((resolve, reject) => {
        axios.post(url,params).then(res=>{
            if(res.status===200){
                resolve(res.data)
            }else
                reject(new Error(errorCode.NETWORK_ERR))
        })
    })
}

module.exports= httpUtils;
