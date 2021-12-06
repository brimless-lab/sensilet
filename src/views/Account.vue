<template>
    <div class="account-container">
        <div>
            <div class="connect-container-line">
                <div class="connect-container" :class="{'connected':$store.state.isConnected}" @click="gotoConnectManagement">
                    <div class="connect-point">
                        <span></span>
                    </div>
                    <div class="word">{{ $t($store.state.isConnected ? "account.connected" : "account.not_connected") }}</div>
                </div>
            </div>
            <div class="account">
                <AccountChoose/>
            </div>
            <div class="panel">

                <div class="list" v-if="bsvAsset==null" style="text-align: center">
                    <a-spin/>
                </div>
                <div class="list" v-else>
                    <div class="bsv-item">
                        <div class="refresh-icon" :class="{'refreshing':isRefreshBsv}" @click="refreshBsv()">
                            <img src="../assets/icon-refresh.svg" alt="">
                        </div>
                        <div class="info">
                            <div class="balance">
                                <img src="../assets/bsv-icon.svg" alt="">
                                <a-spin v-if="bsvAsset.isRefreshingAmount"/>
                                <div v-else class="balance-container">
                                    <span>
                                        <span class="integer">{{ bsvAsset.showBalance.integer }}</span>
                                        <span class="decimal" v-if="bsvAsset.showBalance.decimal.length>0">.{{ bsvAsset.showBalance.decimal }}</span>
                                        <!--                                    {{ bsvAsset.balance.total / Math.pow(10, bsvAsset.decimal) }} -->
                                        <span style="margin-left: 4px;font-size: .85em">{{ bsvAsset.name }}</span>
                                    </span>
                                    <div class="price" v-if="bsvAsset.usd">$ {{ bsvAsset.usd }} USD</div>
                                </div>
                            </div>
                            <div class="address" id="icon-copy" :data-clipboard-text="$store.getters.address">
                                {{ bsvAsset.addressShow }}
                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0H1H9V1H1V9H0V0ZM2 2H11V11H2V2ZM3 3H10V10H3V3Z" fill="#989a9b"></path>
                                </svg>
                            </div>

                        </div>
                        <div class="action-container">
                            <a-button shape="round" @click="receive(bsvAsset)">
                                <template #icon>
                                    <img src="../assets/icon-qrcode.svg" alt="">
                                </template>
                                {{ $t('account.receive') }}
                            </a-button>
                            <a-button shape="round" @click="sendBsv(bsvAsset)">
                                <template #icon>
                                    <img src="../assets/icon-transfer.svg" alt="">
                                </template>
                                {{ $t('account.send') }}
                            </a-button>
                            <a-button shape="round" @click="openHistory(bsvAsset.address)">
                                <template #icon>
                                    <img src="../assets/icon-history.svg" alt="">
                                </template>
                                {{ $t('account.history') }}
                            </a-button>
                        </div>
                    </div>
                </div>
            </div>
            <TokenPanel v-model:showQr="showQr"></TokenPanel>
            <NftPanel></NftPanel>
            <div class="panel">
                <div class="panel-top">
                    <div class="title"> {{ $t('account.hot_app') }}</div>
                </div>
                <div class="app-list" v-if="appList!=null && canShowApp">
                    <!--                <div class="app-list" v-if="false">-->
                    <div class="item" v-for="item in appList">
                        <img :src="item.logo" alt="">
                        <div class="info">
                            <div class="title">
                                {{ item.name }}
                                <img class="tag" v-if="item.tag==='NEW'" src="../assets/icon-new.svg"/>
                            </div>
                            <div class="desc ellipsis" :title="item.desc">{{ item.desc }}
                            </div>
                        </div>
                        <a class="enter" :href="item.url" target="_blank">
                            {{ $t('account.open') }}
                        </a>
                    </div>
                    <!--                    <div class="item">-->
                    <!--                        and more ...-->
                    <!--                    </div>-->
                </div>
                <div v-else-if="!canShowApp" class="list">
                    <div class="empty">
                        {{ $t('account.not_display_notice') }}
                    </div>
                </div>
                <div class="list" v-else style="text-align: center">
                    <a-spin style="padding:16px"></a-spin>
                </div>
            </div>
        </div>

        <Footer></Footer>
    </div>

    <a-modal v-model:visible="showTransPanel" :closable=false @cancel="clearTransferInfo">

        <div class="trans-info-container">
            <div class="title">
                Send {{ isTransBSV ? "BSV" : transInfo.name }}
            </div>
            <div class="small-title">
                You are sending <span> BSV</span> <img class="coin-logo" src="../assets/bsv-icon.svg" alt="">

            </div>
            <AddressInput v-if="transStep===0" @next="onTransNext" ref="addressInput" transType="BSV"></AddressInput>
            <div v-else>
                <div style="margin-top: 8px">
                    Address: {{ transAddress }}
                </div>
                <div class="input-container" :class="{'has-error':inputErrorNotice!==''}">
                    <a-input v-model:value="transAmount" @change="transAmountChange" type="number"
                             :placeholder="$t('account.input_amount',[transType==='BSV'? 'BSV':(transInfo.unit||transInfo.symbol)])"/>
                    <div class="notice">{{ inputErrorNotice }}</div>
                </div>
                <div class="notice">
                    <div class="balance" v-if="transInfo">
                        <div class="key">
                            {{ $t('account.balance') }} :
                        </div>
                        <div class="amount">
                            {{ transBalance }} {{ transUnit }}
                        </div>
                        <div class="action" @click="sendAll">{{ $t('account.send_all') }}</div>
                    </div>
                    <div class="fee">
                        <div class="key">
                            {{ $t('account.fee') }}:
                        </div>
                        <div class="amount">
                            <span v-if="!transFeeLoading">{{ transFee }}</span>
                            <a-spin size="small" v-else/>
                            BSV
                        </div>
                        <div class="action"></div>
                    </div>
                </div>
            </div>
        </div>
        <template v-slot:footer>
            <div class="action-container">
                <a-button @click="transBack">{{ transStepBackWord }}</a-button>
                <a-button type="primary" @click="transNext">{{ transStepNextWord }}</a-button>
            </div>
        </template>

    </a-modal>

    <a-modal v-model:visible="showQr" :footer="null" :closable=false>
        <div style="font-size: 18px;text-align: center;margin-bottom: 16px">{{ $t('account.qr_title') }}</div>
        <div style="display: flex;flex-direction: column;align-items: center">
            <QrcodeVue :value="$store.getters.address" :size="200" level="H"/>
            <p class="copy-address" style="margin-top: 20px;" id="address-copy" :data-clipboard-text="$store.getters.address">
                {{ $store.getters.address }}
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0H1H9V1H1V9H0V0ZM2 2H11V11H2V2ZM3 3H10V10H3V3Z" fill="#989a9b"></path>
                </svg>
            </p>
            <p style="color: #999;font-size: 12px">
                {{ $t('account.qr_notice') }}
            </p>
        </div>
    </a-modal>
