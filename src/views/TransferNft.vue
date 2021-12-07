<template>
    <div class="panel">
        <div class="title">{{ $t('popup.trans_nft_title') }}</div>
        <div class="pay-info">
            <div class="origin">{{ origin }}</div>
        </div>
        <div class="notice">Genesis: <br> {{ genesis }}</div>
        <div class="notice">CodeHash: <br> {{ codehash }}</div>
        <div class="notice">TokenIndex: {{ tokenIndex }}</div>
        <div class="notice">{{ $t('popup.nft_receive') }}: {{ address }}</div>
        <div class="notice">{{ $t('popup.fee') }}: {{ fee }} Sat.</div>


        <div class="action-container" v-if="!isCreating">
            <a-button @click="cancel">{{ $t('popup.cancel') }}</a-button>
            <a-button v-if="!isCommit" type="primary" @click="commit">{{ $t('popup.commit') }}</a-button>
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
            address: "",
            genesis: "",
            codehash: "",
            tokenIndex: "",
            broadcast: true,
            isCommit: false,
        }
    },
    async mounted() {
        let routerData = routerManager.data;
        if (routerData) {
            data.receivers = [{amount: routerData.amount, address: routerData.address}]
            data.genesis = routerData.genesis;
            data.codehash = routerData.codehash;
            data.tokenIndex = routerData.tokenIndex;
            data.broadcast = routerData.broadcast;
        } else {
            this.address = request.params.address;
            this.genesis = request.params.genesis;
            this.codehash = request.params.codehash;
            this.tokenIndex = request.params.tokenIndex;
            this.broadcast = request.params.broadcast;
        }

        try {
            let senderWif = walletManager.getMainWif();
            let opreturnData = "";
            this.fee = await nftManager.sensibleNft.getTransferFee({
                genesis: this.genesis,
                codehash: this.codehash,
                tokenIndex: this.tokenIndex,
                senderWif,
                opreturnData
            });
        } catch (e) {
            console.log(e)
            this.fee = this.$t('popup.error_balance')
        }

    },
    methods: {
        cancel() {
            if (origin) {
                chrome.runtime.sendMessage({
                    channel: 'sato_extension_background_channel',
                    data: {
                        id: request.id,
                        result: "cancel"
                    },
                });
                window.close();
            } else {
                //暂时先返回首页
                routerManager.gotoHome();
            }
        },
        async commit() {
            try {
                this.isCommit = true;
                await new Promise(resolve => setTimeout(resolve, 100));

                let data = await nftManager.transfer(this.address, this.genesis, this.codehash, this.tokenIndex)

                if (origin) {
                    chrome.runtime.sendMessage({
                        channel: 'sato_extension_background_channel',
                        data: {
                            id: request.id,
                            result: "success",
                            data: {txid: data.txid}
                        },
                    });
                    window.close();
                }else
                    routerManager.gotoHome();
            } catch (e) {
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
