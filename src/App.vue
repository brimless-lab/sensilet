<template>
    <div class="top">
        <div class="title">
            <img v-if="width<500 && showAccountChoose" style="width: 36px;margin-left: 16px" src="./assets/logo.png" alt="logo">

            <div v-else style="overflow: hidden">
                <!--                <img src="./assets/logo_h_white.png" alt="logo">-->
                <img style="width: 128px" src="./assets/logo_h.svg" alt="logo">
            </div>
        </div>
        <div class="right" v-if="showSetting">
            <div @click="gotoSetting()">
                <img class="icon" src="./assets/icon-setting.svg" alt="">
                <div class="red-point" :class="{'show':!$store.state.isSettingChecked}"></div>
            </div>
        </div>
        <AccountChoose v-else-if="showAccountChoose"/>

        <span class="version" :class="{'right-little':showSetting,'has-new':$store.getters.hasNewVersion}" @click="newVersion()">
<!--            <span v-if="debug">{{ currentPage }}</span>-->
            {{ version }}
            <div class="red-point"/>
        </span>
    </div>
    <!--        <router-view/>-->
    <!--        因为插件的特殊性，这里需要自己维护路由-->
    <div class="main">
        <CreateWallet v-if="currentPage==='/create'"/>
        <Unlock v-else-if="currentPage==='/unlock'"/>
        <Account v-else-if="currentPage==='/account'"/>
        <Connect v-else-if="currentPage==='/connect'"/>
        <Issue v-else-if="currentPage==='/issue'"/>
        <Genesis v-else-if="currentPage==='/genesis'"/>
        <Pay v-else-if="currentPage==='/pay'"/>
        <TransferNft v-else-if="currentPage==='/transferNft'"/>
        <PayToken v-else-if="currentPage==='/payToken'"/>
        <ImportWallet v-else-if="currentPage==='/import'"/>
        <Merge v-else-if="currentPage==='/merge'"/>
        <Setting v-else-if="currentPage==='/setting'"/>
        <SignTx v-else-if="currentPage==='/signTx'"/>
        <SignMsg v-else-if="currentPage==='/signMsg'"/>
        <ExportWallet v-else-if="currentPage==='/export'"/>
        <ImportPrivate v-else-if="currentPage==='/importPrivateKey'"/>
        <ExportPrivate v-else-if="currentPage==='/exportPrivateKey'"/>
        <SignTransaction v-else-if="currentPage==='/signTransaction'"/>
        <ConnectManagement v-else-if="currentPage==='/connectManagement'"/>
        <NftList v-else-if="currentPage==='/nftList'"/>
    </div>

</template>
<script>
//1. 判断是否创建了私钥 否则进入创建私钥页面 Create
//2. 判断是否解锁了私钥 否则进入解锁页面 Unlock
//3. 进入正常钱包页面  Wallet

import {defineAsyncComponent} from 'vue'

const CreateWallet = defineAsyncComponent(() => import( './views/CreateWallet.vue'))
// import Account from './views/Account'
const Account = defineAsyncComponent(() => import('./views/Account'))
const Unlock = defineAsyncComponent(() => import( './views/Unlock'))
const Connect = defineAsyncComponent(() => import( './views/Connect'));
const Issue = defineAsyncComponent(() => import( './views/Issue'));
const Genesis = defineAsyncComponent(() => import( "./views/Genesis"));
const Pay = defineAsyncComponent(() => import( "./views/Pay"));
const TransferNft = defineAsyncComponent(() => import( "./views/TransferNft"));
const PayToken = defineAsyncComponent(() => import( "./views/PayToken"));
const ImportWallet = defineAsyncComponent(() => import( "./views/ImportWallet"));
const Merge = defineAsyncComponent(() => import( "./views/Merge"));
const Setting = defineAsyncComponent(() => import( "./views/Setting"));
const SignTx = defineAsyncComponent(() => import( "./views/SignTx"));
const SignMsg = defineAsyncComponent(() => import( "./views/SignMsg"));
const ExportWallet = defineAsyncComponent(() => import( "./views/ExportWallet"));
const ImportPrivate = defineAsyncComponent(() => import( "./views/ImportPrivate"));
const ExportPrivate = defineAsyncComponent(() => import( "./views/ExportPrivate"));
const SignTransaction = defineAsyncComponent(() => import( "./views/SignTransaction"));
const ConnectManagement = defineAsyncComponent(() => import( "./views/ConnectManagement"));
const NftList = defineAsyncComponent(() => import( "./views/NftList"));

