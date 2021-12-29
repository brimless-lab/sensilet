<template>
    <div class="panel-container">
        <div class="panel">
            <div style="color: green;font-size: 24px;margin-top: 20px">
                Success!
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

            <div class="receive-container" style="margin-top: 20px">

                <div class="receive-item" v-for="item in to">
                    <div class="info">
                        <div class="key">To:{{ item.addressShow }}</div>
                        <div class="value red">
                            <CoinShow :value="item.amount" big-unit="BSV" :decimal="8" fixed="8" show-big-unit is-bold-amount/>
                        </div>
                    </div>
                    <div class="info fee-usd">
                        <div class="key"></div>
                        <div class="value" style="color: #666;" v-if="item.usd">
                            <span>{{ item.usd }}</span><span class="unit" style="margin-left: 4px">USD</span>
                        </div>
                        <div class="value" v-else>
                            <a-spin size="small"></a-spin>
                        </div>
                    </div>
                </div>
                <div class="block-line"></div>
                <div class="info">
                    <div class="key">Status</div>
                    <div class="value">
                        <a :href="`https://blockcheck.info/tx/${txid}`" target="_blank" rel="noopener">
                            {{ $t("popup.view_in_explorer")}}
                        </a>
                    </div>
                </div>
                <div class="info">
                    <div class="key">TXID</div>
                    <div class="value copy" id="icon-copy" :data-clipboard-text="txid">
                        {{txidShow}}
                    </div>
                </div>
            </div>
            <div class="receive-container">
                <div class="info">
                    <div class="key">{{ $t('popup.fee') }}</div>
                    <div class="value" v-if="fee">
                        <CoinShow :value="fee" big-unit="BSV" :decimal="8" fixed="8" show-big-unit/>
                    </div>
                    <div class="value" v-else>
                        <a-spin size="small"></a-spin>
                    </div>
                </div>
                <div class="info fee-usd" v-if="feeUsd">
                    <div class="key"></div>
                    <div class="value" style="color: #666;">
                        {{ feeUsd }} <span class="unit" style="margin-left: 4px">USD</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="action-panel">
            <div class="action-container" v-if="!isCreating">
                <div></div>
                <a-button type="primary" @click="commit">{{ $t('popup.done') }}</a-button>
            </div>
            <a-spin v-else/>
        </div>
    </div>
</template>

<script>

import apiUtils from "@/utils/apiUtils";
import CoinShow from "../components/CoinShow";
import Clipboard from "clipboard";

let clip = null;

export default {
    name: "PayResult",
    components: {CoinShow},

    data() {
        let routerData = routerManager.data;
        if (!routerData)
            routerManager.gotoHome();

        return {
            from: routerData.from,
            to: routerData.to,
            txid: routerData.txid,
            txidShow:showLongString(routerData.txid,20),
            bsvPrice: routerData.bsvPrice,
            fee: null,
            feeUsd: null,
        }
    },
    async mounted() {
        clip = new Clipboard('#icon-copy');
        clip.on('success', e => {
            antMessage.success(this.$t('account.clip', [`TXID(${showLongString(e.text,20)})`]));
        });

        let txInfo = (await apiUtils.getTransitionInfo(this.txid)).data
        console.log(txInfo, 'txinfo')
        if (txInfo) {
            let {inSatoshi, outSatoshi} = txInfo;
            this.fee = inSatoshi - outSatoshi;
            if (!this.bsvPrice)
                this.bsvPrice = (await apiUtils.getBsvPrice()).data
            if (this.bsvPrice)
                this.feeUsd = (this.fee / Math.pow(10, 8) * this.bsvPrice).toFixed(2);


        }
    },
    methods: {

        async commit() {
            routerManager.gotoHome();
        }
    },
    unmounted() {
        //卸载组件时，销毁
        clip.destroy()
    },

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
    align-items: center;

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
    a{
        padding: 2px 4px;

    }
    .copy{
        color: #527195;
        cursor: pointer;
        border-radius: 5px;
        padding: 2px 4px;
        &:hover{
            background-color: rgba(0, 0, 0, .05);
        }
    }
}

.red {
    color: #cc0000;
}
</style>
