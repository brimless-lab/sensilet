<template>
    <div class="panel">
        <div class="title" v-if="origin">{{ $t('popup.sign_tx_request') }}</div>
        <div class="pay-info" v-if="origin">
            <div class="origin">{{ origin }}</div>
        </div>
        <div class="tx-list">
            <div class="item" v-for="item in txDetailList">
                <div class="info">
                    <span>{{ $t('popup.tx_type') }}</span>
                    <span>{{ item.type }}
                    </span>

                </div>
                <div class="info">
                    <span>{{ $t('popup.receive_address') }}</span>
                    <span style="font-size: 12px">{{ item.address }}</span>
                </div>
                <div class="info">
                    <!--                    <span class="tag" v-if="item.isChange">{{$t("popup.change")}}:</span>-->
                    <!--                    <span v-else class="tag red">-->
                    <!--                        {{$t('popup.amount')}}-->
                    <!--                    </span>-->
                    <span>
                        {{ $t('popup.amount') }}
                    </span>

                    <CoinShow style="font-weight: bold;" :value="item.amount" :big-unit="item.symbol" :fixed="item.decimal" :decimal="item.decimal" show-big-unit/>
                </div>
            </div>
        </div>
        <div class="notice" v-if="hdPath">
            HdPath:{{hdPath}}
        </div>
        <div class="action-container" v-if="!isCreating">
            <a-button @click="cancel">{{ $t('popup.cancel') }}</a-button>
            <a-button type="primary" @click="commit">{{ $t('popup.commit') }}</a-button>
        </div>
        <a-spin v-else/>
    </div>
</template>

<script>

const urlParams = new URLSearchParams(window.location.hash.slice(1));
const origin = urlParams.get('origin');
const request = JSON.parse(urlParams.get('request'));
import CoinShow from "../components/CoinShow";
import txUtils from "../utils/txUtils"

export default {
    name: "Pay",
    components: {CoinShow},

    data() {

        return {
            isCreating: false,
            origin,
            fee: null,
            txHex: request.params.txHex,
            inputInfos: request.params.inputInfos,
            hdPath: request.params.hdPath,
            txDetailList: [],
            userAddress: walletManager.getMainAddress(),
            txTypeWord: txUtils.txTypeWord,
        }
    },
    async mounted() {

        let txDetail = txUtils.getTxInfo(this.txHex).outputs;
        // console.log(txDetail)

        let arr = [];

        for (let j = 0; j < txDetail.length; j++) {
            let temp = {};
            temp.type = txUtils.txTypeWord[txDetail[j].type];


            if (txDetail[j].type === txUtils.txType.SENSIBLE_FT) {

                let data = txDetail[j].data

                if (typeof data === 'string')
                    data = JSON.parse(data)
                if (typeof data.tokenAmount === 'string')
                    data.tokenAmount = parseInt(data.tokenAmount);
                temp.type += `(${data.tokenName.replaceAll('\u0000', '')})`;
                temp.amount = data.decimalNum > 0 ? (data.tokenAmount / Math.pow(10, data.decimalNum)).toFixed(data.decimalNum) : data.tokenAmount;
                temp.address = showLongString(data.tokenAddress, 20);
                temp.symbol = data.tokenSymbol.replaceAll('\u0000', '');
                temp.decimal = data.decimalNum

                temp.isChange = data.tokenAddress === this.userAddress;

            } else {
                // if(txDetail[j].address === this.userAddress){
                //     temp.type += `(${this.$t('popup.change')})`
                // }
                temp.isChange = txDetail[j].address === this.userAddress;

                temp.amount = txDetail[j].satoshis;
                temp.address = showLongString(txDetail[j].address, 20);
                temp.symbol = "BSV";
                temp.decimal = 8;
            }
            // console.log(txDetail[j])
            // console.log(temp)
            arr.push(temp)
        }

        this.txDetailList = arr

    },
    methods: {
        cancel(result = 'cancel') {
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
                this.isCreating = true;
                await sleep(100);
                let wif = this.hdPath ? walletManager.getWif(this.hdPath) : walletManager.getMainWif();
                console.log(wif)
                chrome.runtime.sendMessage({
                    channel: 'sato_extension_background_channel',
                    data: {
                        id: request.id,
                        result: "success",
                        data: txUtils.signTransaction(wif, this.txHex, this.inputInfos),
                    },
                });
                window.close();

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
}

.action-container {
    margin-top: 10px;

    display: flex;
    justify-content: space-between;
}

.tx-list {
    background-color: whitesmoke;
    border-radius: 5px;
    padding: 8px;

    &:not(:first-child) {
        margin-top: 10px;
    }

    .item {
        margin-top: 10px;

        .info {
            display: flex;
            justify-content: space-between;

            .tag {
                border-radius: 4px;
                //color: white;
                color: green;
                font-weight: bold;

                &.red {
                    color: red;
                }
            }

            .address {
                font-size: 12px;
            }
        }

    }
}
</style>
