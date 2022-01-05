<template>
    <div class="panel-container">

        <div class="panel">
            <div class="title" v-if="origin">{{ $t('popup.sign_tx_request') }}</div>
            <div class="pay-info" v-if="origin">
                <div class="origin">{{ origin }}</div>
            </div>
            <div class="tx-list" v-for="txDetail in txDetailList">
                <div class="item" v-for="item in txDetail">
                    <div class="info">
                        <span>{{ $t('popup.tx_type') }}</span>
                        <span>{{ item.type }}</span>
                    </div>
                    <div class="info">
                        <span>{{ $t('popup.receive_address') }}</span>
                        <span style="font-size: 12px">{{ item.address }}</span>
                    </div>
                    <div class="info">
                        <span>{{ $t('popup.pay_amount') }}</span>
                        <CoinShow :value="item.amount" :big-unit="item.symbol" :fixed="item.decimal" :decimal="item.decimal" show-big-unit/>
                    </div>
                </div>
            </div>

        </div>
        <div class="action-panel">
            <div class="action-container" v-if="!isCreating">
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
import txUtils from "../utils/txUtils"

export default {
    name: "Pay",
    components: {CoinShow},

    data() {

        return {
            isCreating: false,
            origin,
            fee: null,
            list: null,
            txDetailList: [],
            userAddress: walletManager.getMainAddress(),
            txTypeWord: txUtils.txTypeWord,
        }
    },
    async mounted() {
        this.list = bg.signTxList;
        bg.signTxList = null;   //读取后置空此值

        // console.log(this.list)

        let list = this.list;
        if (!list || list.length <= 0)
            return this.cancel('list is empty')

        let txHexMap = {}
        for (let i = 0; i < list.length; i++) {

            if (txHexMap[list[i].txHex])
                continue

            txHexMap[list[i].txHex] = true;

            let txDetail = txUtils.getTxInfo(list[i].txHex).outputs;
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
                    temp.type += `(${data.tokenName.replaceAll('/u000', '')})`;
                    temp.amount = data.decimalNum > 0 ? (data.tokenAmount / Math.pow(10, data.decimalNum)).toFixed(data.decimalNum) : data.tokenAmount;
                    temp.address = showLongString(data.tokenAddress, 10);
                    temp.symbol = data.tokenSymbol.replaceAll('/u000', '');
                    temp.decimal = data.decimalNum
                } else {

                    temp.amount = txDetail[j].satoshis;
                    temp.address = showLongString(txDetail[j].address, 10);
                    temp.symbol = "BSV";
                    temp.decimal = 8;
                }
                arr.push(temp)
            }

            this.txDetailList.push(arr)
        }
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
            let list = this.list;
            try {
                this.isCreating = true;

                await sleep(100);

                let sigList = [];
                for (let i = 0; i < list.length; i++) {
                    sigList[i] = txUtils.sign(walletManager.getMainWif(), list[i])
                }

                chrome.runtime.sendMessage({
                    channel: 'sato_extension_background_channel',
                    data: {
                        id: request.id,
                        result: "success",
                        data: {
                            sigList
                        },
                    },
                });
                window.close();

            } catch (e) {
                console.error(e)
                if (typeof e === 'string')
                    return antMessage.error(e)
                antMessage.error(e && e.message)
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

            .address {
                font-size: 12px;
            }
        }

    }
}
</style>
