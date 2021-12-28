<template>
    <div class="panel-container">
        <div class="panel scrolled">
            <div class="title" v-if="origin">{{ $t('popup.pay_request', [""]) }}</div>
            <div class="pay-info" v-if="origin">
                <div class="origin">{{ origin }}</div>
            </div>
            <div v-if="tokenInfo" style="margin-top: 20px">
                <div class="token-info">
                    <img class="logo" :src="tokenInfo.logo||'/img/empty-token.png'" alt="">
                    <div class="right">
                        <div class="info" style="margin-bottom: 0">
                            <div class="key main-word" style="font-size: 1.25em">{{ tokenInfo.name }}</div>
                            <div class="value"></div>
                        </div>
                        <div class="info" style="color: #666;margin-top: 0;font-size: 13px">
                            <div class="key">Genesis: {{ tokenInfo.genesisShow }}</div>
                            <div class="value"></div>
                        </div>
                    </div>
                </div>

                <div class="receive-container" :class="{'not-enough':tokenInfo.rest<0}" style="margin-top: 20px">
                    <div class="info">
                        <div class="key">
                            From:{{ mineAddress }}
                        </div>
                        <div class="value ">
                            <CoinShow :value="tokenInfo.balance" is-bold-amount
                                      :big-unit="tokenInfo.unit" :decimal="tokenInfo.decimal" :fixed="tokenInfo.decimal" show-big-unit/>
                        </div>
                    </div>
                    <div class="receive-item" v-for="item in receivers">
                        <div class="info">
                            <div class="key">To:{{ item.addressShow }}</div>
                            <div class="value red">
                                -
                                <CoinShow :value="item.amount" :big-unit="tokenInfo.unit" :decimal="tokenInfo.decimal" :fixed="tokenInfo.decimal" show-big-unit is-bold-amount/>
                            </div>
                        </div>
                        <div class="info fee-usd">
                            <div class="key"></div>
                            <div class="value" style="margin-right: -2px;color: #666;" v-if="item.usd">
                                {{ item.usd }} USD
                            </div>
                            <div class="value" v-else>
                                <a-spin size="small"></a-spin>
                            </div>
                        </div>
                    </div>
                    <div class="block-line"></div>
                    <div class="info">
                        <div class="key">{{ $t('popup.balance_2') }}</div>
                        <div class="value" v-if="tokenInfo.rest>=0">
                            <CoinShow :value="tokenInfo.rest" :big-unit="tokenInfo.unit" :decimal="tokenInfo.decimal" :fixed="tokenInfo.decimal" show-big-unit is-bold-amount/>
                        </div>
                        <div class="value" v-else style="color:#cc0000;">
                            {{ tokenInfo.name }} not enough
                        </div>
                    </div>
                </div>
                <div class="receive-container" :class="{'not-enough':isBsvNotEnough}">
                    <div class="info">
                        <div class="key">{{ $t('popup.fee') }}</div>
                        <div v-if="fee!=null" class="value">
                            <div v-if="isBsvNotEnough" style="color: #cc0000">
                                BSV not enough
                            </div>
                            <div v-else>
                                <span style="display: none">{{ fee }}</span>
                                <CoinShow :value="fee" big-unit="BSV" :decimal=8 :fixed=8 show-big-unit/>
                            </div>
                        </div>
                        <a-spin v-else/>

                    </div>
                    <div class="info fee-usd" v-if="feeUsd>0">
                        <div class="key"></div>
                        <div class="value" style="color: #666;margin-right: -2px">
                            {{ feeUsd }} USD
                        </div>
                    </div>
                </div>

            </div>
            <a-spin v-else/>
        </div>
        <div class="action-panel">
            <div class="action-container" v-if="!isPaying">
                <a-button @click="cancel">{{ $t('popup.cancel') }}</a-button>
                <div>
                    <div class="info broadcast-info">
                        <div class="key">{{ $t('popup.broadcast') }}</div>
                        <div class="value">{{ broadcast ? $t('popup.yes') : $t('popup.no') }}</div>
                    </div>
                    <a-button type="primary" @click="commit">{{ $t('popup.commit') }}</a-button>
                </div>
            </div>
            <a-spin v-else/>
        </div>
    </div>
</template>

<script>
import apiUtils from '../utils/apiUtils';

const urlParams = new URLSearchParams(window.location.hash.slice(1));
const origin = urlParams.get('origin');
const request = JSON.parse(urlParams.get('request'));
import CoinShow from "../components/CoinShow";

let signers = null;
let tokenInfo = null;

