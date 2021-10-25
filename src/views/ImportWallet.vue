<template>

    <div class="panel" v-if="step===0">
        <div class="title">{{ $t('wallet.import_mnemonic_2') }}</div>
        <div class="desc">{{ $t('wallet.mnemonic_notice_3') }}</div>
        <a-textarea v-model:value="inputMnemonic" :placeholder="$t('wallet.confirm_mnemonic_placeholder')" :rows="3"/>
        <div class="word-btn" @click="showCustomPanel()">{{ $t('wallet.adv_options') }}</div>

        <div class="button-container">
            <a-button type="default" @click="back()"> {{ $t("wallet.back") }}</a-button>

            <a-button type="primary" @click="next" :disabled="inputMnemonic.length<23">{{ $t("wallet.next") }}</a-button>
        </div>
    </div>
    <div class="panel" v-if="step===1">
        <div class="title">{{ $t("wallet.set_password") }}</div>
        <div class="desc">{{ $t("wallet.set_password_notice") }}</div>
        <a-input v-model:value="password" :placeholder="$t('wallet.input_password')" type="password"/>
        <a-input style="margin-top: 10px" v-model:value="rePassword" :placeholder="$t('wallet.input_password_again')" type="password"/>
        <div class="desc">{{ $t("wallet.set_password_notice_2") }}</div>
        <div class="button-container">
            <a-button v-if="!isGoingToNext" type="default" @click="pre">{{ $t("wallet.pre") }}</a-button>
            <a-button v-if="!isGoingToNext" type="primary" @click="next">{{ $t("wallet.commit") }}</a-button>
            <a-spin v-if="isGoingToNext"/>
        </div>
    </div>
    <a-modal v-model:visible="showCustom" :closable=false @ok="setOpt">

        <div class="custom-panel" v-show="showCustom">
            <div class="notice warning">
                <img src="../assets/icon-warning.svg" alt="warning" class="left">
                <span>
                    {{ $t('wallet.options_notice') }}
                </span>
            </div>
            {{ $t('wallet.passphrase') }}
            <a-tooltip placement="top" color="orange">
                <template #title>
                    <div style="font-size: 14px">
                        {{ $t('wallet.passphrase_import_notice_1') }}<br>
                        {{ $t('wallet.passphrase_import_notice_2') }}
                    </div>
                </template>
                <img src="../assets/icon-question.png" style="width: 24px;margin-bottom: 2px" alt="">
            </a-tooltip>
            <a-input v-model:value="inputPassphrase" />
            {{ $t('wallet.der_path') }}
            <a-input v-model:value="inputPath"/>
        </div>
    </a-modal>
</template>

<script>
export default {
    name: "ImportWallet",
    data: () => {

        return {
            step: 0,
            password: "",
            rePassword: "",
            isGoingToNext: false,
            inputMnemonic: "",
            passphrase: "",
            path: "m/44'/0'/0'",
            showCustom: false,
            inputPassphrase:"",
            inputPath:"m/44'/0'/0'",
        }
    },
    beforeCreate() {

    },

    created() {
    },
    methods: {
        showCustomPanel(){
            this.inputPassphrase = this.passphrase;
            this.inputPath = this.path;
            this.showCustom = true
        },
        setOpt() {
            this.passphrase = this.inputPassphrase;
            this.path = this.inputPath;
            this.showCustom = false;
        },
        next() {
            if (this.step === 0) {
                //去掉两边空格后 以空格分割
                let temp = this.inputMnemonic.replace(/(^\s*)|(\s*$)/g, "").split(' ');
                if (temp.length !== 12)
                    return antMessage.warning(this.$t('wallet.mnemonic_error'));

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
                        return antMessage.warning(this.$t('wallet.password_error'));
                }
                if (!this.password) {
                    //  没设置则使用 默认密码
                    this.password = 'SatoWallet#2021';
                    this.rePassword = 'SatoWallet#2021'
                }
                this.isGoingToNext = true;

                if (walletManager.saveMnemonic(this.inputMnemonic, this.password, false, this.passphrase, this.path)) {
                    walletManager.refreshLockInfoList();
                    walletManager.reload();
                    this.$store.commit('initAccount')
                    //解锁钱包，并跳转到账户页面
                    walletManager.unlock(this.password, false);
                    goNextPage();
                } else {
                    antMessage.error(this.$t('wallet.mnemonic_exist'))
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
