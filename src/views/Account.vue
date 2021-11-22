<template>
    <div class="account-container">
        <div>
            <div class="account-top account">
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
                                <span v-else>
                                    <span class="integer">{{ bsvAsset.showBalance.integer }}</span>
                                    <span class="decimal" v-if="bsvAsset.showBalance.decimal.length>0">.{{ bsvAsset.showBalance.decimal }}</span>
                                    <!--                                    {{ bsvAsset.balance.total / Math.pow(10, bsvAsset.decimal) }} -->
                                    <span style="margin-left: 4px;font-size: .85em">{{ bsvAsset.name }}</span>
                                </span>
                            </div>
                            <div class="price" v-if="bsvAsset.usd">$ {{bsvAsset.usd}} USD</div>
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
            <div class="panel" v-if="true">
                <div class="account-top">
                    <div class="title"> NFTs</div>
                </div>
                <div class="list" v-if="nftGenesisList==null" style="text-align: center">
                    <a-spin v-if="false"/>
                    <div v-else class="empty">
                        Coming Soon
                    </div>
                </div>
                <div class="nft-list" v-else-if="nftGenesisList.length>0">
                    <div class="item" v-for="item in nftGenesisList">
                        <div class="genesis">
                            Genesis:{{ item.genesis }}
                        </div>
                        <div class="count">{{ item.count }}</div>
                    </div>
                </div>
                <div class="list" v-else>
                    <div class="empty">
                        empty
                    </div>
                </div>
            </div>
            <div class="panel">
                <div class="account-top">
                    <div class="title"> {{ $t('account.hot_app') }}</div>
                </div>
                <div class="app-list" v-if="appList!=null">
                    <!--                <div class="app-list" v-if="false">-->
                    <div class="item" v-for="item in appList">
                        <img :src="item.logo" alt="">
                        <div class="info">
                            <div class="title">{{ item.name }}</div>
                            <div class="desc ellipsis">{{ item.desc }}
                            </div>
                        </div>
                        <a class="enter" :href="item.url" target="_blank">
                            Enter
                        </a>
                    </div>
                    <!--                    <div class="item">-->
                    <!--                        and more ...-->
                    <!--                    </div>-->
                </div>
                <a-spin v-else style="padding:16px;text-align: center"></a-spin>
            </div>
        </div>

        <Footer></Footer>
    </div>

    <a-modal v-model:visible="showTransPanel" @ok="transfer()" @cancel="cancelTransfer" :closable=false>
        <div class="trans-info-container">
            <div class="title">
                Send {{ isTransBSV ? "BSV" : transInfo.name }}
            </div>
            <a-input v-model:value="transAddress" @change="transAddressChange" :placeholder="$t('account.input_address')"/>
            <a-input v-model:value="transAmount" @change="transAmountChange"
                     :placeholder="$t('account.input_amount',[transType==='BSV'? 'BSV':(transInfo.unit||transInfo.symbol)])"/>

            <div class="notice">
                <div class="balance" v-if="transInfo">
                    <div class="key">
                        Balance :
                    </div>
                    <div class="amount">
                        {{ transBalance }} {{ transUnit }}
                    </div>
                    <div class="action" @click="sendAll">Send All</div>
                </div>
                <div class="fee">
                    <div class="key">
                        Fee:
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
    </a-modal>

    <a-modal v-model:visible="showQr" :footer="null" :closable=false>
        <div style="font-size: 18px;text-align: center;margin-bottom: 16px">Receive BSV or Sensible FT</div>
        <div style="display: flex;flex-direction: column;align-items: center">
            <QrcodeVue :value="$store.getters.address" :size="200" level="H"/>
            <p class="copy-address" style="margin-top: 20px;" id="address-copy" :data-clipboard-text="$store.getters.address">
                {{ $store.getters.address }}
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0H1H9V1H1V9H0V0ZM2 2H11V11H2V2ZM3 3H10V10H3V3Z" fill="#989a9b"></path>
                </svg>
            </p>
            <p style="color: #999;font-size: 12px">
                The address can only receive BSV or Sensible FT Token
            </p>
        </div>
    </a-modal>
</template>

<script>
import PlusOutlined from '@ant-design/icons-vue/lib/icons/PlusOutlined'

import QrcodeVue from 'qrcode.vue'

import AccountChoose from "../components/AccountChoose";
import Footer from "../components/Footer";
import Clipboard from "clipboard";
import apiUtils from '../utils/apiUtils';
import TokenPanel from "@/components/TokenPanel";

let clip = null;
let clip2 = null;

