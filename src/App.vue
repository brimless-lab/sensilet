<template>
  <div class="top">
    <div class="title" @click="gotoHome()">
      <img v-if="width>576" src="./assets/logo_h.png" alt="logo">
      <img v-else src="./assets/logo.png" alt="logo">
    </div>
    <AccountChoose/>
    <div class="right" @click="gotoSetting()">
      <img class="icon" src="./assets/icon-setting.svg" alt="">
    </div>
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

import AccountChoose from "./components/AccountChoose";

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
    AccountChoose,
    PayToken,
    ImportWallet,
    Merge,
    Setting,
  },
  beforeCreate() {
    routerManager.addListener((url) => {
      this.currentPage = url;
    });

    const urlParams = new URLSearchParams(window.location.hash.slice(1));
    const request = JSON.parse(urlParams.get('request'));

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
  },
  data() {
    return {
      width:document.body.clientWidth,
      walletName: config.walletName,
      currentPage: routerManager.getCurrentPage(),
      count: global.bg.count
    }
  },
  mounted() {
    //    版本检查 ， 热门检查
  },
  methods: {
    openWeb(url) {
      window.open(window.location.href)
    },
    gotoHome() {
      routerManager.gotoHome();
    },
    gotoSetting(){
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

  @media(min-width: 376px){
    min-height: 100vh;
  }
  /*@media(max-width: 374px) {*/
  /*    min-width: 325px;*/

  /*}*/
}

.icon{
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
  background-color: #F2F3F4;
  color: #fff;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.12);

  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;

  .title {
    position: absolute;
    left: 16px;

    img {
      height: 42px;
    }
  }

  .right {
    position: absolute;
    right: 16px;
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

}

.panel {
  width: 375px;
  box-shadow: 0 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);
  margin: 0 auto;
  padding: 20px;
  border-radius: 4px;
  line-height: 1.43;
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


  .item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    background-color: #ddeeff;
    border-radius: 5px;
    padding: 8px;

    &:not(:first-child) {
      margin-top: 10px;
    }

    img {
      width: 48px;
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

</style>
