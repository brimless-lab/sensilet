<template>
  <div class="panel" v-if="step===0">
    <div class="title">创建一个新的钱包</div>
    <div class="desc">创建一个新的钱包来保管BSV</div>
    <div class="desc">请务必保存并妥善保管以下12个单词</div>
    <div class="seed-container">
      <div class="seed-title">助记词</div>
      <div v-if="mnemonic" class="content">{{ mnemonic }}</div>
      <div v-else class="content">
        <a-spin/>
      </div>
    </div>
    <div class="desc">您的私钥仅加密保存在当前设备上。</div>
    <div class="desc">如果您清除浏览器储存、设备损坏或丢失，则需要这些文字来恢复钱包。</div>
    <div class="check-container">
                  <a-checkbox v-model:checked="isMnemonicSaved">
                      <span>我已经把助记词保存在了安全的地方。</span>
                  </a-checkbox>
      <!--      <label>-->
      <!--        <input type="checkbox" v-model="isMnemonicSaved">-->
      <!--        <span>我已经把助记词保存在了安全的地方</span>-->
      <!--      </label>-->
<!--      <img id="mnemonicCheckBox" src="../assets/check-box.svg" alt="" @click="toggleCheckBox">-->

    </div>
    <div class="button-container">
      <div class="import-btn" @click="gotoImport()">
        从助记词恢复
      </div>

      <a-button type="primary" @click="next" :disabled="!isMnemonicSaved">下一步</a-button>
    </div>
  </div>
  <div class="panel" v-if="step===1">
    <div class="title">确认助记词</div>
    <div class="desc">请在下方的输入框填入上一步的助记词。</div>
    <a-textarea v-model:value="inputMnemonic" placeholder="请确认助记词..." :rows="3"/>
    <div class="button-container">
      <a-button type="default" @click="pre">上一步</a-button>
      <a-button type="primary" @click="next" :disabled="inputMnemonic!==mnemonic">下一步</a-button>
    </div>
  </div>
  <div class="panel" v-if="step===2">
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
      isMnemonicSaved: false,
      password: "",
      rePassword: "",
      mnemonic: null,
      isGoingToNext: false,
      inputMnemonic: "",
    }
  },
  beforeCreate() {
    if (walletManager.isMnemonicCreate()) {
      if (walletManager.isNeedUnlock()) {
        //    需要解锁
        routerManager.goto('/unlock')
      } else {
        routerManager.goto('/account')
      }
    }
  },
  watch: {
    isMnemonicSaved: (newVal) => {
      console.log(newVal)
    }
  },

  created() {
    let mnemonic = sessionStorage.getItem('mnemonic');
    if (!mnemonic)
      mnemonic = walletManager.createMnemonic();
    sessionStorage.setItem('mnemonic', mnemonic);
    this.mnemonic = mnemonic;
  },
  methods: {
    next() {
      if (this.step === 0) {
        if (this.isMnemonicSaved)
          this.step++;
        else
          antMessage.warning('请先保存助记词并勾选已保存');
      } else if (this.step === 1) {
        this.step++;
      } else if (this.step === 2) {
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

        if (walletManager.saveMnemonic(this.mnemonic, this.password)) {
          sessionStorage.removeItem('mnemonic');

          this.isGoingToNext = true;

          walletManager.refreshLockInfoList();
          this.$store.commit('initAccount')

          //解锁钱包，并跳转到账户页面
          walletManager.unlock(this.password, false);
          goNextPage();
        }
      } else
        antMessage.error("请勿重复添加")
    },
    pre() {
      this.step--;
    },
    gotoImport() {
      routerManager.goto('/import')
    },
    temp() {
      console.log('aaaa')
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

  label {
    display: flex;
    align-items: center;

    span {
      margin-top: 1px;
    }
  }
}

.button-container {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .import-btn {
    color: #666;
    text-decoration: underline;
  }

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
