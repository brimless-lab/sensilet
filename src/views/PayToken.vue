<template>
  <div class="panel">
    <div class="title" v-if="origin">此网站申请支付</div>
    <div class="pay-info" v-if="origin">
      <div class="origin">{{ origin }}</div>
    </div>
    <div v-if="tokenInfo" style="margin-top: 20px">
      <img class="logo" :src="tokenInfo.logo" alt="">
      <div class="notice">{{ tokenInfo.name }}</div>
      <div class="notice">Genesis: {{ tokenInfo.genesis }}</div>

      <div class="notice">收款地址： {{ address }}</div>
      <div class="notice">支付金额：
        <CoinShow :value="amount" :big-unit="tokenInfo.unit" :decimal="tokenInfo.decimal" show-big-unit/>
      </div>
      <div class="notice">手续费约：
        <CoinShow :value="fee" big-unit="BSV" :decimal=8 :fixed=8 show-big-unit/>
      </div>
    </div>
    <div class="notice">是否广播： {{ broadcast ? "是" : "否" }}</div>
    <div class="action-container" v-if="!isPaying">
      <a-button @click="cancel">取消</a-button>
      <a-button type="primary" @click="commit">确定</a-button>
    </div>
    <a-spin v-else/>
  </div>
</template>

<script>

const urlParams = new URLSearchParams(window.location.hash.slice(1));
const origin = urlParams.get('origin');
const request = JSON.parse(urlParams.get('request'));
import CoinShow from "../components/CoinShow";

export default {
  name: "PayToken",
  components: {CoinShow},
  data() {


    let data = {
      isPaying: false,
      origin,
      fee: null,
      tokenInfo: null,
    };

    let routerData = routerManager.data;
    if (routerData) {
      data.receivers = [{amount: routerData.amount, address: routerData.address}]
      data.broadcast = routerData.broadcast;
      data.genesis = routerData.genesis;
    } else {
      data.receivers = request.params.receivers;
      data.broadcast = request.params.broadcast;
      data.genesis = request.params.genesis;
    }

    return data;
  },
  async mounted() {
    console.log(this.genesis)
    this.tokenInfo = await tokenManager.getTokenInfo(this.genesis);
    if (!this.tokenInfo) {
      antMessage.error('未知的Token信息');
      routerManager.gotoHome()
    }

    //
    let op = "";
    this.fee = await tokenManager.sensibleFt.getTransferEsitimate(this.tokenInfo.codehash, this.tokenInfo.genesis,
        this.receivers, walletManager.getMainWif()
    );
    //
    // let {rawHex,fee} = await walletManager.pay(this.address, this.amount, this.broadcast);
    // this.fee = fee;
    // this.rawHex = rawHex;
  },
  methods: {
    cancel() {
      if (origin) {
        //外部请求
        chrome.runtime.sendMessage({
          channel: 'sato_extension_background_channel',
          data: {
            id: request.id,
            result: "cancel"
          },
        });
        window.close();
      } else
        routerManager.gotoHome();
    },
    async commit() {

      try {
        this.isPaying = true;
        let result = await tokenManager.transfer(this.receivers, this.tokenInfo);
        console.log(result);
        antMessage.success("支付成功")

        if (origin) {
          //外部请求
          chrome.runtime.sendMessage({
            channel: 'sato_extension_background_channel',
            data: {
              id: request.id,
              result: "success",
              data: this.txid,
            },
          });
          window.close();
        } else {
          routerManager.gotoHome();
        }
      } catch (e) {
        if (e.message.indexOf('Insufficient balance.') > -1) {
          antMessage.error("账户BSV余额不足以支付手续费")
        } else if (e.message.indexOf('Insufficient token') > -1) {
          antMessage.error(`账户内${this.tokenInfo.name}余额不足`)
        } else
          antMessage.error(e.message)
      } finally {
        this.isPaying = false;
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

.logo {
  width: 100px;
  height: 100px;
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
</style>
