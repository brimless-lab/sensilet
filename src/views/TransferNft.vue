<template>
    <div class="panel">
        <div class="title">此网站申请转移NFT</div>
        <div class="pay-info">
            <div class="origin">{{origin}}</div>
        </div>
        <div class="notice">Genesis：<br> {{genesis}}</div>
        <div class="notice">CodeHash：<br> {{codehash}}</div>
        <div class="notice">TokenIndex： {{tokenIndex}}</div>
        <div class="notice">NFT接收地址： {{address}}</div>
        <div class="notice">NFT手续费约： {{fee}} Sat.</div>



        <div class="action-container" v-if="!isCreating">
            <a-button @click="cancel">取消</a-button>
            <a-button v-if="!isCommit" type="primary" @click="commit">确定</a-button>
            <a-spin v-else/>
        </div>
        <a-spin v-else/>
    </div>
</template>

<script>

    const urlParams = new URLSearchParams(window.location.hash.slice(1));
    const origin = urlParams.get('origin');
    const request = JSON.parse(urlParams.get('request'));

    export default {
        name: "Pay",
        data() {
            return {
                isCreating: false,
                origin,
                fee: 0,
                address: request.params.address,
                genesis: request.params.genesis,
                codehash: request.params.codehash,
                tokenIndex: request.params.tokenIndex,
                isCommit:false,
            }
        },
        async mounted() {
            //    对于 issue， 应该先genesis
            //    如果 请求中带了 genesis，则检查此genesis是否是自己拥有的
            //    如果 请求中不包含 genesis , 则判断用户是否已有默认genesis，没有则创建
            let senderWif = walletManager.getMainWif();
            let opreturnData = "";
            this.fee = await nftManager.sensibleNft.getTransferFee({
                genesis: this.genesis,
                codehash: this.codehash,
                tokenIndex: this.tokenIndex,
                senderWif,
                opreturnData
            });

        },
        methods: {
            cancel() {
                chrome.runtime.sendMessage({
                    channel: 'sato_extension_background_channel',
                    data: {
                        id: request.id,
                        result: "cancel"
                    },
                });
                window.close();
            },
            async commit() {
                try {


                    this.isCommit = true;
                    await new Promise(resolve => setTimeout(resolve, 100));

                    let data = await nftManager.transfer(this.address, this.genesis, this.codehash, this.tokenIndex)

                    chrome.runtime.sendMessage({
                        channel: 'sato_extension_background_channel',
                        data: {
                            id: request.id,
                            result: "success",
                            data: {txid: data.txid}
                        },
                    });
                    window.close();
                }catch (e) {
                    this.isCommit = false;
                    console.log(e)
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .panel {
        text-align: center;

    }

    .title {
        font-size: 1.2em;
        font-weight: bold;
    }

    .genesis-container {
        margin-top: 10px;
    }

    .notice {
        margin: 10px;
        white-space: normal;
        word-break: break-all;
    }

    .action-container {
        margin-top: 10px;

        display: flex;
        justify-content: space-between;
    }
</style>
