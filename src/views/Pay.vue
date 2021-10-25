<template>
    <div class="panel">
        <div class="title" v-if="origin">{{$t('popup.pay_request',['BSV'])}}</div>
        <div class="pay-info" v-if="origin">
            <div class="origin">{{ origin }}</div>
        </div>
        <div class="receive-container">
        <div class="receive-item" v-for="item in receivers">
            <div class="notice">{{$t('popup.receive_address')}} {{ item.address }}</div>
            <div class="notice main-word">{{$t('popup.amount')}}
                <CoinShow :value="item.amount" big-unit="BSV" :decimal="8" fixed="8" show-big-unit/>
            </div>
        </div>
        </div>

        <div class="notice">{{$t('popup.balance')}}
            <CoinShow :value="balance" big-unit="BSV" :decimal="8" fixed="8" show-big-unit/>
        </div>
        <div class="notice">{{$t('popup.fee')}}
            <CoinShow :value="fee" big-unit="BSV" :decimal="8" fixed="8" show-big-unit/>
        </div>
        <div class="notice">{{$t('popup.broadcast')}} {{ broadcast ? $t('popup.yes') : $t('popup.no') }}</div>
        <div class="action-container" v-if="!isCreating">
            <a-button @click="cancel">{{$t('popup.cancel')}}</a-button>
            <a-button type="primary" @click="commit">{{$t('popup.commit')}}</a-button>
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
    name: "Pay",
    components: {CoinShow},

    data() {
        let data = {
            isCreating: false,
            origin,
            fee: null,
            balance: 0
        };

        let routerData = routerManager.data;
        if (routerData) {
            data.receivers = [{amount: routerData.amount, address: routerData.address}]
            data.broadcast = routerData.broadcast;
        } else {
            data.receivers = request.params.receivers;
            data.broadcast = request.params.broadcast;
        }

        data.total = data.receivers.reduce((total,item)=>total+item.amount,0)

        return data
    },
    async mounted() {
        // let op = "";
        // this.fee = await nftManager.sensibleNft.getIssueFee(op);
        let {total} = await walletManager.getBsvBalance();
        this.balance = total;

        let {fee} = await walletManager.payArray(this.receivers, false).catch(e=>{
            console.log(e)
            return 0
        });
        this.fee = fee;
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
                if(this.total > this.balance){
                    return antMessage.error( this.$t('popup.error_balance'))
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
                                data: {txid},
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
                    await sleep(2000)
                    routerManager.gotoHome();
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

.title {
    font-size: 1.2em;
    font-weight: bold;
}

.genesis-container {
    margin-top: 10px;
}

.notice {
    margin: 10px;
    &.main-word {
        color: #222;
        font-weight: bold;
    }
}

.action-container {
    margin-top: 10px;

    display: flex;
    justify-content: space-between;
}

.receive-container{
    margin-top: 10px;
    background-color: whitesmoke;
    border-radius: 5px;
    padding: 4px;

    .receive-item{
        .notice{
            margin: 4px;
        }
    }
}
</style>