</template>

<script>
import PlusOutlined from '@ant-design/icons-vue/lib/icons/PlusOutlined'
import LinkOutlined from '@ant-design/icons-vue/lib/icons/LinkOutlined'

import QrcodeVue from 'qrcode.vue'
import Clipboard from "clipboard";

import AccountChoose from "../components/AccountChoose";
import Footer from "../components/Footer";
import TokenPanel from "@/components/TokenPanel";

import apiUtils from '../utils/apiUtils';
import AddressInput from "@/components/AddressInput";
import NftPanel from "@/components/NftPanel";

let clip = null;
let clip2 = null;

export default {
    name: "Account",
    components: {
        NftPanel,
        AddressInput,
        TokenPanel,
        AccountChoose,
        Footer,
        QrcodeVue, PlusOutlined, LinkOutlined
    },
    data() {
        return {
            // extName: chrome.i18n.getMessage("extName"),
            asset: [],
            appList: null,
            tokenList: null,
            mainAddress: walletManager.getMainAddress(),
            showTransPanel: false,
            transAddress: "",
            transAmount: null,
            transInfo: null,
            transType: "BSV",
            transUnit: "",
            transFee: 0,
            transFeeLoading: false,
            transBalance: 0,
            accountMode: walletManager.getAccountMode(),
            btnLoading: false,
            showQr: false,
            showRedPoint: false,

            isRefreshBsv: false,
            bsvAsset: {
                name: 'BSV',
                balance: {},
                decimal: 8,
                isRefreshingAmount: true,
                address: walletManager.getMainAddress(),
            },
            canShowApp: true,
            transStep: 0,
            transStepNextWord: this.$t('account.next'),
            transStepBackWord: this.$t('account.cancel'),
            inputErrorNotice: "",

        }
    },
    computed: {
        isTransBSV() {
            return this.transType === "BSV"
        }
    },
    beforeCreate() {

    },
    async created() {

        // this.$store.commit("initSettingChecked")

        this.initAsset();

        this.initAppList();

    },
    mounted() {
        clip = new Clipboard('#icon-copy');
        clip.on('success', e => {
            antMessage.success(this.$t('account.clip', [e.text]));
        });

        clip2 = new Clipboard('#address-copy');
        clip2.on('success', e => {
            antMessage.success(this.$t('account.clip', [e.text]));
        });

        //    获取版本号和公告
        // this.initVersionAndNotice()
    },
    unmounted() {
        //卸载组件时，销毁
        clip.destroy()
        clip2.destroy()
    },

    methods: {

        async initAsset() {

            this.bsvAsset.addressShow = showLongString(this.bsvAsset.address, 10)

            await this.refreshBsv()


        },
        async refreshBsv() {
            if (this.isRefreshBsv)
                return

            this.isRefreshBsv = true

            try {
                //获取余额
                let balance = await walletManager.getBsvBalance();

                this.bsvAsset.balance = {
                    total: balance.confirmed + balance.unconfirmed,
                    confirmed: balance.confirmed,
                    unconfirmed: balance.unconfirmed,
                };
                await sleep(500)

                this.bsvAsset.showBalance = showDecimal(this.bsvAsset.balance.total, 8, 8)

                this.bsvAsset.isRefreshingAmount = false;

                //    获取一下币价
                let bsvPrice = (await apiUtils.getBsvPrice()).data
                this.bsvAsset.usd = (this.bsvAsset.balance.total / Math.pow(10, this.bsvAsset.decimal) * bsvPrice).toFixed(2);


            } catch (e) {
                console.error(e)
            }
            this.isRefreshBsv = false

        },

        async initAppList() {
            try {
                let temp = localStorage.getItem('appList', data);
                if (temp)
                    this.appList = JSON.parse(temp);
            } catch (e) {
                console.error(e)
            }
            let {data, canShow} = await apiUtils.getApplicationList();
            this.canShowApp = canShow;
            if (canShow) {
                localStorage.setItem('appList', JSON.stringify(data));
                this.appList = data;
            } else {
                localStorage.setItem('appList', "");
                this.appList = [];
            }
        },
        receive(item) {
            this.showQr = true
        },
        transNext() {
            console.log('#1')

            if (this.transStep === 0) {
                this.$refs.addressInput.onOk();
            } else {
                this.transfer();
            }
        },
        onTransNext(address) {
            console.log('aaaa')
            this.transStep = 1;
            this.transAddress = address;
            this.transStepNextWord = this.$t('account.ok')
            this.transStepBackWord = this.$t('account.back')

        },
        transBack() {
            this.transStepNextWord = this.$t('account.next')
            this.transStepBackWord = this.$t('account.cancel')

            if (this.transStep === 1) {
                this.transStep = 0;
            } else {
                this.clearTransferInfo()
            }
        },

        clearTransferInfo() {
            this.transAddress = "";
            this.transAmount = null;
            this.transFeeLoading = false;
            this.transFee = 0;
            this.transStep = 0;
            this.showTransPanel = false;

            if(this.$refs.addressInput)
                this.$refs.addressInput.reset();
        },

        async sendBsv(item) {
            this.transType = 'BSV';
            this.transInfo = item;
            this.transUnit = "BSV";
            this.transBalance = item.balance.total / Math.pow(10, item.decimal);
            this.showTransPanel = true;
        },
        async sendAll() {
            let {amount, fee} = await walletManager.getSendAllInfo(walletManager.getMainWif());

            this.transAmount = amount / Math.pow(10, 8);
            this.transFee = fee / Math.pow(10, 8);

        },

        transAmountChange(value) {

            if (this.transAmount * Math.pow(10,8) > this.transInfo.balance.total)
                return this.inputErrorNotice=this.$t('account.balance_not_enough')
            else
                this.inputErrorNotice = "";

            if (this.transAmount > 0 && walletManager.checkBsvAddress(this.transAddress)) {
                this.calcTransFee();
            }
        },
        async calcTransFee() {
            if (this.transFeeLoading)
                return
            this.transFeeLoading = true;
            await sleep(100);
            try {
                let amount = Math.round(parseFloat(this.transAmount) * Math.pow(10, this.transInfo.decimal));
                // console.log(amount)
                let {fee, isInvalid} = await walletManager.payArray([{
                    address: this.transAddress,
                    amount,
                }], false)
                if (!isInvalid) {
                    fee = fee / Math.pow(10, 8)
                    this.transFee = fee;
                } else {
                    this.transFee = "Invalid";
                }

            } catch (e) {
                console.log(e)
                this.transFee = "Invalid"
            } finally {
                this.transFeeLoading = false;
            }
        },

        async transfer() {

            let amount = this.transAmount;
            console.log('amount', amount)
            if (!amount || isNaN(amount))
                return antMessage.error(this.$t('account.amount_error'))

            switch (this.transType) {
                case "BSV":
                    amount = Math.round(parseFloat(amount) * Math.pow(10, 8));
                    if (amount <= 0)
                        return antMessage.error(this.$t('account.amount_error_2'))
                    if (amount > this.transInfo.balance.total)
                        return antMessage.error(this.$t('account.balance_not_enough'))

                    routerManager.goto('/pay', {
                        broadcast: true,
                        address: this.transAddress,
                        amount,
                    });
                    break;
                case "TOKEN":

                    amount = Math.round(parseFloat(amount) * Math.pow(10, this.transInfo.decimal));
                    if (amount <= 0)
                        return antMessage.error(this.$t('account.amount_error_2'))
                    if (amount > this.transInfo.balance)
                        return antMessage.error(this.$t('account.balance_not_enough'))

                    this.btnLoading = true;

                    //获取token utxo数
                    let utxoCount = await tokenManager.sensibleFt.getUtxoCount(this.transInfo.genesis, this.transInfo.codehash, walletManager.getMainAddress());
                    //获取bsv utxo数
                    let bsvUtxoCount = await walletManager.getBsvUtxoCount();
                    if (bsvUtxoCount > 3 || utxoCount >= 20) {
                        antMessage.warn(this.$t('popup.merge_notice'))
                        return routerManager.goFor('/merge', '/payToken', {
                            genesis: this.transInfo.genesis,
                            broadcast: true,
                            address: this.transAddress,
                            amount,
                        });
                    }
                    console.log(this.transInfo)
                    routerManager.goto('/payToken', {
                        genesis: this.transInfo.genesis,
                        codehash: this.transInfo.codehash,
                        broadcast: true,
                        address: this.transAddress,
                        amount,
                    });
                    break;
            }
        },
        seeTokenDetail({genesis, codehash}) {
            window.open(`https://blockcheck.info/ft/${codehash}/${genesis}`)
        },
        openHistory(address) {
            window.open(`https://blockcheck.info/address/${address}`)
        },
        async initVersionAndNotice() {
            let result = await apiUtils.getVersion();
            if (result && result.code === 200) {
                if (result.data.version) {
                    //    版本信息
                    this.$store.commit("refreshVersionCheck")
                    this.$store.commit("setVersionInfo", result.data.version)
                }
                if (result.data.notice) {
                    //    公告信息

                }
            }
        },
        gotoConnectManagement() {
            routerManager.goto('/connectManagement')
        },
    }
}
</script>

