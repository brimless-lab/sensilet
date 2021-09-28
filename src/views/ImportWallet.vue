<template>

  <div class="panel" v-if="step===0">
    <div class="title">恢复钱包</div>
    <div class="desc">请在下方填入您的助记词。</div>
    <a-textarea v-model:value="inputMnemonic" placeholder="请输入助记词..." :rows="3"/>
    <div class="button-container">
      <a-button type="default" @click="back()">返回</a-button>

      <a-button type="primary" @click="next" :disabled="inputMnemonic.length<23">下一步</a-button>
    </div>
  </div>
  <div class="panel" v-if="step===1">
    <div class="title">设置密码(可选)</div>
    <div class="desc">设置一个密码来保护您的钱包安全</div>
    <a-input v-model:value="password" placeholder="请输入密码...(可选)" type="password"/>
    <a-input style="margin-top: 10px" v-model:value="rePassword" placeholder="请再次输入密码...(可选)" type="password"/>
    <div class="desc">如果您忘记了你的密码，您需要使用助记词重新恢复钱包</div>
    <div class="button-container">
      <a-button v-if="!isGoingToNext" type="default" @click="pre">上一步</a-button>
      <a-button v-if="!isGoingToNext" type="primary" @click="next">完成</a-button>
      <a-spin v-if="isGoingToNext"/>
    </div>
  </div>
</template>

<script>
export default {
  name: "CreateWallet",
  data: () => {

    return {
      step: 0,
      password: "",
      rePassword: "",
      isGoingToNext: false,
      inputMnemonic: "",
    }
  },
  beforeCreate() {

  },

  created() {
  },
  methods: {
    next() {
      if (this.step === 0) {
        //去掉两边空格后 以空格分割
        let temp = this.inputMnemonic.replace(/(^\s*)|(\s*$)/g, "").split(' ');
        if (temp.length !== 12)
          return antMessage.warning('助记词应有12个单词');

        try {
          //确认助记词是否可用
          walletManager.getSeedFromMnemonic(this.inputMnemonic)
          this.step++;
        } catch (e) {
          antMessage.error(e.message)
        }


      } else if (this.step === 1) {
        //如果输入了密码则检查
        if (this.password && this.password.length > 0) {
          if (this.password !== this.rePassword)
            return antMessage.warning('两次输入的密码不一致');
        }
        if (!this.password) {
          //  没设置则使用 默认密码
          this.password = 'SatoWallet#2021';
          this.rePassword = 'SatoWallet#2021'
        }
        this.isGoingToNext = true;

        if (walletManager.saveMnemonic(this.inputMnemonic, this.password)) {
          walletManager.refreshLockInfoList();
          this.$store.commit('initAccount')
          //解锁钱包，并跳转到账户页面
          walletManager.unlock(this.password, false);
          goNextPage();
        } else {
          antMessage.error('已经存在的助记词，请勿重复添加')
        }
        this.isGoingToNext = false;

      }
    },
    pre() {
      this.step--;
    },
    back() {
      routerManager.goBack();
    }
  }
}

function goNextPage() {

  let url = sessionStorage.getItem('go_for_url');
  let data = sessionStorage.getItem('go_for_url_data');
  if (data)
    data = JSON.parse(data);
  if (url) {
    sessionStorage.removeItem('go_for_url');
    routerManager.goto(url, data);
  } else
    routerManager.goto('/account')

}

</script>

<style scoped lang="scss">


.title {
  font-size: 1.2em;
  font-weight: bold;
  color: #222;
  margin-top: 8px;
}

.desc {
  margin: 12px 0;
}

.seed-container {
  margin-top: 16px;
  margin-bottom: 8px;
  position: relative;

  .seed-title {
    position: absolute;
    top: 0;
    left: 16px;
    padding: 0 4px;
    background-color: white;
    transform: translateY(-50%);
  }

  .content {
    padding: 14px;
    border-radius: 4px;
    cursor: text;
    display: inline-flex;
    box-sizing: border-box;
    align-items: center;

    border: solid 1px #ddd;

    &:hover {
      border: solid 1px #22ccff;
    }
  }
}

.check-container {
  display: flex;
  align-items: center;

  span {
    margin-left: 4px;
  }
}

.button-container {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;

  .button {
    cursor: pointer;
    font-size: 1.1em;
    color: #22ccff;
    padding: 4px 8px;

    &.not-main {
      color: #333;
    }

    &.disable {
      cursor: not-allowed;
      color: #999;
      background-color: #ddd;
    }
  }
}


</style>
