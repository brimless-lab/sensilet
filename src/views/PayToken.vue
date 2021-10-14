<template>
    <div class="panel">
        <div class="title" v-if="origin">{{$t('popup.pay_request',[""])}}</div>
        <div class="pay-info" v-if="origin">
            <div class="origin">{{ origin }}</div>
        </div>
        <div v-if="tokenInfo" style="margin-top: 20px">
            <img class="logo" :src="tokenInfo.logo" alt="">
            <div class="notice">{{ tokenInfo.name }}</div>
            <div class="notice">Genesis: {{ tokenInfo.genesis }}</div>

            <div class="receive-container">
                <div class="receive-item" v-for="item in receivers">
                    <div class="notice">{{$t('popup.receive_address')}} {{$t('popup.')}}{{ item.address }}</div>
                    <div class="notice">{{$t('popup.amount')}}{{$t('popup.')}}
                        <CoinShow :value="item.amount" :big-unit="tokenInfo.unit" :decimal="tokenInfo.decimal" :fixed="tokenInfo.decimal" show-big-unit/>
                    </div>
                </div>
            </div>

            <div class="notice">{{$t('popup.balance')}}
                <CoinShow :value="tokenInfo.balance" :big-unit="tokenInfo.unit" :decimal="tokenInfo.decimal" :fixed="tokenInfo.decimal" show-big-unit/>
            </div>
            <div class="notice">{{$t('popup.fee')}}
                <span style="display: none">{{fee}}</span>
                <CoinShow :value="fee" big-unit="BSV" :decimal=8 :fixed=8 show-big-unit/>
            </div>


            <div class="notice">{{$t('popup.broadcast')}} {{ broadcast ? $t('popup.yes') : $t('popup.no') }}</div>
            <div class="action-container" v-if="!isPaying">
                <a-button @click="cancel">{{$t('popup.cancel')}}</a-button>
                <a-button type="primary" @click="commit">{{$t('popup.commit')}}</a-button>
            </div>
            <a-spin v-else/>
        </div>
        <a-spin v-else/>
    </div>
</template>

<script>

const urlParams = new URLSearchParams(window.location.hash.slice(1));
const origin = urlParams.get('origin');
const request = JSON.parse(urlParams.get('request'));
import CoinShow from "../components/CoinShow";

export default {
    name: "PayToken",
    components: {CoinShow},
    data() {


        let data = {
            isPaying: false,
            origin,
            fee: null,
            tokenInfo: null,
            receivers: [],
            genesis: "",
            broadcast: false,
        };

        let routerData = routerManager.data;
        if (routerData) {
            data.receivers = [{amount: routerData.amount, address: routerData.address}]
            data.broadcast = routerData.broadcast;
            data.genesis = routerData.genesis;
        } else {
            data.receivers = request.params.receivers;
            data.broadcast = request.params.broadcast;
            data.genesis = request.params.genesis;
            data.utxo = request.params.utxo;

        }


        return data;
    },
    async mounted() {
        console.log(this.genesis)

        this.tokenInfo = await tokenManager.getTokenInfo(this.genesis);
        if (!this.tokenInfo) {
            antMessage.error(this.$t('popup.unknown_token'));
            routerManager.gotoHome()
        }

        //
        let op = "";
        try {

            let fee = await tokenManager.sensibleFt.getTransferEsitimate(this.tokenInfo.codehash, this.tokenInfo.genesis,
                this.receivers, walletManager.getMainWif()
            );
            console.log(this.fee)
            this.fee = fee
            // this.fee = 0;
            // let _this = this;
            // setTimeout(()=>{
            //     _this.fee =fee; //又是数值变了，页面未刷新渲染的情况
            // },1)
        } catch (e) {
            console.log(e)
            this.fee = this.$t('popup.error_balance')
        }

        //
        // let {rawHex,fee} = await walletManager.pay(this.address, this.amount, this.broadcast);
        // this.fee = fee;
        // this.rawHex = rawHex;
    },
    methods: {
        cancel() {
            if (origin) {
                //外部请求
                chrome.runtime.sendMessage({
                    channel: 'sato_extension_background_channel',
                    data: {
                        id: request.id,
                        result: "cancel"
                    },
                });
                window.close();
            } else
                routerManager.gotoHome();
        },
        async commit() {

            try {
                this.isPaying = true;
                let {txid, txHex, routeCheckTxHex} = await tokenManager.transfer(this.receivers, this.broadcast, this.tokenInfo, this.utxo);
                // console.log(result);
                // antMessage.success("支付成功")

                if (origin) {
                    //外部请求
                    chrome.runtime.sendMessage({
                        channel: 'sato_extension_background_channel',
                        data: {
                            id: request.id,
                            result: "success",
                            data: this.broadcast ? {txid} : {txHex, routeCheckTxHex},
                        },
                    });
                    window.close();
                } else {
                    await sleep(2000)
                    routerManager.gotoHome();
                }
            } catch (e) {
                console.error(e)
                if (e.message.indexOf('Insufficient balance.') > -1) {
                    antMessage.error($t("popup.error_insufficient_balance"))
                } else if (e.message.indexOf('Insufficient token') > -1) {
                    antMessage.error($t("popup.error_insufficient_token",[this.tokenInfo.name]))
                } else
                    antMessage.error(e.message)
            } finally {
                this.isPaying = false;
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

.logo {
    width: 100px;
    height: 100px;
}

.genesis-container {
    margin-top: 10px;
}

.notice {
    margin: 10px;
}

.action-container {
    margin-top: 10px;

    display: flex;
    justify-content: space-between;
}

.receive-container {
    margin-top: 10px;
    background-color: whitesmoke;
    border-radius: 5px;
    padding: 4px;

    .receive-item {
        .notice {
            margin: 4px;
        }
    }
}
</style>