const AccountChoose = defineAsyncComponent(() => import( "./components/AccountChoose"));

import apiUtils from './utils/apiUtils';


const urlParams = new URLSearchParams(window.location.hash.slice(1));
const request = JSON.parse(urlParams.get('request'));

export default {
    components: {

        CreateWallet,
        Account,
        // Account : resolve => {require(['./views/Account'],resolve)},     // 实现组件懒加载
        // Account : ()=> import('./views/Account.vue'),
        Unlock,
        Connect,
        Issue,
        Genesis,
        Pay,
        TransferNft,
        PayToken,
        ImportWallet,
        Merge,
        Setting,
        SignTx,
        SignMsg,
        ExportWallet,
        AccountChoose,
        ImportPrivate,
        ExportPrivate,
        SignTransaction,
        NftList,
        ConnectManagement,
    },
    data() {
        this.$store.commit('initAccount')
        this.$store.dispatch('initActiveTab')


        return {
            width: document.body.clientWidth,
            walletName: config.walletName,
            currentPage: routerManager.getCurrentPage(),
            count: global.bg.count,
            version: config.version,
            debug: config.debug,
            // showSetting: true
        }
    },
    computed: {
        showSetting() {
            return this.currentPage === '/account'
        },
        showAccountChoose() {
            return ['/create', '/unlock'].indexOf(this.currentPage) >= 0
        }
    },
    beforeCreate() {
        routerManager.addListener((url) => {
            console.log(url)
            this.currentPage = url;
        });


        if (request && request.method === 'connect') {
            console.log('connect to sensilet');
            return routerManager.goto('/connect')
        }

        if (request && request.method === 'genesis') {
            console.log('genesis NFT');
            return routerManager.goto('/genesis')
        }
        if (request && request.method === 'issue') {
            console.log('issue NFT');
            return routerManager.goto('/issue')
        }

        if (request && request.method === 'pay') {
            console.log('pay bsv');
            routerManager.goto('/pay')
        }
        if (request && request.method === 'payToken') {
            console.log('支付Token');
            routerManager.goto('/payToken')
        }
        if (request && request.method === 'transferNft') {
            console.log('transfer nft');
            routerManager.goto('/transferNft')
        }
        if (request && request.method === 'signTx') {
            console.log('sign transaction for tswap');
            return routerManager.goto('/signTx')
        }
        if (request && request.method === 'signTransaction') {
            console.log('sign transaction for web3');
            return routerManager.goto('/signTransaction')
        }
        if (request && request.method === 'checkTokenUtxoCount') {
            console.log('merge Utxo');
            return routerManager.goto('/merge')
        }
        if (request && request.method === 'signMsg') {
            console.log('sign message');
            return routerManager.goto('/signMsg')
        }


        if (routerManager.getCurrentPage() === '/') {
            if (config.debug)
                return routerManager.gotoDebug();
            routerManager.goto('/account')
        }

    },


    beforeMount() {
        //注册关闭事件

        if (urlParams.get('origin')) {
            //注册关闭时事件，通知调用者
            window.onbeforeunload = function () {
                chrome.runtime.sendMessage({
                    channel: 'sato_extension_background_channel',
                    data: {
                        id: request.id,
                        result: "cancel"
                    },
                });
            }
        }

    },
    mounted() {
        //获取当前激活的网站链接
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const [activeTab] = tabs;
            const {id, title, url} = activeTab;
            const {origin, protocol} = url ? new URL(url) : {};

            console.log('active tab ' + origin)
        });

        //    检查已保存的数据版本 //不等同步
        this.checkDataVersion();


    },
    methods: {
        async checkDataVersion() {
            try {


                let {tokenDataVersion, nftDataVersion} = (await apiUtils.getDataVersion()).data

                //    检查token信息
                let version = localManager.getTokenTableVersion();
                if (tokenDataVersion > version) {
                    console.log("refresh token data")
                    await tokenManager.getTokenListNet();
                    //    修复已添加的
                    await tokenManager.refreshLocalTokenData();
                }

                //检查nft 信息
                let localNftDataVersion = localManager.getNftDataVersion();
                if (nftDataVersion > localNftDataVersion) {
                    await nftManager.getNftInfoNet();
                }
            } catch (e) {
                console.error(e)
            }

        },
        newVersion() {
            if (this.$store.getters.hasNewVersion) {

                let url = this.$store.state.version.url;
                localManager.setVersionChecked(this.$store.state.version.versionCode)
                this.$store.commit("refreshVersionCheck")

                antModal.confirm({
                    title: this.$t('app.has_new_version'),
                    content: this.$store.state.version.detail,
                    onOk() {
                        if (url)
                            window.open(url)
                    }
                })
            }
        },
        openWeb(url) {
            window.open(window.location.href)
        },
        gotoHome() {
            routerManager.gotoHome();
        },
        gotoSetting() {
            localManager.setSettingChecked()
            this.$store.commit("initSettingChecked")

            routerManager.goto('/setting')
        },

    }
}