<style scoped lang="scss">

@import "../style/color";

.account-container {
    min-height: calc(100vh - 48px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: $main-bg;
}

.panel {
    padding: 0;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0px 8px 16px 0px rgb(0 0 0 / 7.5%);;
    transition: .25s;

    &:hover {
        box-shadow: 0px 12px 24px 0px rgb(0 0 0 / 15%);;
    }
}

.connect-container-line {
    max-width: 375px;
    margin: 0 auto;
    display: flex;
    align-items: flex-start;
    padding-left: 16px;
}

.connect-container {
    z-index: 1;

    display: flex;
    flex-direction: row;
    align-items: center;

    color: #999;
    padding: 2px 12px;
    margin: 8px 0 0 -4px;
    border-radius: 2em;

    &:hover {
        background-color: white;
        box-shadow: 0 2px 4px #ddd;
    }

    &:active {
        background-color: white;
        box-shadow: 0 1px 1px #ddd;
    }

    .word {
        font-size: 12px;
    }

    .connect-point {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 1px solid #999;
        margin-right: 10px;

        display: flex;
        justify-content: center;
        align-items: center;

        span {
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background-color: #4cd964;

            display: none;
        }
    }

    &.connected {
        .connect-point {
            border: 1px solid #4cd964;

            span {
                display: inline-block;
            }
        }
    }
}

.account {
    margin: 4px auto;
    padding: 0 16px;
    max-width: 375px;


    display: flex;
    align-items: center;
    justify-content: center;


    background-color: $main-bg;
    position: relative;

    .account-mode {
        position: absolute;
        right: 8px;
        color: #bbb;
    }
}

.panel-top {

    .type-choose {
        border-radius: 2em;
        overflow: hidden;

        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    .action-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-left: -8px;

        &.disable {

            opacity: 0.2;
            cursor: none;

            .add {
                cursor: default;
            }
        }

        .sort {

        }

        .add {
            cursor: pointer;
            padding: 4px 6px;
            border-radius: 5px;

            &:hover {
                background-color: rgba(0, 0, 0, .15);
            }

            img {
                width: 22px;
            }
        }


    }
}

.app-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-wrap: wrap;

    .item {
        box-sizing: border-box;
        width: calc(100% - 16px);
        height: 56px;
        padding: 8px;
        margin: 8px;
        background: #fff;
        border-radius: 8px;
        overflow: hidden;

        display: flex;
        align-items: center;
        justify-content: space-between;
        //box-shadow: 3px 3px 9px 0 rgba(0, 0, 0, 0.1);

        img {
            width: 36px;
            border-radius: 5px;
        }

        .info {
            flex: 1;
            margin-left: 16px;

            display: flex;
            flex-direction: column;

            .title {
                font-size: 16px;
                font-weight: bold;

                .tag {
                    height: 28px;
                    margin: -2px;
                    margin-top: -12px;
                }
            }

            .desc {
                font-size: 12px;
                width: 200px;
                color: #999;
            }

        }

        .enter {
            padding: 4px 16px;
            border-radius: 2em;
            background-color: #f1f2f3;
            font-weight: 700;
        }
    }
}

