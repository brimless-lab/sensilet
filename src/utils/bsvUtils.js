let utils = {};

const axios = require('axios');


utils.getBalance = function (address) {
    return axios.get(`https://apiv2.metasv.com/address/${address}/balance`).then(res=>{
        return res.data
    })
};


// (async  function test(){
// console.log(
//     await utils.getBalance('16pijhZdhoHiytfU8z5LrJx6DFA6eaCCyS')
// )
// })()

module.exports = utils;
