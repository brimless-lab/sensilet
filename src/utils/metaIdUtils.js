let metaIdUtils = {};

/* metaId 协议 https://www.metaid.io/meta_protocol
    通过在op_return 中按特定格式记录信息
    <Metanet Flag><P(node)><TxID(parent)><MetaID Flag><node_name><data><encrypt><version><data_type><encoding>
        < Metanet Flag >固定为“meta”；
        < P(node) >为节点的公钥；
        < TxID(parent) >为父节点的交易ID
        MetaID Flag	固定为"MetaID"
        node_name	节点标识名字，必须字段。
        data	存储节点所对应的数据内容
        encrypt	标识该节点内容是否加密。本协议版本支持两种方式：0为不加密；1为ECIES加密，即加密key为对应节点的公钥，采用对应节点路径的私钥解密。默认为0不加密。
        version	节点类型的版本号，不同版本号意味着data内容的格式不相同。
        data_type	可选项目。data对应的数据类型，可用数据类型请参考：https://www.iana.org/assignments/media-types/media-types.xhtmls。默认为text/plain
        encoding	可选项目。data对应的编码格式，可用编码类型请参考：https://www.iana.org/assignments/character-sets/character-sets.xhtml。默认为UTF-8，
 */

/*
    计划实现内容
    1.用户信息
    2.分数分享 到 showbuzz
    3.市场装备吆喝
 */

metaIdUtils.buildMetaData = function (publicKey, parentTxid, node_name, data = 'NULL', encrypt = 'NULL', version = 'NULL', data_type = 'NULL', encoding = 'NULL') {
    if (data==="")
        data = "NULL";
    if (encrypt==="")
        encrypt = "NULL";
    if (version==="")
        version = "NULL";
    if (data_type ==="")
        data_type = "NULL";
    if (encoding === "")
        encoding = "NULL";
    return [
        "meta",
        publicKey+"",
        parentTxid+"",
        "MetaID",
        node_name+"",
        data+"",
        encrypt+"",
        version+"",
        data_type+"",
        encoding+""
    ]
}

function send(privateKey, data) {
    return new Promise((resolve, reject) => {
        // console.log(data);
        // return resolve();
        datapay.send({
            safe: true,
            data,
            pay: {key: privateKey,feeb:1}
        }, (err, txid) => {
            // console.log(err);
            // console.log(txid);
            if (err)
                return reject(err);
            resolve(txid);
        })
    })
}

