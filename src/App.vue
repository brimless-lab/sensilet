<template>
    <div class="top">
        <div class="title">
            <div style="overflow: hidden">
                <img style="height: 150px;" src="./assets/logo_h.svg" alt="logo">
            </div>
            <!--            <img v-else src="./assets/logo.png" alt="logo">-->
        </div>
        <div class="right"  v-if="showSetting">
            <div  @click="gotoSetting()">
                <img class="icon" src="./assets/icon-setting.svg" alt="">
                <div class="red-point" :class="{'show':!$store.state.isSettingChecked}"></div>
            </div>
        </div>
        <AccountChoose v-else-if="showAccountChoose"/>

        <span class="version" :class="{'right-little':showSetting,'has-new':$store.getters.hasNewVersion}" @click="newVersion()">
            {{ version }}
            <div class="red-point"></div>
        </span>
    </div>
    <!--        <router-view/>-->
    <!--        因为插件的特殊性，这里需要自己维护路由-->
    <div class="main">
        <CreateWallet v-if="currentPage==='/'"/>
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
    </div>

</template>
<script>
//1. 判断是否创建了私钥 否则进入创建私钥页面 Create
//2. 判断是否解锁了私钥 否则进入解锁页面 Unlock
//3. 进入正常钱包页面  Wallet
import CreateWallet from './views/CreateWallet.vue'
import Account from './views/Account'
import Unlock from './views/Unlock'
import Connect from './views/Connect'
import Issue from './views/Issue'
import Genesis from "./views/Genesis";
import Pay from "./views/Pay";
import TransferNft from "./views/TransferNft";
import PayToken from "./views/PayToken";
import ImportWallet from "./views/ImportWallet";
import Merge from "./views/Merge";
import Setting from "./views/Setting";
import SignTx from "./views/SignTx";
import SignMsg from "./views/SignMsg";
import ExportWallet from "./views/ExportWallet";
import ImportPrivate from "./views/ImportPrivate";
import ExportPrivate from "./views/ExportPrivate";

import AccountChoose from "./components/AccountChoose";


const urlParams = new URLSearchParams(window.location.hash.slice(1));
const request = JSON.parse(urlParams.get('request'));

export default {
    components: {
        CreateWallet,
        Account,
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
    },
    data() {
        return {
            width: document.body.clientWidth,
            walletName: config.walletName,
            currentPage: routerManager.getCurrentPage(),
            count: global.bg.count,
            showAccountChoose: false,
            version: config.version,
            // showSetting: true
        }
    },
    computed: {
        showSetting() {
            return this.currentPage === '/account'
        },
        showAccountChoose() {
            return this.currentPage === '/'
        }
    },
    beforeCreate() {
        routerManager.addListener((url) => {
            this.currentPage = url;
        });


        if (request && request.method === 'connect') {
            console.log('链接钱包');
            routerManager.goto('/connect')
        }

        if (request && request.method === 'genesis') {
            console.log('genesis NFT');
            routerManager.goto('/genesis')
        }
        if (request && request.method === 'issue') {
            console.log('issue NFT');
            routerManager.goto('/issue')
        }

        if (request && request.method === 'pay') {
            console.log('支付');
            routerManager.goto('/pay')
        }
        if (request && request.method === 'payToken') {
            console.log('支付Token');
            routerManager.goto('/payToken')
        }
        if (request && request.method === 'transferNft') {
            console.log('转移NFT');
            routerManager.goto('/transferNft')
        }
        if (request && request.method === 'signTx') {
            console.log('签名交易');
            routerManager.goto('/signTx')
        }
        if (request && request.method === 'checkTokenUtxoCount') {
            console.log('合并Utxo');
            routerManager.goto('/merge')
        }
        if (request && request.method === 'signMsg') {
            console.log('签名消息');
            routerManager.goto('/signMsg')
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
        //    版本检查 ， 热门检查


    },
    methods: {
        newVersion(){
            if(this.$store.getters.hasNewVersion){

                let url = this.$store.state.version.url;
                localManager.setVersionChecked(this.$store.state.version.versionCode)
                this.$store.commit("refreshVersionCheck")

                antModal.confirm({
                    title: this.$t('app.has_new_version'),
                    content: this.$store.state.version.detail,
                    onOk() {
                        if(url)
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
        }
    }
}

</script>

<style lang="scss">
$base-color: #E0534F;

body {
    margin: 0;
    min-width: 375px;
    height: 600px;
    min-height: 600px;
    font-size: 14px;

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
    height: 56px;
    box-sizing: border-box;
    //background-color: #22ccff;
    background-color: #FaFaFa;
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
            height: 42px;
        }
    }

    .right {
        position: absolute;
        right: 16px;
        cursor: pointer;

        display: flex;
        align-items: center;

        .red-point{
            top: 1px;
            right:-2px;
        }

    }

    .version{
        position: absolute;
        right: 16px;

        font-size: 12px;
        color: #bbb;
        margin-right: 4px;

        &.right-little{
            right: 50px;
        }

        &.has-new{
            cursor: pointer;
            .red-point{
                display: block;

            }
        }
    }

}


.red-point{
    width: 8px;
    height: 8px;

    position: absolute;
    top: -4px;
    right: -6px;

    border-radius: 50%;
    background-color: red;

    display: none;

    &.show{
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
    height: calc(100vh - 56px);
    overflow-y: scroll;
    &::-webkit-scrollbar{
        width:0;
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

.footer {
    margin-top: 8px;
    height: 36px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;

    a {
        margin: 0 16px;
        color: #57606a;
        display: flex;
        align-items: center;


        img,svg {
            border-radius: 50%;
            width: 18px;
            height: 18px;
            margin-right:8px;
        }
    }
}

.panel {
    width: 375px;
    box-shadow: 0 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);
    margin: 0 auto;
    padding: 20px;
    border-radius: 4px;
    //line-height: 1.43;
    letter-spacing: 0.01071em;

    @media (min-width: 450px) {
        margin-top: 10px;
    }

    &.no-shadow {
        box-shadow: unset;

    }
}


.ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.base-token-list {

    max-height: 60vh;
    overflow: scroll;
    //scroll
    &::-webkit-scrollbar {
        width: 0;
    }

    .title-container {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .action {
            color: #666;
            text-decoration: underline;
            cursor: pointer;
        }
    }

    .title {
        font-size: 16px;

        &:not(:first-child) {
            margin-top: 10px;
        }

    }

    .item {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        background-color: #ddeeff;
        border-radius: 5px;
        padding: 8px;

        overflow: hidden;
        position: relative;

        .added {
            width: 48px;
            position: absolute;
            top: -4px;
            right: -4px;
        }

        &:not(:first-child) {
            margin-top: 10px;
        }

        img {
            border-radius: 50%;
            width: 36px;
        }

        .info {
            margin: 0 16px;

            .name {

            }

            .genesis {
                font-size: 12px;
                color: #666;
                width: calc(100vw - 144px);
            }
        }
    }
}

.trans-info-container {
    input {
        &:not(:first-child) {
            margin-top: 16px;
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

.add-choose-container{
    display: flex;
    flex-direction: column;

    .item{
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

    .line{

    }
}

.copy-address{
    padding: 4px 8px;
    border-radius: 5px;

    &:hover {
        background-color: #F2F3F4;
    }

    &:active {
        background-color: #e2e3e4;
    }
}

.more-action{
    position: absolute;
    right: 16px;

    img{
        width: 32px;
        height: 32px;
    }
}

.integer{

}
.decimal{
    font-size: .85em;
    color: #888;
}

</style>
