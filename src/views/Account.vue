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
            <div class="panel">
                <div class="account-top">
                    <div class="title"> Tokens</div>
                    <div v-if="!editTokenMode" class="type-choose">
                        <a-radio-group v-model:value="showTokenType" button-style="solid" size="small" @change="showTokenTypeChanged">
                            <a-radio-button value="added">Mine</a-radio-button>
                            <a-radio-button value="all">All</a-radio-button>
                        </a-radio-group>
                    </div>
                    <div v-if="!editTokenMode" class="action-container" :class="{'disable':showTokenType==='all'}">
                        <div class="add" @click="openTokenList">
                            <img src="../assets/icon-add.svg" alt="">
                        </div>
                        <div class="add" @click="enterEditTokenListMode">
                            <img src="../assets/icon-sort.svg" alt="">
                        </div>
                    </div>
                    <div v-else class="action-container">
                        <div class="add" @click="cancelEdit">
                            <CloseOutlined/>
                        </div>
                        <div class="add" @click="commitEdit">
                            <CheckOutlined/>
                        </div>
                    </div>
                </div>
                <div class="list" v-if="$store.state.tokenList==null" style="padding:16px;text-align: center">
                    <a-spin/>
                </div>
                <div class="list" v-else-if="$store.state.tokenList.length>0">
                    <div class="item" v-for="(item,index) in editTokenMode? editList:$store.state.tokenList" :class="{'open':item.open&&!editTokenMode }">
                        <div class="info" @click="toggleItem(item)">
                            <div class="left" @click="seeTokenDetail(item)">

                                <img style="width: 24px;height: 24px;border-radius: 50%" :src="item.logo || '/img/empty-token.png'" alt="">
                            </div>
                            <div class="mid">
                                <div class="balance">
                                    <a-spin v-if="item.isRefreshingAmount"/>
                                    <div v-else>
                                        <span v-if="!editTokenMode" style="font-weight: bold">{{ item.balance / Math.pow(10, item.decimal) }} </span>
                                        <span>{{ item.name }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="right" v-if="!editTokenMode">
                                <DownOutlined style="color: #999"/>
                            </div>
                            <div class="right actions" v-else>
                                <div class="action" @click="editActionAdd(index)">
                                    <ArrowUpOutlined/>
                                </div>
                                <div class="action" @click="editActionSub(index)">
                                    <ArrowDownOutlined/>
                                </div>
                                <div class="action" :class="{'checked':item.topped}" @click="editActionTop(index)">
                                    <VerticalAlignTopOutlined/>
                                </div>

                                <a-popconfirm
                                    title="Are you sure remove this?"
                                    @confirm="editActionRemove(index)"
                                    :arrowPointAtCenter="true"
                                    placement="topRight"
                                >
                                    <div class="action">
                                        <DeleteOutlined/>
                                    </div>
                                </a-popconfirm>

                            </div>
                        </div>
                        <div class="action-container">
                            <a-button shape="round" @click="receive(item)">
                                <template #icon>
                                    <img src="../assets/icon-qrcode.svg" alt="">
                                </template>
                                {{ $t('account.receive') }}
                            </a-button>
                            <a-button shape="round" @click="sendToken(item)" :loading="btnLoading">
                                <template #icon>
                                    <img src="../assets/icon-transfer.svg" alt="">
                                </template>
                                {{ $t('account.send') }}
                            </a-button>
                        </div>
                    </div>
                </div>
                <div class="list" v-else>
                    <div class="empty">
                        empty
                    </div>
                </div>
            </div>

            <div class="panel" v-if="false">
                <div class="account-top">
                    <div class="title"> NFTs</div>
                </div>
                <div class="list" v-if="nftGenesisList==null" style="text-align: center">
                    <a-spin/>
                </div>
                <div class="nft-list">
                    <div class="item" v-for="item in nftGenesisList">
                        <div class="genesis">
                            Genesis:{{ item.genesis }}
                        </div>
                        <div class="count">{{ item.count }}</div>
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
                        <a :href="item.url" target="_blank">
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
    <a-modal v-model:visible="showAddTokenPanel" :footer="null" :closable=false>
        <div class="base-token-list" v-if="baseTokenList">
            <!--            <div class="title-container">-->
            <!--                <div class="title">{{ $t('account.hot') }}</div>-->
            <!--                <div class="action" @click="showAddCustomTokenPanel">{{ $t('account.add_custom_token') }}</div>-->
            <!--            </div>-->
            <!--            <div class="item " v-for="item in baseTokenList.hot" @click="addToken(item)">-->
            <!--                <img :src="item.logo||'/img/empty-token.png'" alt="">-->
            <!--                <div class="info">-->
            <!--                    <div class="name">{{ item.name }}</div>-->
            <!--                    <div class="genesis ellipsis">Genesis: {{ item.genesis }}</div>-->
            <!--                </div>-->
            <!--                <svg v-if="item.added" t="1634030847866" class="icon added" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1814" width="48"-->
            <!--                     height="48">-->
            <!--                    <path-->
            <!--                        d="M768 85.333333a85.333333 85.333333 0 0 1 85.333333 85.333334v727.978666a42.666667 42.666667 0 0 1-62.677333 37.717334l-258.688-137.301334a42.666667 42.666667 0 0 0-40.021333 0L233.386667 936.32A42.666667 42.666667 0 0 1 170.666667 898.645333V170.666667a85.333333 85.333333 0 0 1 85.333333-85.333334h512z m-83.498667 223.317334a42.666667 42.666667 0 0 0-60.117333 5.248l-164.394667 195.669333-58.965333-66.730667-3.754667-3.754666a42.666667 42.666667 0 0 0-60.16 60.245333l91.733334 103.893333 3.626666 3.626667a42.666667 42.666667 0 0 0 61.013334-4.437333l196.266666-233.642667 3.2-4.266667a42.666667 42.666667 0 0 0-8.448-55.850666z"-->
            <!--                        p-id="1815" fill="#1afa29"></path>-->
            <!--                </svg>-->
            <!--            </div>-->

            <div class="title-container">
                <div class="title">{{ $t('account.token_list') }}</div>
                <div class="action" @click="showAddCustomTokenPanel">{{ $t('account.add_custom_token') }}</div>
            </div>
            <div class="item" v-for="item in baseTokenList.list" @click="addToken(item)">
                <img :src="item.logo||'/img/empty-token.png'" alt="">
                <div class="info">
                    <div class="name">{{ item.name }}</div>
                    <div class="genesis ellipsis">Genesis: {{ item.genesis }}</div>
                </div>
                <svg v-if="item.added" t="1634030847866" class="icon added" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1814" width="48"
                     height="48">
                    <path
                        d="M768 85.333333a85.333333 85.333333 0 0 1 85.333333 85.333334v727.978666a42.666667 42.666667 0 0 1-62.677333 37.717334l-258.688-137.301334a42.666667 42.666667 0 0 0-40.021333 0L233.386667 936.32A42.666667 42.666667 0 0 1 170.666667 898.645333V170.666667a85.333333 85.333333 0 0 1 85.333333-85.333334h512z m-83.498667 223.317334a42.666667 42.666667 0 0 0-60.117333 5.248l-164.394667 195.669333-58.965333-66.730667-3.754667-3.754666a42.666667 42.666667 0 0 0-60.16 60.245333l91.733334 103.893333 3.626666 3.626667a42.666667 42.666667 0 0 0 61.013334-4.437333l196.266666-233.642667 3.2-4.266667a42.666667 42.666667 0 0 0-8.448-55.850666z"
                        p-id="1815" fill="#1afa29"></path>
                </svg>

            </div>
        </div>
        <div v-else style="display:flex;justify-content:center;align-items: center">
            <a-spin/>
        </div>
    </a-modal>

    <a-modal v-model:visible="showTransPanel" @ok="transfer()" :closable=false>
        <div class="trans-info-container">
            <a-input v-model:value="transAddress" :placeholder="$t('account.input_address')"/>
            <a-input v-model:value="transAmount" :placeholder="$t('account.input_amount',[transType==='BSV'? 'BSV':(transInfo.unit||transInfo.symbol)])"/>
        </div>
    </a-modal>
    <a-modal v-model:visible="isShowAddCustomTokenPanel" @ok="addCustomToken" :closable=false>
        <div class="custom-token-form">
            <a-input class="input" v-model:value="customToken.genesis" placeholder="genesis"/>
            <a-input class="input" v-model:value="customToken.codehash" placeholder="codehash"/>
        </div>
    </a-modal>
    <a-modal v-model:visible="showQr" :footer="null" :closable=false>
        <div style="display: flex;flex-direction: column;align-items: center">
            <QrcodeVue :value="$store.getters.address" :size="200" level="H"/>
            <p class="copy-address" style="margin-top: 20px;" id="address-copy" :data-clipboard-text="$store.getters.address">
                {{ $store.getters.address }}
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0H1H9V1H1V9H0V0ZM2 2H11V11H2V2ZM3 3H10V10H3V3Z" fill="#989a9b"></path>
                </svg>
            </p>
            <p style="color: #999">
                The address can only receive BSV or Sensible FT Token
            </p>
        </div>
    </a-modal>
</template>

<script>
import PlusOutlined from '@ant-design/icons-vue/lib/icons/PlusOutlined'
import DownOutlined from '@ant-design/icons-vue/lib/icons/DownOutlined'
import ArrowUpOutlined from '@ant-design/icons-vue/lib/icons/ArrowUpOutlined'
import ArrowDownOutlined from '@ant-design/icons-vue/lib/icons/ArrowDownOutlined'
import VerticalAlignTopOutlined from '@ant-design/icons-vue/lib/icons/VerticalAlignTopOutlined'
import CheckOutlined from '@ant-design/icons-vue/lib/icons/CheckOutlined'
import CloseOutlined from '@ant-design/icons-vue/lib/icons/CloseOutlined'
import DeleteOutlined from '@ant-design/icons-vue/lib/icons/DeleteOutlined'

import QrcodeVue from 'qrcode.vue'

import AccountChoose from "../components/AccountChoose";
import Footer from "../components/Footer";
import Clipboard from "clipboard";
import httpUtils from '../utils/httpUtils';

let clip = null;
let clip2 = null;

export default {
    name: "Account",
    components: {
        AccountChoose,
        Footer,
        QrcodeVue, PlusOutlined,
        DownOutlined,
        ArrowUpOutlined,
        ArrowDownOutlined,
        VerticalAlignTopOutlined,
        CheckOutlined,
        CloseOutlined,
        DeleteOutlined,
    },
    data() {
        return {
            // extName: chrome.i18n.getMessage("extName"),
            asset: [],
            bsvAsset: null,
            appList: null,
            nftGenesisList: null,
            tokenList: null,
            showAddTokenPanel: false,
            baseTokenList: null,
            mainAddress: walletManager.getMainAddress(),
            showTransPanel: false,
            transAddress: "",
            transAmount: null,
            transInfo: {},
            transType: "BSV",
            isShowAddCustomTokenPanel: false,
            customToken: {},
            accountMode: walletManager.getAccountMode(),
            btnLoading: false,
            showQr: false,
            showRedPoint: false,
            showTokenType: localManager.getShowTokenType(),
            editTokenMode: false,
            editList: [],
        }
    },
    beforeCreate() {

    },
    async created() {

        this.$store.commit("initSettingChecked")

        this.initAsset();

        // this.nftGenesisList = await nftManager.listAllNft().catch(e => []);
        this.initAppList();

        await this.refreshToken();
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
            let assetData = {
                name: 'BSV',
                balance: {},
                decimal: 8,
                isRefreshingAmount: true,
                address: walletManager.getMainAddress(),
                open: false,
            };

            assetData.addressShow = showLongString(assetData.address, 10)

            let balance = await walletManager.getBsvBalance();

            assetData.balance = {
                total: balance.confirmed + balance.unconfirmed,
                confirmed: balance.confirmed,
                unconfirmed: balance.unconfirmed,
            };
            assetData.isRefreshingAmount = false;

            assetData.showBalance = showDecimal(assetData.balance.total, 8, 8)
            console.log(assetData.showBalance)

            this.bsvAsset = assetData
        },
        async initAppList() {
            try {


            let temp = localStorage.getItem('appList', data);
            if (temp)
                this.appList = JSON.parse(temp);
            }catch (e){
                console.error(e)
            }
            let data = (await httpUtils.get('https://sensilet.com/api/application_list')).data
            localStorage.setItem('appList',JSON.stringify( data));
            this.appList = data;
        },
        receive(item) {
            this.showQr = true
        },
        async refreshToken() {
            this.$store.dispatch('refreshAllToken')
        },
        toggleItem(item) {
            if (!this.editTokenMode)
                item.open = !item.open
        },
        showTokenTypeChanged() {
            localManager.setShowTokenType(this.showTokenType)
            this.$store.dispatch('refreshAllToken')
        },
        async openTokenList() {
            if (this.showTokenType === 'all')
                return
            this.showAddTokenPanel = true;
            this.baseTokenList = null;

            this.baseTokenList = await tokenManager.getTokenListNet();

        },
        enterEditTokenListMode() {
            if (this.showTokenType === 'all')
                return
            //拷贝一份token数据用于临时编辑
            let tempList = JSON.parse(JSON.stringify(this.$store.state.tokenList))
            // 遍历，给上基础排序信息
            for (let i = 0; i < tempList.length; i++) {
                if (!tempList[i].addTime) {
                    //    非置顶
                    tempList[i].addTime = 0;
                }
            }
            this.editList = tempList;
            this.editTokenMode = true
        },
        commitEdit() {
            tokenManager.reSaveToken(this.editList)
            this.$store.dispatch('refreshAllToken')

            this.editTokenMode = false;
            this.editList = [];
        },
        cancelEdit() {
            this.editTokenMode = false;
            this.editList = [];
        },
        editActionAdd(index) {
            if (!this.editTokenMode || !this.editList || this.editList.length < 1)
                return
            if (index <= 0)
                return;

            if (!this.editList[index] || !this.editList[index - 1])
                return;

            if (this.editList[index - 1].topped && !this.editList[index].topped)
                return;


            let temp = this.editList[index - 1]
            this.editList[index - 1] = this.editList[index]
            this.editList[index] = temp;

        },
        editActionSub(index) {
            if (!this.editTokenMode || !this.editList || this.editList.length < 1)
                return
            if (index >= this.editList.length - 1)
                return;
            if (!this.editList[index] || !this.editList[index + 1])
                return;
            if (this.editList[index].topped && !this.editList[index + 1].topped)
                return;

            let temp = this.editList[index + 1];
            this.editList[index + 1] = this.editList[index];
            this.editList[index] = temp;

        },
        editActionTop(index) {
            if (!this.editTokenMode || !this.editList || this.editList.length < 1)
                return

            if (!this.editList[index])
                return;

            let temp = this.editList[index];
            if (temp.topped) {
                temp.topped = false;
                //    取消置顶的元素应该放哪呢
                //    暂时策略，移到非置顶的第一个
                this.editList.splice(index, 1);

                let i = this.editList.findIndex(item => !item.topped)

                if (i >= 0)
                    this.editList.splice(i, 0, temp);
                else
                    this.editList.push(temp)

            } else {
                temp.topped = true;
                this.editList.splice(index, 1);
                this.editList.unshift(temp)
            }
        },
        editActionRemove(index) {
            if (!this.editTokenMode || !this.editList || this.editList.length < 1)
                return

            this.editList.splice(index, 1);
        },
        showAddCustomTokenPanel() {
            this.showAddTokenPanel = false;
            this.isShowAddCustomTokenPanel = true;
        },

        async addCustomToken() {
            if (!this.customToken.genesis || !this.customToken.codehash)
                return;

            let result = await httpUtils.get(`https://api.sensiblequery.com/ft/genesis-info/${this.customToken.codehash}/${this.customToken.genesis}`)
            if (!result || result.code !== 0)
                return antMessage.error(this.$t("account.token_error"))

            let tokenInfo = result.data;

            this.customToken.decimal = parseInt(this.customToken.decimal)
            return this.addToken({
                codehash: this.customToken.codehash,
                genesis: this.customToken.genesis,
                network: 'mainnet',
                name: tokenInfo.name,
                decimal: tokenInfo.decimal,
                fixed: tokenInfo.fixed || tokenInfo.decimal,
                unit: tokenInfo.symbol,
                logo: tokenInfo.icon,
            })
        },
        async addToken(item) {
            let err = tokenManager.addToken(item);
            if (!err) {
                this.showAddTokenPanel = false;
                this.isShowAddCustomTokenPanel = false;
                this.customToken = {};
                await this.refreshToken()
            } else {
                antMessage.error(err.message)
                console.error(err)

            }
        },
        sendToken(item) {
            this.transType = 'TOKEN';
            this.transInfo = item;
            this.showTransPanel = true;
        },
        sendBsv(item) {
            this.transType = 'BSV';
            this.transInfo = item;
            this.showTransPanel = true;
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
            let result = await httpUtils.get('https://sensilet.com/api/version_and_notice')
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

        a {
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
                margin-right: 2px;
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
        margin-top: 16px;
        padding: 16px;

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
