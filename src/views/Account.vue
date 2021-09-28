<template>
  <div class="panel">
    <div class="account-top">
      <div class="title"> Main Account {{ test }}</div>
      <!--            <div class="action-container">-->
      <!--                <div class="add">-->
      <!--                    <PlusOutlined/>-->
      <!--                </div>-->
      <!--            </div>-->
    </div>
    <div class="list" v-if="asset.length<=0" style="text-align: center">
      <a-spin/>
    </div>
    <div class="list" v-else>
      <div class="item" v-for="item in asset" :class="{'open':item.open}">
        <div class="info" @click="item.open=!item.open">
          <div class="left">

            <img v-if="item.name==='BSV'" style="width: 32px;height: 32px;border-radius: 50%" src="../assets/bsv-icon.svg" alt="">
          </div>
          <div class="mid">
            <div class="balance">
              <a-spin v-if="item.isRefreshingAmount"/>
              <span v-else>{{ item.balance.total / Math.pow(10, item.decimal) }} {{ item.name }}</span>
            </div>
            <div class="address">{{ item.address }}</div>
          </div>
          <div class="right">
            <DownOutlined/>
          </div>
        </div>
        <div class="action-container">
          <a-button @click="receive(item)">接收</a-button>
          <a-button @click="sendBsv(item)">发送</a-button>
          <a-modal v-model:visible="item.showQr" :footer="null" :closable=false>
            <div style="display: flex;flex-direction: column;align-items: center">
              <qrcode-vue :value="item.address" :size="200" level="H"/>
              <p style="margin-top: 20px">
                {{ item.address }}
              </p>
            </div>
          </a-modal>
        </div>
      </div>
    </div>

  </div>
  <div class="panel">
    <div class="account-top">
      <div class="title"> Tokens</div>
      <div class="action-container">
        <div class="add" @click="showAddTokenPanel = true">
          <PlusOutlined/>
        </div>
      </div>
    </div>
    <div class="list" v-if="$store.state.tokenList==null" style="text-align: center">
      <a-spin/>
    </div>
    <div class="list" v-else>
      <div class="item" v-for="item in $store.state.tokenList" :class="{'open':item.open}">
        <div class="info" @click="item.open=!item.open">
          <div class="left">

            <img style="width: 32px;height: 32px;border-radius: 50%" :src="item.logo" alt="">
          </div>
          <div class="mid">
            <div class="balance">
              <a-spin v-if="item.isRefreshingAmount"/>
              <span v-else>{{ item.balance / Math.pow(10, item.decimal) }} {{ item.name }}</span>
            </div>
            <div class="address">{{ item.address }}</div>
          </div>
          <div class="right">
            <DownOutlined/>
          </div>
        </div>
        <div class="action-container">
          <a-button @click="receive(item)">接收</a-button>
          <a-button @click="sendToken(item)">发送</a-button>
          <a-modal v-model:visible="item.showQr" :footer="null" :closable=false>
            <div style="display: flex;flex-direction: column;align-items: center">
              <qrcode-vue :value="mainAddress" :size="200" level="H"/>
              <p style="margin-top: 20px">
                {{ mainAddress }}
              </p>
            </div>
          </a-modal>
        </div>
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
<!--  <div class="panel">-->
<!--    <div class="account-top">-->
<!--      <div class="title"> 热门应用</div>-->
<!--    </div>-->
<!--    <div class="app-list">-->
<!--      <div class="item">-->
<!--        <a href="https://main.satoplay.cn">-->
<!--          <img src="https://main.satoplay.cn/logo180.png" alt="">-->
<!--          <span>-->
<!--            小聪游戏-->
<!--          </span>-->
<!--        </a>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->


  <a-modal v-model:visible="showAddTokenPanel" :footer="null" :closable=false>
    <div class="base-token-list">
      <div class="item" v-for="item in baseTokenList" @click="addToken(item)">

        <img :src="item.logo" alt="">
        <div class="info">
          <div class="name">{{ item.name }}</div>
          <div class="genesis ellipsis">Genesis: {{ item.genesis }}</div>
        </div>
      </div>
    </div>
  </a-modal>

  <a-modal v-model:visible="showTransPanel" @ok="transfer()" :closable=false>
    <div class="trans-info-container">
      <a-input v-model:value="transAddress" placeholder="请输入接收地址"/>
      <a-input v-model:value="transAmount" placeholder="请输入金额"/>
    </div>
  </a-modal>


