<template>
    <div class="panel-container">

        <div class="panel">
            <div class="title" v-if="origin">{{ $t('popup.sign_tx_request') }}</div>
            <div class="pay-info" v-if="origin">
                <div class="origin">{{ origin }}</div>
            </div>
            <div class="tx-container">
                <div class="type-choose-container">
                    <a-radio-group v-model:value="showPutType" button-style="solid" size="small">
                        <a-radio-button value="inputs"> Inputs</a-radio-button>
                        <a-radio-button value="outputs">Outputs</a-radio-button>
                    </a-radio-group>
                </div>
                <div class="tx-list" v-if="showPutType==='inputs'">
                    <div class="item" v-for="item in inputInfosShow">
                        <div class="info">
                            <span>{{ $t('popup.tx_type') }}</span>
                            <span>{{ item.type }}
                    </span>

                        </div>
                        <div class="info">
                            <span>{{ $t('popup.address') }}</span>
                            <span style="font-size: 12px">{{ item.address }}
                                <!--                        <span class="mine-tag" v-if="item.isChange">{{$t("popup.mine")}}</span>-->
                    </span>
                        </div>
                        <div class="info">
                    <span>
                        {{ $t('popup.amount') }}
                    </span>
                            <CoinShow style="font-weight: bold;" :value="item.amount" :big-unit="item.symbol" :fixed="item.decimal" :decimal="item.decimal" show-big-unit/>
                        </div>
                    </div>
                </div>
                <div class="tx-list" v-else>
                    <div class="item" v-for="item in txDetailList">
                        <div class="info">
                            <span>{{ $t('popup.tx_type') }}</span>
                            <span>{{ item.type }}
                    </span>

                        </div>
                        <div class="info">
                            <span>{{ $t('popup.address') }}</span>
                            <span style="font-size: 12px">{{ item.address }}
                        <span class="mine-tag" v-if="item.isChange">{{ $t("popup.mine") }}</span>
                    </span>
                        </div>
                        <div class="info">
                            <!--                                        <span class="tag" v-if="item.isChange">{{$t("popup.change")}}:</span>-->
                            <!--                                        <span v-else class="tag red">-->
                            <!--                                            {{$t('popup.pay_amount')}}-->
                            <!--                                        </span>-->
                            <span>
                        {{ $t('popup.amount') }}
                    </span>

                            <CoinShow style="font-weight: bold;" :value="item.amount" :big-unit="item.symbol" :fixed="item.decimal" :decimal="item.decimal" show-big-unit/>
                        </div>
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
            showPutType: 'outputs',
            isCreating: false,
            origin,
            fee: null,
            txHex: request.params.txHex,
            inputInfos: request.params.inputInfos,
            inputInfosShow: null,
            txDetailList: [],
            userAddress: walletManager.getMainAddress(),
            txTypeWord: txUtils.txTypeWord,
        }
    },
    async mounted() {
        // console.log(this.inputInfos)
        this.inputInfosShow = this.inputInfos.map(item => {
            let temp = txUtils.getInputsInfo(item.scriptHex, item.satoshis);

            if (temp.type === txUtils.txType.SENSIBLE_FT) {
                temp.type = txUtils.txTypeWord[temp.type];
                let data = temp.data

                if (typeof data === 'string')
                    data = JSON.parse(data)
                if (typeof data.tokenAmount === 'string')
                    data.tokenAmount = parseInt(data.tokenAmount);
                temp.type += `(${data.tokenName.replaceAll('\u0000', '')})`;
                temp.amount = data.tokenAmount;
                temp.address = showLongString(data.tokenAddress, 10);
                temp.symbol = data.tokenSymbol.replaceAll('\u0000', '');
                temp.decimal = data.decimalNum

                temp.isChange = data.tokenAddress === this.userAddress;

            } else {
                temp.type = txUtils.txTypeWord[temp.type];

                temp.isChange = temp.address === this.userAddress;
                temp.amount = temp.satoshis;
                temp.address = showLongString(temp.address, 10);
                temp.symbol = "BSV";
                temp.decimal = 8;
            }

            return temp
        })


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
                temp.amount = data.tokenAmount;
                temp.address = showLongString(data.tokenAddress, 10);
                temp.symbol = data.tokenSymbol.replaceAll('\u0000', '');
                temp.decimal = data.decimalNum

                temp.isChange = data.tokenAddress === this.userAddress;


                // console.log(temp, '### temp')

            } else {
                // if(txDetail[j].address === this.userAddress){
                //     temp.type += `(${this.$t('popup.change')})`
                // }
                temp.isChange = txDetail[j].address === this.userAddress;

                temp.amount = txDetail[j].satoshis;
                temp.address = showLongString(txDetail[j].address, 10);
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

                chrome.runtime.sendMessage({
                    channel: 'sato_extension_background_channel',
                    data: {
                        id: request.id,
                        result: "success",
                        data: txUtils.signTransaction(this.txHex, this.inputInfos),
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

.type-choose-container {
    padding-top: 10px;
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

.tx-container {
    background-color: whitesmoke;
    border-radius: 5px;
    margin-top: 5px;
}

.tx-list {

    padding: 8px;

    max-height: 320px;
    overflow-y: auto;


    .item {


        &:not(:first-child) {
            margin-top: 10px;
        }

        .info {
            display: flex;
            justify-content: space-between;

            .mine-tag {
                border-radius: 4px;
                background-color: green;
                color: white;
                padding: 1px 2px;
            }

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
