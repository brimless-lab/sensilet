# Sensilet

## install

    Download Sensilet from Chrome Extensions Store

## Development package

[Sensilet.zip](https://test.sensilet.com/sensilet.zip)

## Usage

```js
//the sensilet is on web window object
const bsv = window.sensilet
// 连接到钱包
const address = await bsv.requestAccount();
// 获取钱包账户信息
const accountInfo = await bsv.getAccount();
// 获取bsv 余额
const bsvBalance = await bsv.getBsvBalance();
// 发送bsv
const transferBsvRes = await bsv.transferBsv({
    receivers: [{address: "xxx", amount: 333}],
    broadcast: true,
});
// 发送 sensible ft
const transferFtTres = await bsv.transferSensibleFt({
    receivers: [{address: "xxx", amount: 344}],
    codehash: "codehash",
    genesis: "genesis",
    broadcast: true,
    rabinApis: [
        "https://s1.satoplay.com"
    ]
});
//签名交易
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
const transferAll = await bsv.transferAll([{
    receivers: [{address: "xxx", amount: 344}],
    codehash: "codehash",
    genesis: "genesis",
    broadcast: true,
    rabinApis: [
        "https://s1.satoplay.com"
    ]
}])
```

## Demo

[Demo](https://test.sensilet.com/test.html)

## api

### bsv.requestAccount(): Promise<void>

连接到钱包

### bsv.exitAccount(): Promise<void>

退出登录

### bsv.getAccount(): Promise<{name: string, network: 'mainnet' | 'testnet'}>

获取钱包账户信息

### bsv.getAddress(): Promise<string>

获取钱包地址

### bsv.getBsvBalance(): Promise<{balance: number}>

获取钱包 bsv 余额，balance 单位为 satoshi

### bsv.getSensibleFtBalance(): Promise<Array<SensibleFt>>

获取钱包 sensible ft 余额

```ts
interface SensibleFt {
    genesis: string;
    codehash: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: number;
    balance: number;
}
```

### bsv.transferBsv({receivers: Array<Receiver>}): Promise<{txid: string}>

bsv 转账

```ts
interface Receiver {
    address: string;
    amount: number;
}
```

### bsv.transferSensibleFt({receivers: Array<Receiver>, codehash: string, genesis: string, rabinApis: Array<String>}): Promise<{txid: string}>

sensible ft 转账

```ts
interface Receiver {
    address: string;
    amount: number;
}
```

### bsv.transferAll([{receivers: Array<Receiver>, codehash: string, genesis: string, rabinApis: Array<String>}): Promise<{txid: string}]>

bsv 和 sensible ft 混合转账

```ts
interface Receiver {
    address: string;
    amount: number;
}
```