</template>

<script>
import PlusOutlined from '@ant-design/icons-vue/lib/icons/PlusOutlined'
import DownOutlined from '@ant-design/icons-vue/lib/icons/DownOutlined'
import QrcodeVue from 'qrcode.vue'

let transInfo = null;
let transType = "";

export default {
  name: "Account",
  components: {
    QrcodeVue, PlusOutlined,
    DownOutlined
  },
  data() {
    return {
      test: "",
      asset: [],
      nftGenesisList: null,
      tokenList: null,
      showAddTokenPanel: false,
      baseTokenList: tokenManager.baseTokenList,
      mainAddress: walletManager.getMainAddress(),
      showTransPanel: false,
      transAddress: "",
      transAmount: 0,
    }
  },
  beforeCreate() {

  },
  async created() {
    let assetData = {
      name: 'BSV',
      balance: {},
      decimal: 8,
      isRefreshingAmount: true,
      address: walletManager.getMainAddress(),
      open: false
    };


    let balance = await walletManager.getBsvBalance();

    assetData.balance = {
      total: balance.confirmed + balance.unconfirmed,
      confirmed: balance.confirmed,
      unconfirmed: balance.unconfirmed,
    };
    assetData.isRefreshingAmount = false;

    this.asset.push(
        assetData
    );

    this.nftGenesisList = await nftManager.listAllNft().catch(e => []);

    await this.refreshToken();

  },
  methods: {

    receive(item) {
      item.showQr = true
    },
    async refreshToken() {
      this.$store.dispatch('refreshAllToken')
    },
    async addToken(item) {
      let err = tokenManager.addToken(item);
      if (!err) {
        this.showAddTokenPanel = false;
        await this.refreshToken()
      }
    },
    sendToken(item) {
      transType = 'TOKEN';
      transInfo = item;
      this.showTransPanel = true;
    },
    sendBsv(item) {
      transType = 'BSV';
      transInfo = item;
      this.showTransPanel = true;
    },
    transfer() {
      //检查信息
      if (!walletManager.checkBsvAddress(this.transAddress)) {
        return antMessage.error("无效的转出地址")
      }

      let amount = this.transAmount;
      if (isNaN(amount))
        return antMessage.error("无效的金额");

      switch (transType) {
        case "BSV":
          amount = Math.round(parseFloat(amount) * Math.pow(10, 8));
          if (amount <= 0)
            return antMessage.error("转出金额需大于0");
          if (amount > transInfo.balance.total)
            return antMessage.error("账户余额不足");

          routerManager.goto('/pay', {
            broadcast: true,
            address: this.transAddress,
            amount,
          });
          break;
        case "TOKEN":

          amount = Math.round(parseFloat(amount) * Math.pow(10, transInfo.decimal));
          if (amount <= 0)
            return antMessage.error("转出金额需大于0");
          if (amount > transInfo.balance)
            return antMessage.error("账户余额不足");

          routerManager.goto('/payToken', {
            genesis: transInfo.genesis,
            broadcast: true,
            address: this.transAddress,
            amount,
          });
          break;
      }
    }
  }
}
</script>

<style scoped lang="scss">
.panel {
  padding: 0
}

.account-top {
  height: 56px;
  width: 100%;
  padding: 0 16px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: #f5f5f5;
  color: rgba(0, 0, 0, .87);

  .title {

  }

  .action-container {
    .add {

    }
  }
}

.app-list {
  display: flex;
  .item {
    padding: 8px;
    a {
      display: flex;
      flex-direction: column;

      img {
        width: 64px;
        height: 64px;
      }
      span{
        margin-top: 8px;
      }
    }
  }
}

.list {
  .item {

    .info {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
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

        }

        .address {
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 260px;
        }

      }

      .right {
        transition: .25s ease-in-out;

        span {
          font-size: 18px;

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
