# Sensilet

## install

    Download Sensilet from [Chrome Extensions Store](https://chrome.google.com/webstore/detail/sensilet/aadkcfdlmiddiiibdnhfbpbmfcaoknkm)


## Usage

```js
//the sensilet is on web window object
const bsv = window.sensilet
// connect to sensilet
const address = await bsv.requestAccount();
// get user account info
const accountInfo = await bsv.getAccount();
// get user balance
const bsvBalance = await bsv.getBsvBalance();
// transfer bsv
const transferBsvRes = await bsv.transferBsv({
    receivers: [{address: "xxx", amount: 333}],
    broadcast: true,
});
// transfer sensible ft
const transferFtTres = await bsv.transferSensibleFt({
    receivers: [{address: "xxx", amount: 344}],
    codehash: "codehash",
    genesis: "genesis",
    broadcast: true,
});
//signTx
const sigList = await bsv.signTx({
    list:[{
        txHex: "",
        scriptHex:"",
        address:"",
        inputIndex:0,
        satoshis:32,
        sigtype:0
    }]
})
//transferAll 
const transferAll = await bsv.transferAll([
    {
        broadcast: false,
        receivers:[{amount:1000,address:"xxx"}]
    },{
        broadcast: false,
        genesis:"8e9c53e1a38ff28772db99ee34a23bb305062a1a",
        receivers:[{amount:1000,address:"xxx"}]
    }
])
```

## Demo

[Demo](https://test.sensilet.com/test.html)
