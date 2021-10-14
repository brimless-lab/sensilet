let httpUtils = {};

const axios = require('axios');

httpUtils.get = function (url,params){
    return new Promise((resolve, reject) => {
        axios.get(url,{params}).then(res=>{
            if(res.status===200){
                resolve(res.data)
            }else
                reject(new Error(errorCode.NETWORK_ERR))
        })
    })
}

module.exports= httpUtils;
