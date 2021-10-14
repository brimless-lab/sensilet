<template>
<div class="panel">
    <div class="title">{{$t('popup.too_many_utxo')}}</div>
    <div v-if="tokenInfo" style="margin-top: 20px">
        <img class="logo" :src="tokenInfo.logo" alt="">
        <div class="notice">{{ tokenInfo.name }}</div>
        <div class="notice">Genesis: {{ tokenInfo.genesis }}</div>

       <div class="notice">
           {{$t('popup.merge_notice')}}
       </div>
        <div class="notice">{{$t('popup.fee')}}
            <CoinShow :value="fee" big-unit="BSV" :decimal=8 :fixed=8 show-big-unit/>
        </div>

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

export default {
    name: "Merge",
    data(){


        let data = {
            isPaying: false,
            fee: null,
            tokenInfo: null,
            genesis: "",
        };

        let routerData = routerManager.data;
        if (routerData) {
            data.genesis = routerData.genesis;
        } else {
            data.genesis = request.params.genesis;
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
         let fee = await tokenManager.sensibleFt.getMergeEstimateFee(this.tokenInfo.codehash, this.tokenInfo.genesis,
             walletManager.getMainWif()
        );
        console.log(fee)
        this.fee = fee
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

                let utxoCount =await tokenManager.sensibleFt.getUtxoCount(this.tokenInfo.genesis,this.tokenInfo.codehash)

                if(utxoCount>20)
                    await tokenManager.sensibleFt.merge(walletManager.getMainWif(),walletManager.getMainWif(),this.tokenInfo.genesis,this.tokenInfo.codehash,utxoCount)


                if (origin) {
                    //外部请求
                    chrome.runtime.sendMessage({
                        channel: 'sato_extension_background_channel',
                        data: {
                            id: request.id,
                            result: "success",
                            data:true,
                        },
                    });
                    window.close();
                } else {
                    routerManager.gotoHome();
                }
            } catch (e) {
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

<style scoped>
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
</style>
