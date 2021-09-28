<template>
  <div class="panel">
    <div class="title" v-if="origin">此网站申请支付BSV</div>
    <div class="pay-info" v-if="origin">
      <div class="origin">{{ origin }}</div>
    </div>

    <div class="receive-item" v-for="item in receivers">
    <div class="notice">收款地址： {{ item.address }}</div>
    <div class="notice">支付金额：
      <CoinShow :value="item.amount" :big-unit="BSV" :decimal="8" fixed="8" show-big-unit/>
    </div>
    </div>

    <div class="notice">手续费约：
      <CoinShow :value="fee" :big-unit="BSV" :decimal="8" fixed="8" show-big-unit/>
    </div>
    <div class="notice">是否广播： {{ broadcast ? "是" : "否" }}</div>
    <div class="action-container" v-if="!isCreating">
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
  name: "Pay",
  components: {CoinShow},

  data() {
    let data = {
      isCreating: false,
      origin,
      fee: null,
    };

    let routerData = routerManager.data;
    if (routerData) {
      data.receivers = [{amount:routerData.amount,address:routerData.address}]
      data.broadcast = routerData.broadcast;
    } else {
      data.receivers = request.params.receivers;
      data.broadcast = request.params.broadcast;
    }
    return data
  },
  async mounted() {
    //
    // let op = "";
    // this.fee = await nftManager.sensibleNft.getIssueFee(op);
    let {fee} = await walletManager.payArray(this.receivers, false);
    this.fee = fee;
  },
  methods: {
    cancel() {
      if (this.origin) {
        chrome.runtime.sendMessage({
          channel: 'sato_extension_background_channel',
          data: {
            id: request.id,
            result: "cancel"
          },
        });
        window.close();
      } else {
        routerManager.gotoHome();
      }
    },
    async commit() {
      try {
        this.isCreating = true;
        let {rawHex, txid} = await walletManager.payArray(this.receivers, this.broadcast);

        if (this.origin) {

          chrome.runtime.sendMessage({
            channel: 'sato_extension_background_channel',
            data: {
              id: request.id,
              result: "success",
              data: this.broadcast ? txid : rawHex,
            },
          });
          window.close();
        } else {

          routerManager.gotoHome();
        }
      } catch (e) {
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
</style>