function readFile(path){
    return new  Promise(((resolve, reject) => {
        require('fs').readFile(require('path').resolve('./')+path,'binary',function(err,data){
            if(err){
                reject(err)
            }else{
                resolve(data)
            }
        });
    }));
}
metaIdUtils.createMetaId = async function (gid) {
    //1.通过bip32 server 获取用户公私钥
    // let privateKey = "KxooSzFMv8fdVtkU51SYnTX6UqLEuyYGYcY97FZgfvs6K4Hoz6pG";
    let privateKey = "L1Z5mh3YRACeaqsdi8hZx4psNATWD9CHyUBCF11q58nPCmZ38RHy";
    let privateKeyObj = bsv.PrivKey.fromWif(privateKey);
    let publicKey = new bsv.PubKey().fromPrivKey(privateKeyObj).toHex();

    // console.log(publicKey);
    // console.log(bsv.Address.fromPrivKey(privateKeyObj).toString());

    //2.创建root节点
    // let result = await send(privateKey,buildMetaData(publicKey,"NULL","Root"))
    // let result = await send(privateKey,["test"]).catch((e)=>{console.log(e)});
    // console.log(result)  //24318cb4f4b69b7d261d07dfa54b50e3da363fbddceeef841bc9e2fb25350bdd
    let rootTxid = "24318cb4f4b69b7d261d07dfa54b50e3da363fbddceeef841bc9e2fb25350bdd";
    //3.创建info节点
    // let infoTxid = await send(privateKey, buildMetaData(publicKey, rootTxid, "Info", "", 0,"","text/plain","utf-8"))
    // console.log(infoTxid);  //17ec0d5df5887f295583c95771b16020068794f4c1781533822612f09e598550
    let infoTxid = "17ec0d5df5887f295583c95771b16020068794f4c1781533822612f09e598550";
    //3.1 设置name
    // let nameTxid = await send(privateKey, buildMetaData(publicKey, infoTxid, "name", "Test", 0,"","text/plain","utf-8")).catch(e=>console.log(e))
    // console.log(nameTxid);  //70cab2bcabd312b3dc0545ec3d2d1ff8365be094da168111ff1a9bb0b1a58e4e
    //3.2 设置头像

    // let data = await readPng('/public/test.png');
    // console.log(data)   //二进制流
    // console.log(new Buffer(data,'binary').toString('binary'))
    // encrypt 和 version 都需要是 字符串类型。
    // let picTxid = await send(privateKey,
    //     buildMetaData(publicKey, infoTxid, "avatar",new Buffer(data,'binary'),
    //         "0","1","image/png","binary")).catch(e=>console.log(e))


    //4.创建Protocols节点
    // let protocolsTxid = await send(privateKey, buildMetaData(publicKey, rootTxid, "Protocols", "", 0,"","text/plain","utf-8")).catch(e=>console.log(e))
    // console.log(protocolsTxid); //aca439a2a09c1852a00c4a121f966c8f6c491b157ea36dcecb2dfa77fa1b612d
    let protocolsTxid = "aca439a2a09c1852a00c4a121f966c8f6c491b157ea36dcecb2dfa77fa1b612d";

    //5.在Protocols节点下创建 简单微博协议
    // let blogTxid = await send(privateKey, buildMetaData(publicKey, protocolsTxid, "SimpleMicroblog", "9e73d8935669", "0", "1.0.2", "text/plain", "utf-8")).catch(e => console.log(e))
    // console.log(blogTxid);  //67d4edbbad8935cc133d9078c096ab3ccadd2833653b8c7ef2dc1a3a2af1b1eb
    // let blogTxid = "67d4edbbad8935cc133d9078c096ab3ccadd2833653b8c7ef2dc1a3a2af1b1eb";
    // //
    // let dataTxid = await send(privateKey, buildMetaData(publicKey, blogTxid, "SimpleMicroblog-9e73d8935669", JSON.stringify({
    //     "createTime": ""+Date.now(),
    //     // "content": "metaId Html测试\n<h2>测试</h2><br><div style='color: deepskyblue'>测试</div>",
    //     "content": "希望是附丽于存在的，有存在，便有希望，有希望，便是光明。",
    //     "contentType": "text/plain",
    //     "quoteTx": "",
    //     "attachments": [],
    //     "mention": [""]
    // }), "0", "1.0.2", "application/json", "utf-8")).catch(e => console.log(e))
    // console.log(dataTxid);
    //a62534aca81846ff6f7f1e79d2757667b3f253e88d0f215f147122dec2996a43
    //686d064abd5d2dc591e58fc36a8836490768bf1c478331496b9a281c0f9c1883
    //85ad63d42ff06b2db0dda2ad33abfeb2393d62b44e2702e540a850e8fd5c5db7

    //使用2号私钥(正式服gid:12004)进行他人代发测试 失败，无法展示
    // privateKey = "L2gNEkniuCe6tZBqrsU9ewKQYYdnRA4mpfZoAtAXHfyFonmX6CHZ";
    // let dataTxid = await send(privateKey, buildMetaData(publicKey, blogTxid, "SimpleMicroblog-9e73d8935669", JSON.stringify({
    //     "createTime": ""+Date.now(),
    //     "content": "metaId 代付手续费测试",
    //     "contentType": "text/plain",
    //     "quoteTx": "",
    //     "attachments": [],
    //     "mention": ["958ef4842470ab96130ec2b7f7f757940898c434e5b3204bad79531ee53b71bd"]
    // }), 0, "1.0.2", "application/json", "utf-8")).catch(e => console.log(e))
    // console.log(dataTxid);   //7675678c15679719e8e3834138e5d581c7a81f0f571ce0a0c32d397a0fcfed7c

    //使用2号私钥的pubkey(正式服gid:12004)
    // let dataTxid = await send(privateKey, buildMetaData("abcdefghijklmn1234", blogTxid, "SimpleMicroblog-9e73d8935669", JSON.stringify({
    //     "createTime": ""+Date.now(),
    //     "content": "奇怪的pubkey测试。很抱歉打扰到大家",
    //     // "content": "大家好,这是一条测试消息。",
    //     "contentType": "text/plain",
    //     "quoteTx": "",
    //     "attachments": [],
    //     "mention": [""]
    // }), "0", "1.0.2", "application/json", "utf-8")).catch(e => console.log(e))
    // console.log(dataTxid);

//    nft 属性的metnet结构    每件装备对应一个协议节点

    // let blogTxid = await send(privateKey, buildMetaData("03cb33f283e0e185aebc41c1ebd55b43f9775c76c1472525dde7e1aa97f850f538", protocolsTxid, "SimpleMicroblog", "9e73d8935669", "0", "1.0.2", "text/plain", "utf-8")).catch(e => console.log(e))
    // console.log(blogTxid);  //ca5f7bdf453c87ad99caea4c27828b6f10adb3507cdb64812bd805f5d0053487
};

module.exports = metaIdUtils;
