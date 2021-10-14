<template>
    <div class="panel" v-if="step===0">
        <div class="title">{{ $t('wallet.create_wallet') }}</div>
        <div class="desc">{{ $t('wallet.create_wallet_notice') }}</div>
        <div class="desc">{{ $t('wallet.create_wallet_notice_2') }}</div>
        <div class="seed-container">
            <div class="seed-title">{{ $t('wallet.mnemonic') }}</div>
            <div v-if="mnemonic" id="mnemonic" class="content">{{ mnemonic }}</div>
            <div v-else class="content">
                <a-spin/>
            </div>
        </div>
        <div class="desc">{{ $t('wallet.create_wallet_notice_3') }}</div>
        <div class="desc">{{ $t('wallet.create_wallet_notice_4') }}</div>
        <div class="check-container" v-if="showCheckContainer">
            <a-checkbox v-model:checked="isMnemonicSaved">
                <span>{{ $t('wallet.mnemonic_saved') }}</span>
            </a-checkbox>

        </div>
        <div class="check-container" v-else style="height: 20px">

        </div>

        <div class="button-container">
            <div class="import-btn" @click="gotoImport()">
                {{ $t('wallet.import_mnemonic') }}
            </div>
            <span>{{ tempWord }}</span>

            <a-button v-if="showCheckContainer" type="primary" @click="next" :disabled="!isMnemonicSaved">{{ $t('wallet.next') }}</a-button>
            <a-button v-else type="primary">{{ $t('wallet.next') }}</a-button>
        </div>
    </div>
    <div class="panel" v-if="step===1">
        <div class="title">{{ $t('wallet.confirm_mnemonic') }}</div>
        <div class="desc">{{ $t('wallet.mnemonic_notice') }}</div>
        <a-textarea v-model:value="inputMnemonic" :placeholder="$t('wallet.confirm_mnemonic_placeholder')" :rows="3"/>

        <div class="button-container">
            <a-button type="default" @click="pre">{{ $t('wallet.pre') }}</a-button>
            <a-button type="primary" @click="next" :disabled="inputMnemonic!==mnemonic">{{ $t('wallet.next') }}</a-button>
        </div>
    </div>
    <div class="panel" v-if="step===2">
        <div class="title">{{ $t('wallet.set_password') }}</div>
        <div class="desc">{{ $t('wallet.set_password_notice') }}</div>
        <a-input v-model:value="password" :placeholder="$t('wallet.input_password')" type="password"/>
        <a-input style="margin-top: 10px" v-model:value="rePassword" :placeholder="$t('wallet.input_password_again')" type="password"/>
        <div class="desc">{{ $t('wallet.set_password_notice_2') }}</div>
        <div class="button-container">
            <a-button v-if="!isGoingToNext" type="default" @click="pre">{{ $t('wallet.pre') }}</a-button>
            <a-button v-if="!isGoingToNext" type="primary" @click="next">{{ $t('wallet.commit') }}</a-button>
            <a-spin v-if="isGoingToNext"/>

        </div>
    </div>
</template>

<script>
let _this = null;
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
            showCheckContainer: true,
            tempWord: null,
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

            //在弹出窗口中，点击checkbox 后 组件未刷新(原因未知)。这里通过v-if 触发强制刷新
            _this.showCheckContainer = false;
            setTimeout(() => {
              _this.showCheckContainer = true;
              document.getElementById("mnemonic").click()
            }, 1)
        }
    },

    created() {
        _this = this;

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
                    antMessage.warning(this.$t('wallet.mnemonic_notice_2'));
            } else if (this.step === 1) {
                this.step++;
            } else if (this.step === 2) {
                //如果输入了密码则检查
                if (this.password && this.password.length > 0) {
                    if (this.password !== this.rePassword)
                        return antMessage.warning(this.$t('wallet.password_error'));
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
                antMessage.error(this.$t('wallet.save_error'))
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
