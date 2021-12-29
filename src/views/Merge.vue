<template>
    <div class="panel-container">

        <div class="panel">
            <div class="title">{{ $t('popup.too_many_utxo') }}</div>
            <div v-if="tokenInfo" style="margin-top: 20px">
                <img class="logo" :src="tokenInfo.logo" alt="">
                <div class="notice">{{ tokenInfo.name }}</div>
                <div class="notice">Genesis: {{ tokenInfo.genesis }}</div>

                <div class="notice">
                    {{ $t('popup.merge_notice') }}
                </div>
                <div class="notice">{{ $t('popup.fee') }}
                    <CoinShow :value="fee" big-unit="BSV" :decimal=8 :fixed=8 show-big-unit/>
                </div>


            </div>
            <a-spin v-else/>
        </div>
        <div class="action-panel">
            <div class="action-container" v-if="!isPaying">
                <a-button @click="cancel">{{ $t('popup.cancel') }}</a-button>
                <a-button type="primary" @click="commit">{{ $t('popup.commit') }}</a-button>
            </div>
            <a-spin v-else/>
        </div>
    </div>
</template>

<script>
const urlParams = new URLSearchParams(window.location.hash.slice(1));
const origin = urlParams.get('origin');
const request = JSON.parse(urlParams.get('request'));
import CoinShow from "../components/CoinShow";

let signers = null;
let tokenInfo = null;

export default {
    name: "Merge",
    components: {CoinShow},
    data() {

        let data = {
            isPaying: false,
            fee: 0,
            tokenInfo: null,
            genesis: "",
            codehash: "",
        };

        let routerData = routerManager.data;
        if (routerData) {
            data.genesis = routerData.genesis;
            data.codehash = routerData.codehash;
        } else {
            data.genesis = request.params.genesis;
            data.codehash = request.params.codehash;
        }


        return data;
    },
    async mounted() {
        console.log(this.genesis)

        tokenInfo = await tokenManager.getTokenInfo(this.genesis, this.codehash);

        if (!tokenInfo) {
            antMessage.error(this.$t('popup.unknown_token'));
            routerManager.gotoHome()
        }

        this.tokenInfo = tokenInfo;

        if (tokenInfo.notDefaultSigners
            || tokenInfo.genesis === "54256eb1b9c815a37c4af1b82791ec6bdf5b3fa3"
            || tokenInfo.genesis === "8764ede9fa7bf81ba1eec5e1312cf67117d47930") {
            signers = await tokenManager.sensibleFt.getSignersFromRabinApis(tokenInfo.signers)
        }

        console.log(await walletManager.getBsvUtxoCount(), "BSV utxo count", walletManager.getMainAddress())
        //
        let fee = await tokenManager.sensibleFt.getMergeEstimateFee(tokenInfo.codehash, tokenInfo.genesis,
            walletManager.getMainWif(), signers
        );
        console.log(fee)
        this.fee = fee
    },
    methods: {
        cancel() {
            if (origin&& request && request.method==='checkTokenUtxoCount') {
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

                //检查一下BSV utxo
                let bsvUtxoCount = await walletManager.getBsvUtxoCount()

                if (bsvUtxoCount > 3) {
                    await walletManager.mergeBsvUtxo(walletManager.getMainWif());
                }

                let utxoCount = await tokenManager.sensibleFt.getUtxoCount(tokenInfo.genesis, tokenInfo.codehash, walletManager.getMainAddress())

                if (utxoCount >= 20)
                    await tokenManager.sensibleFt.merge(walletManager.getMainWif(), walletManager.getMainWif(), tokenInfo.genesis, tokenInfo.codehash, utxoCount)


                if (origin && request && request.method==='checkTokenUtxoCount') {
                    //外部请求
                    chrome.runtime.sendMessage({
                        channel: 'sato_extension_background_channel',
                        data: {
                            id: request.id,
                            result: "success",
                            data: true,
                        },
                    });
                    window.close();
                } else {
                    routerManager.goNext();
                }
            } catch (e) {
                if (e.message.indexOf('Insufficient balance.') > -1) {
                    antMessage.error(this.$t("popup.error_insufficient_balance"))
                } else if (e.message.indexOf('Insufficient token') > -1) {
                    antMessage.error(this.$t("popup.error_insufficient_token", [this.tokenInfo.name]))
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