</script>

<style lang="scss">
@import "./style/color";

body {
    margin: 0;
    min-width: 375px;
    height: 600px;
    min-height: 600px;
    font-size: 14px;

    &::-webkit-scrollbar {
        display: none;
    }

    //background-color: whitesmoke;

    @media(min-width: 376px) {
        min-height: 100vh;
    }
    /*@media(max-width: 374px) {*/
    /*    min-width: 325px;*/

    /*}*/
}

.icon {
    width: 32px;
    height: 32px;
}

#app {
    height: 100%;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}

.top {
    width: 100%;
    height: 48px;
    box-sizing: border-box;
    background-color: $base-color;
    color: #fff;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.12);

    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;

    .title {
        //cursor: pointer;
        position: absolute;
        left: 0;

        img {
            //height: 45px;
            //margin-left: 8px;

        }
    }

    .right {
        position: absolute;
        right: 16px;
        cursor: pointer;

        display: flex;
        align-items: center;

        .red-point {
            top: 1px;
            right: -2px;
        }

    }

    .version {
        position: absolute;
        right: 16px;

        font-size: 12px;
        color: #ddd;
        margin-right: 4px;

        &.right-little {
            right: 50px;
        }

        &.has-new {
            cursor: pointer;

            .red-point {
                display: block;

            }
        }
    }

}


.red-point {
    width: 8px;
    height: 8px;

    position: absolute;
    top: -4px;
    right: -6px;

    border-radius: 50%;
    background-color: red;

    display: none;

    &.show {
        display: block;
    }
}


#nav {
    padding: 30px;

    a {
        font-weight: bold;
        color: #2c3e50;

        &.router-link-exact-active {
            color: #42b983;
        }
    }
}

.main {
    height: calc(100vh - 48px);
    overflow-y: scroll;

    &::-webkit-scrollbar {
        width: 0;
        height: 0;
    }
}


.word-btn {
    margin-top: 10px;
    text-decoration: underline;
    display: inline-block;
    cursor: pointer;
}

.custom-panel {
    padding: 8px;
    border-radius: 5px;
    margin-top: 8px;
    background-color: whitesmoke;

    .notice {
        color: red;
        margin-bottom: 8px;
        display: flex;
        flex-direction: row;
        align-items: center;

        img {
            width: 32px;
            height: 32px;
            margin-right: 8px;
        }
    }

}

.panel {
    width: calc(100vw - 32px);
    max-width: 375px;
    box-shadow: 0 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);
    padding: 16px;
    border-radius: 4px;
    //line-height: 1.43;
    letter-spacing: 0.01071em;

    //@media (min-width: 450px) {
    margin: 20px auto 0;
    //}

    overflow: hidden;

    &.no-shadow {
        box-shadow: unset;
    }

    &:hover {
        box-shadow: 0 2px 4px 1px rgb(0 0 0 / 15%), 0px 1px 1px 0px rgb(0 0 0 / 12%), 0px 1px 3px 0px rgb(0 0 0 / 8%);
    }

    .panel-top {
        width: 100%;
        padding: 4px 16px;

        display: flex;
        justify-content: space-between;
        align-items: center;

        background-color: $base-color;
        color: white;
        position: relative;
        max-width: 375px;


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

    }

}


.ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.trans-info-container {
    .title {
        text-align: center;
        font-size: 18px;
    }

    .small-title {
        display: flex;
        align-items: center;

        span {
            margin-left: .5em;
            font-weight: bold;
        }

        img {
            margin-left: .5em;
            border-radius: 50%;
            width: 22px;
            height: 22px;
        }
    }


    //input {
    //    &:not(:first-child) {
    //        margin-top: 16px;
    //    }
    //}

    .notice {
        margin-top: 20px;

        .balance, .fee {
            display: grid;
            grid-template-columns: 80px 1fr 80px;

            .key {
            }

            .amount {

                text-align: right;
            }

            .action {
                cursor: pointer;
                color: $base-color;
                text-align: right;
            }


        }

    }
}

.ant-dropdown {
    z-index: 990;
}

.custom-token-form {
    .input {
        &:not(:first-child) {
            margin-top: 10px;
        }
    }
}

.add-choose-container {
    display: flex;
    flex-direction: column;

    .item {
        margin-top: 10px;
        padding: 4px 8px;
        //background-color: #eee;
        //border-radius: 5px;

        display: flex;
        align-items: center;

        span {
            margin-left: 4px;
        }

    }

    .line {

    }
}

.copy-address {
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 12px;

    &:hover {
        background-color: #F2F3F4;
    }

    &:active {
        background-color: #e2e3e4;
    }
}

.more-action {
    position: absolute;
    right: 16px;

    img {
        width: 32px;
        height: 32px;
    }
}

.integer {

}

.decimal {
    font-size: .85em;
    color: #888;
}

.account-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .arrow {

        display: none;
        color: $base-color;
        align-items: center;
        font-size: 22px;
    }

    &.selected {
        cursor: default;

        &:hover {
            background-color: white;
        }

        .arrow {
            display: block;
        }
    }

}


.account-mode {
    background-color: #f1f1f1;
    color: #999;
    padding: 0 4px;
    border-radius: 5px;
    font-size: 14px;
    //display: flex;
    align-items: center;
}

.hide {
    display: none !important;
}

@keyframes rotate360 {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.refresh-icon {
    img {
        height: 24px;
        width: 24px;
    }

    &.refreshing {
        animation: 1s rotate360 infinite linear;
    }
}


.input-container {
    margin: 20px auto;
    position: relative;

    .notice {
        margin-top: 0;
        transform: scaleY(0);
        color: red;
        position: absolute;
        left: 0;
        top: 100%;
    }

    &.has-error {
        .notice {
            transform: scaleY(1);
        }
    }
}

.nft-detail-panel {

    .top-info {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        .name {
            font-size: 16px;
            font-weight: bold;
        }

        .right {
            position: absolute;
            right: 0;
        }
    }

    .img-container {
        display: flex;
        justify-content: center;
        margin: 10px auto;

        img {
            max-height: 200px;
        }
    }

    .desc {
        text-align: center;
        color: #999;
    }

    .info-list {
        margin-top: 16px;

        .info {
            margin-top: 4px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;

            span:nth-child(2){
                flex-grow: 99;
                text-align: right;
            }
        }
    }


    .action-container {
        margin-top: 16PX;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;


    }
}


.ant-btn-round {
    color: #7a7a7a;
    //border-color: #d2f1e5;
    //background-color: white;
    width: 100px;
    font-weight: bold;
    padding: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    &.ant-btn-primary {
        color: white;

        &:hover{
            color: #eee;
        }
    }



    &:hover{
        color: #333;
    }

    span:last-child {
        min-width: 56px;
        margin-top: 1px;
    }

    img {
        width: 18px;
        margin-right: 2px;
    }

    @media (max-width:400px) {
        width: 92px;

        img{width: 17px}
    }
}
</style>
