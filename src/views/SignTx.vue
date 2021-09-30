<template>
  <div class="panel">
    <div class="title" v-if="origin">此网站申请签名此交易</div>
    <div class="pay-info" v-if="origin">
      <div class="origin">{{ origin }}</div>
    </div>


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

    return {
      isCreating: false,
      origin,
      fee: null,
      list: request.params.list
    }
  },
  async mounted() {
    //
    // let op = "";
    // this.fee = await nftManager.sensibleNft.getIssueFee(op);
    // let {fee} = await walletManager.payArray(this.receivers, false);
    // this.fee = fee;
  },
  methods: {
    cancel() {
      chrome.runtime.sendMessage({
        channel: 'sato_extension_background_channel',
        data: {
          id: request.id,
          result: "cancel"
        },
      });
      window.close();
    },
    async commit() {
      try {
        this.isCreating = true;
        // let {rawHex, txid} = await walletManager.payArray(this.receivers, this.broadcast);


        chrome.runtime.sendMessage({
          channel: 'sato_extension_background_channel',
          data: {
            id: request.id,
            result: "success",
            data: {
              sigList: [
                {r: "xxx", s: "xxx", publicKey: "xxx"}
              ]
            },
          },
        });
        window.close();

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