export default {
    name: "Account",
    components: {
        TokenPanel,
        AccountChoose,
        Footer,
        QrcodeVue, PlusOutlined,


    },
    data() {
        return {
            // extName: chrome.i18n.getMessage("extName"),
            asset: [],
            appList: null,
            nftGenesisList: null,
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

        // this.initNfts();

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
        this.initVersionAndNotice()
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

            this.bsvAsset.isRefreshingAmount = false;

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

                //    获取一下币价
                let bsvPrice = (await apiUtils.getBsvPrice()).data
                this.bsvAsset.usd = (this.bsvAsset.balance.total / Math.pow(10,this.bsvAsset.decimal) * bsvPrice).toFixed(2);


            } catch (e) {
                console.error(e)
            }
            this.isRefreshBsv = false

        },
        async initNfts() {
            this.nftGenesisList = await nftManager.listAllNft().catch(e => {
                console.error(e);
                return []
            });
        },
        async initAppList() {
            try {
                let temp = localStorage.getItem('appList', data);
                if (temp)
                    this.appList = JSON.parse(temp);
            } catch (e) {
                console.error(e)
            }
            let data = (await apiUtils.getApplicationList()).data;
            localStorage.setItem('appList', JSON.stringify(data));
            this.appList = data;
        },
        receive(item) {
            this.showQr = true
        },

        async sendBsv(item) {
            this.transType = 'BSV';
            this.transInfo = item;
            this.transUnit = "BSV";
            this.transBalance = item.balance.total / Math.pow(10, item.decimal);
            this.showTransPanel = true;
        },
        async sendAll() {
            if (this.transType === 'BSV') {
                let {amount, fee} = await walletManager.getSendAllInfo(walletManager.getMainWif());

                this.transAmount = amount / Math.pow(10, 8);
                this.transFee = fee / Math.pow(10, 8);
            } else {
                this.transAmount = this.transBalance;
                this.transAmountChange()
            }
        },
        transAddressChange(value) {
            if (this.transAddress.length >= 26) {
                if (walletManager.checkBsvAddress(this.transAddress) && this.transAmount > 0) {
                    this.calcTransFee()
                }
            }
        },
        transAmountChange(value) {
            if (this.transAmount > 0 && walletManager.checkBsvAddress(this.transAddress)) {
                this.calcTransFee();
            }
        },
        async calcTransFee() {
            if (this.transFeeLoading)
                return
            this.transFeeLoading = true;
            try {
                let amount = Math.round(parseFloat(this.transAmount) * Math.pow(10, this.transInfo.decimal));
                // console.log(amount)
                if (this.transType === 'BSV') {
                    let {fee, isInvalid} = await walletManager.payArray([{
                        address: this.transAddress,
                        amount,
                    }], false)
                    console.log(fee)
                    if (!isInvalid) {
                        fee = fee / Math.pow(10, 8)
                        this.transFee = fee;
                    } else {
                        this.transFee = "Invalid";
                    }
                } else {
                    let signers = null
                    let tokenInfo = await tokenManager.getTokenInfo(this.transInfo.genesis, this.transInfo.codehash);

                    if (this.transInfo.genesis === "54256eb1b9c815a37c4af1b82791ec6bdf5b3fa3"
                        || this.transInfo.genesis === "8764ede9fa7bf81ba1eec5e1312cf67117d47930") {
                        signers = await tokenManager.sensibleFt.getSignersFromRabinApis(tokenInfo.signers)
                    }
                    // console.log(tokenInfo)
                    // console.log(this.transInfo)
                    // console.log(signers)
                    let fee = await tokenManager.sensibleFt.getTransferEsitimate(this.transInfo.codehash, this.transInfo.genesis,
                        [{
                            address: this.transAddress,
                            amount,
                        }], walletManager.getMainWif(), signers
                    );
                    fee = fee / Math.pow(10, 8)
                    this.transFee = fee;
                }
            } catch (e) {
                console.log(e)
                this.transFee = "Invalid"
            } finally {

                this.transFeeLoading = false;
            }
        },
        cancelTransfer() {
            this.transAddress = "";
            this.transAmount = null;
            this.transFeeLoading = false;
            this.transFee = 0;
        },
        async transfer() {
            //检查信息
            if (!walletManager.checkBsvAddress(this.transAddress)) {
                return antMessage.error(this.$t('account.address_error'))
            }

            let amount = this.transAmount;
            if (isNaN(amount))
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
        }
    }
}
</script>

<style scoped lang="scss">

@import "../style/color";

.account-container {
    min-height: calc(100vh - 56px);
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

.account-top {
    height: 36px;
    width: 100%;
    padding: 0 8px 0 16px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    background-color: $base-color;
    color: white;
    position: relative;

    &.account {
        margin-top: 24px;

        background-color: $main-bg;
        justify-content: center;
        position: relative;

        .account-mode {
            position: absolute;
            right: 8px;
            color: #bbb;
        }
    }


    .title {
        font-size: 16px;
        font-weight: bold;

        &.action {
            z-index: 1;
            padding: 4px 16px;
            cursor: pointer;
            border-radius: 5px;

            &:hover {
                background-color: #ddd;
            }
        }
    }

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
                font-size: 14px;
                font-weight: bold;
            }

            .desc {
                font-size: 12px;
                width: 200px;
                color: #999;
            }

        }

        .enter {
            padding: 4px 10px;
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
            top: 16px;
            right: 16px;
            z-index: 1;

        }

        .info {
            //margin-top: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: scale(1.05);

            img {
                width: 26px;
                //height: 26px;
                border-radius: 50%;
                margin-bottom: 3px;
            }

            .price{
                color: #999;
            }

            .balance {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                color: #333;

                img {
                    margin-right: 20px;
                }

                //font-weight: bold;
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

.nft-list {
    .item {
        display: flex;
        align-items: center;

        .genesis {
            padding: 16px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .count {
            padding-right: 16px;
        }
    }
}

</style>