.list {

    .empty {
        padding: 16px;
        text-align: center;
        color: #999;
    }

    .item {
        cursor: pointer;
        border-bottom: #eee 1px solid;

        .info {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            align-items: center;

            &:active {
                background-color: #f5f5f5;
            }

            .left {
                width: 56px;
                display: flex;
                align-items: center;
                justify-content: center;

                img {
                    width: 48px
                }
            }

            .mid {
                flex-grow: 99;
                margin-right: 16px;

                .balance {
                    div {
                        display: flex;
                        justify-content: space-between;
                        margin-right: 8px;
                    }
                }

                .address {
                    color: $font-weaken;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    width: 260px;
                }

            }

            .right {
                margin-right: 8px;
                transition: .25s ease-in-out;

                span {
                    font-size: 12px;
                }

                &.actions {
                    display: flex;

                    .action {
                        padding: 8px;
                        margin-right: 2px;
                        border-radius: 4px;
                        display: flex;
                        align-items: center;

                        &.checked {
                            background-color: $base-color;
                            color: white;

                            span {
                                font-weight: bold;
                                font-size: 18px;

                            }
                        }

                        &:hover {
                            background-color: rgba(0, 0, 0, .15);
                        }

                        span {
                            font-size: 16px;
                        }
                    }
                }
            }
        }

        .action-container {
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 0 32px;


            height: 0;
            overflow: hidden;
            transition: .25s;

            cursor: auto;

            position: relative;
        }

        &.open {
            .info {
                .right {
                    transform: rotateZ(180deg);

                    span {
                    }
                }
            }

            .action-container {
                height: 56px;
            }
        }
    }

    .bsv-item {
        padding: 16px;
        padding-top: 24px;
        position: relative;

        .refresh-icon {
            position: absolute;
            top: 12px;
            right: 12px;
            z-index: 1;

        }

        .info {
            //margin-top: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: scale(1.05);

            img {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                margin-bottom: 3px;
            }


            .balance {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                color: #333;

                background-color: #f6f8fa;
                border-radius: 10px;
                padding: 12px 20px;

                margin-top: 12px;
                width: calc(100% - 56px);

                //@media(max-width: 375px){
                //    margin-top: 16px;
                //    width: calc(100% - 32px);
                //}

                img {
                    margin-right: 20px;
                }

                .balance-container {
                    flex-grow: 2;
                    display: flex;
                    flex-direction: column;
                    align-items: end;

                }

                .price {
                    color: #999;
                    font-size: 14px;
                }
            }

            .address {
                margin: 8px;
                padding: 4px 8px;
                border-radius: 5px;
                color: $font-weaken;

                &:hover {
                    background-color: #F2F3F4;
                }

                &:active {
                    background-color: #e2e3e4;
                }
            }
        }

        .action-container {
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: space-around;
        }
    }
}


</style>