export default {
    name: "PayToken",
    components: {CoinShow},
    data() {

        let data = {
            isPaying: false,
            origin,
            fee: null,
            receivers: [],
            genesis: "",
            broadcast: false,
            tokenInfo: null,
            feeUsd: -1,
            isBsvNotEnough: false,
            mineAddress: showLongString(walletManager.getMainAddress()),
        };

        let routerData = routerManager.data;
        if (routerData) {
            data.receivers = [{amount: routerData.amount, address: routerData.address, addressShow: showLongString(routerData.address)}]
            data.broadcast = routerData.broadcast;
            data.genesis = routerData.genesis;
            data.codehash = routerData.codehash;
        } else {
            request.params.receivers.forEach(item => {
                item.addressShow = showLongString(item.address)
            });

            data.receivers = request.params.receivers
            data.broadcast = request.params.broadcast;
            data.genesis = request.params.genesis;
            data.codehash = request.params.codehash;
            data.utxo = request.params.utxo;
        }


        return data;
    },
    async mounted() {
        console.log(this.genesis, this.codehash)
        signers = null;
        tokenInfo = await tokenManager.getTokenInfo(this.genesis, this.codehash);

        if (!tokenInfo) {
            antMessage.error(this.$t('popup.unknown_token'));
            routerManager.gotoHome()
            return
        }
        tokenInfo.genesisShow = showLongString(tokenInfo.genesis)
        tokenInfo.rest = tokenInfo.balance;

        for (let i = 0; i < this.receivers.length; i++) {
            tokenInfo.rest -= this.receivers[i].amount;
        }

        this.tokenInfo = tokenInfo;

        try {
            // console.log(tokenInfo,tokenInfo.notDefaultSigners)
            if (tokenInfo.notDefaultSigners
                || tokenInfo.genesis === "54256eb1b9c815a37c4af1b82791ec6bdf5b3fa3"
                || tokenInfo.genesis === "8764ede9fa7bf81ba1eec5e1312cf67117d47930") {
                signers = await tokenManager.sensibleFt.getSignersFromRabinApis(tokenInfo.signers)
            }
            // console.log(signers)

            let fee = await tokenManager.sensibleFt.getTransferEsitimate(tokenInfo.codehash, tokenInfo.genesis,
                this.receivers, walletManager.getMainWif(), signers
            );
            console.log(fee, '###fee')
            this.fee = fee

        } catch (e) {
            console.error(e)
            this.fee = this.$t('popup.error_balance')
        }
        this.getFeeUsd();

        //
        // let {rawHex,fee} = await walletManager.pay(this.address, this.amount, this.broadcast);
        // this.fee = fee;
        // this.rawHex = rawHex;
    },
    methods: {
        async getFeeUsd() {
            let {total} = await walletManager.getBsvBalance();
            if (isNaN(this.fee) || total < this.fee)
                this.isBsvNotEnough = true;

            if (!isNaN(this.fee)) {
                let bsvPrice = (await apiUtils.getBsvPrice()).data
                this.feeUsd = (this.fee / Math.pow(10, 8) * bsvPrice).toFixed(2);
                // console.log(bsvPrice, this.feeUsd)
            }

            let price = (await apiUtils.getTokenPrice(this.tokenInfo.genesis)).data
            //
            for (let i = 0; i < this.receivers.length; i++) {
                if (price) {
                    this.receivers[i].usd = (this.receivers[i].amount / Math.pow(10, this.tokenInfo.decimal) * price.USDT).toFixed(2);
                } else
                    this.receivers[i].usd = "-"
            }
            // console.log(price,this.receivers)


        },
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
                let {txid, txHex, routeCheckTxHex, tx} = await tokenManager.transfer(this.receivers, this.broadcast, tokenInfo, this.utxo, signers);
                // console.log(result);
                // antMessage.success("支付成功")

                if (this.broadcast) {
                    antMessage.success('Success')
                    await sleep(2000)
                }

                if (origin) {
                    //外部请求
                    if (this.broadcast) {
                        chrome.runtime.sendMessage({
                            channel: 'sato_extension_background_channel',
                            data: {
                                id: request.id,
                                result: "success",
                                data: {txid, txHex},
                            },
                        })
                    } else {
                        let utxo = {
                            txId: txid,
                            outputIndex: tx.outputs.length - 1,
                            satoshis: tx.outputs[tx.outputs.length - 1].satoshis
                        }
                        chrome.runtime.sendMessage({
                            channel: 'sato_extension_background_channel',
                            data: {
                                id: request.id,
                                result: "success",
                                data: {txHex, routeCheckTxHex, utxo, txid},
                            },
                        })
                    }
                    window.close();
                } else {
                    // routerManager.gotoHome();
                    routerManager.goto('/payTokenResult',{
                        tokenInfo:this.tokenInfo,
                        to:this.receivers,
                        txid,
                        bsvPrice:this.bsvPrice,

                    })
                }
            } catch (e) {
                console.error(e)
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

<style scoped lang="scss">
.panel {
    text-align: center;

}

.title {
    font-size: 1.2em;
    font-weight: bold;
}

.token-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    .logo {
        width: 48px;
        height: 48px;
    }

    .right {
        padding-left: 16px;
    }
}

.genesis-container {
    margin-top: 10px;
}

.notice {
    margin: 4px 10px;
    //font-size: 12px;
}

.main-word {

    font-weight: bold;

}

.red {
    color: #cc0000;
}

.action-container {
    margin: 16px;

    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.receive-container {
    margin: 10px 0;
    background-color: whitesmoke;
    border-radius: 5px;
    padding: 8px;

    &.not-enough {
        border: 1px #cc0000 dashed;
    }

    .receive-item {
        .notice {
            margin: 4px;
        }
    }

    .block-line {
        margin: 8px 0;
        background-color: #ccc;
        height: 1px;
    }
}


.info {
    margin: 8px 0;
    display: flex;
    justify-content: space-between;

    &.fee-usd {
        color: #666;
        margin-top: -10px;
    }

    &.broadcast-info {
        //margin-top: 32px;
        //margin-bottom: 0;
        margin: 4px 0;
        color: #666;
        //justify-content: left;
        font-size: 12px;
    }
}
</style>



