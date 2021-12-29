<template>
    <div class="panel-container">
        <div class="panel">
            <div class="title" v-if="origin">{{ $t('popup.pay_request', ['BSV']) }}</div>
            <div class="pay-info" v-if="origin">
                <div class="origin">{{ origin }}</div>
            </div>
            <div class="title">
                {{ $t('popup.send_asset', ['BSV']) }}
            </div>
            <div class="token-info">
                <img class="logo" src="../assets/bsv-icon.svg" alt="">
                <div class="right">
                    <div class="info" style="margin-bottom: 0">
                        <div class="key main-word" style="font-size: 1.25em;font-weight: bold">BSV</div>
                        <div class="value"></div>
                    </div>
                </div>
            </div>
            <div class="receive-container" style="margin-top: 20px" :class="{'not-enough':rest<0}">
                <div class="info">
                    <div class="key">
                        From:{{ mineAddress }}
                    </div>
                    <div class="value" v-if="balance>=0">
                        <CoinShow :value="balance" big-unit="BSV" :decimal="8" fixed="8" show-big-unit is-bold-amount/>
                    </div>
                    <div class="value" v-else>
                        <a-spin size="small"></a-spin>
                    </div>
                </div>
                <div class="receive-item" v-for="item in receivers">
                    <div class="info">
                        <div class="key">To:{{ item.addressShow }}</div>
                        <div class="value red">
                            <CoinShow :value="item.amount" big-unit="BSV" :decimal="8" fixed="8" show-big-unit is-bold-amount/>
                        </div>
                    </div>
                    <div class="info fee-usd">
                        <div class="key"></div>
                        <div class="value" style="color: #666;" v-if="item.usd">
                            {{item.usd}}  <span class="unit" style="margin-left: 4px">USD</span>
                        </div>
                        <div class="value" v-else>
                            <a-spin size="small"></a-spin>
                        </div>
                    </div>
                </div>
                <div class="block-line"></div>
                <div class="info">
                    <div class="key">{{ $t('popup.balance_2') }}</div>
                    <div class="value" v-if="rest=>0">
                        <CoinShow :value="rest" big-unit="BSV" :decimal="8" fixed="8" show-big-unit is-bold-amount/>
                    </div>
                    <div class="value" v-else style="color:#cc0000;">
                        BSV not enough
                    </div>
                </div>
            </div>
            <div class="receive-container">
                <div class="info">
                    <div class="key">{{ $t('popup.fee') }}</div>
                    <div class="value" v-if="fee">
                        <CoinShow :value="fee" big-unit="BSV" :decimal="8" fixed="8" show-big-unit/>
                    </div>
                    <div class="value" v-else><a-spin size="small"></a-spin></div>
                </div>
                <div class="info fee-usd" v-if="feeUsd">
                    <div class="key"></div>
                    <div class="value" style="color: #666;">
                        {{ feeUsd }}  <span class="unit" style="margin-left: 4px">USD</span>
                    </div>
                </div>
            </div>

        </div>
        <div class="action-panel">

            <div class="action-container" v-if="!isCreating">
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

import apiUtils from "@/utils/apiUtils";

const urlParams = new URLSearchParams(window.location.hash.slice(1));
const origin = urlParams.get('origin');
const request = JSON.parse(urlParams.get('request'));
import CoinShow from "../components/CoinShow";

export default {
    name: "Pay",
    components: {CoinShow},

    data() {
        let data = {
            isCreating: false,
            origin,
            fee: null,
            balance: -1,
            mineAddress: showLongString(walletManager.getMainAddress()),
            rest: 0,
        };

        let routerData = routerManager.data;
        if (routerData) {
            data.receivers = [{amount: routerData.amount, address: routerData.address, addressShow: showLongString(routerData.address)}]
            data.broadcast = routerData.broadcast;
        } else {
            request.params.receivers.forEach(item => {
                item.addressShow = showLongString(item.address)
            });
            data.receivers = request.params.receivers;
            data.broadcast = request.params.broadcast;
            data.utxo = request.params.utxo;
        }

        data.total = data.receivers.reduce((total, item) => total + item.amount, 0)

        return data
    },
    async mounted() {
        // let op = "";
        // this.fee = await nftManager.sensibleNft.getIssueFee(op);
        let bsvPrice = (await apiUtils.getBsvPrice()).data

        let {total} = await walletManager.getBsvBalance();
        this.balance = total;
        let temp = total;
        for (let i = 0; i < this.receivers.length; i++) {
            temp -= this.receivers[i].amount
            this.receivers[i].usd = (this.receivers[i].amount / Math.pow(10, 8) * bsvPrice).toFixed(2);

        }
        this.rest = temp;


        let {fee} = await walletManager.payArray(this.receivers, false).catch(e => {
            console.log(e)
            return 0
        });
        this.fee = fee;
        this.feeUsd = (this.fee / Math.pow(10, 8) * bsvPrice).toFixed(2);

    },
    methods: {
        cancel() {
            if (this.origin) {
                chrome.runtime.sendMessage({
                    channel: 'sato_extension_background_channel',
                    data: {
                        id: request.id,
                        result: "cancel"
                    },
                });
                window.close();
            } else {
                routerManager.gotoHome();
            }
        },
        async commit() {
            try {
                if (this.total > this.balance) {
                    return antMessage.error(this.$t('popup.error_balance'))
                }

                this.isCreating = true;
                // console.log('commit')
                let {rawHex, txid, tx} = await walletManager.payArray(this.receivers, this.broadcast);

                if (this.origin) {
                    if (this.broadcast) {
                        //等待2秒
                        await sleep(2000)
                        chrome.runtime.sendMessage({
                            channel: 'sato_extension_background_channel',
                            data: {
                                id: request.id,
                                result: "success",
                                data: {txid, txHex: rawHex,},
                            },
                        });
                    } else {
                        //不广播的情况，还需把utxo返回
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
                                data: {txHex: rawHex, utxo},
                            },
                        });
                    }

                    window.close();
                } else {
                    antMessage.success('Success')
                    await sleep(1000)
                    // routerManager.gotoHome();
                    routerManager.goto('/payResult',{
                        from:this.mineAddress,
                        to:this.receivers,
                        txid,
                        bsvPrice:this.bsvPrice,
                    })
                }
            } catch (e) {
                console.error(e)
                antMessage.error(e.message)
            } finally {
                this.isCreating = false;
            }
        }
    }
}
</script>

<style scoped lang="scss">
.panel {
    text-align: center;

}

.token-info {
    margin-top: 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    .logo {
        border-radius: 50%;
        width: 48px;
        height: 48px;
    }

    .right {
        padding-left: 16px;
    }
}
.title {
    font-size: 1.2em;
    font-weight: bold;
}

.genesis-container {
    margin-top: 10px;
}

.notice {
    margin: 4px 10px;
    //font-size: 12px;
    &.main-word {
        color: #222;
        font-weight: bold;
    }
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

    &.fee-usd{
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

.red {
    color: #cc0000;
}
</style>
