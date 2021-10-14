<template>

    <div class="panel" v-if="step===0">
        <a-input class="password" v-model:value="password" :placeholder="$t('wallet.input_password_2')" type="password"/>

        <div class="button-container">
            <div>
            </div>

            <a-button type="primary" @click="next" >{{ $t('wallet.next') }}</a-button>
<!--            <a-button v-else type="primary">{{ $t('wallet.next') }}</a-button>-->
        </div>
    </div>
    <div class="panel" v-if="step===1">
        <div class="seed-container">
            <div class="seed-title">{{ $t('wallet.mnemonic') }}</div>
            <div v-if="mnemonic" id="mnemonic" class="content">{{ mnemonic }}</div>
            <div v-else class="content">
                <a-spin/>
            </div>
        </div>
        <div class="button-container">
            <div>
            </div>

            <a-button type="primary" @click="goBack" >{{ $t('wallet.commit') }}</a-button>
            <!--            <a-button v-else type="primary">{{ $t('wallet.next') }}</a-button>-->
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
            // isMnemonicSaved: false,
            // btnCanClick: false,
            password: "",

            mnemonic: null,
        }
    },


    created() {

    },
    mounted() {
        if(walletManager.isDefaultPassword()){
            this.next()
        }

    },
    methods: {

        next() {
            if (this.step === 0) {
                if(walletManager.isDefaultPassword()){

                    this.step++;
                }else if(walletManager.checkPassword(this.password)){
                    this.step++;
                }else {
                    antMessage.error(this.$t('wallet.password_error_2'))
                }

                this.mnemonic = walletManager.getMnemonic();

            }
        },
        goBack() {
            routerManager.gotoHome();
        },
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

    &:hover {
        background-color: red;
    }

    .check-box {
        img {
            //width: 24px;
        }
    }

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
