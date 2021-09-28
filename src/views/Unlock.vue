<template>
    <div class="panel">
        <div class="title">解锁钱包</div>
        <a-input class="password" v-model:value="password" placeholder="请输入密码..." type="password"/>
        <a-checkbox class="keep" v-model:checked="keepUnlock">
            <span>保持解锁</span>
        </a-checkbox>
        <div class="btn-container">
            <a-button v-if="!isGoingToNext" type="primary" @click="unlock">解锁</a-button>
            <a-spin v-if="isGoingToNext"/>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Unlock",
        data() {
            return {
                keepUnlock: false,
                isGoingToNext:false,
                password: "",
            }
        },
        beforeCreate() {

            if (walletManager.isMnemonicCreate()) {
                if (!walletManager.isNeedUnlock()) {
                    //无需解锁
                    goNextPage()
                }
            } else {
                //未创建 助记词
                routerManager.goto('/')
            }
        },
        methods: {
            unlock() {
                this.isGoingToNext = true;
                setTimeout(()=>{
                    if (walletManager.unlock(this.password, this.keepUnlock)) {
                        goNextPage()
                    } else {
                        antMessage.error("密码错误")
                        this.isGoingToNext = false;
                    }
                },100);

            }
        }
    }

    function goNextPage() {

        let url = sessionStorage.getItem('go_for_url');
        let data = sessionStorage.getItem('go_for_url_data');
        if(data)
            data = JSON.parse(data);
        if (url) {
            sessionStorage.removeItem('go_for_url');
            routerManager.goto(url,data);
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

    .password, .keep {
        margin-top: 10px;
    }

    .btn-container {
        margin-top: 10px;
        display: flex;
        justify-content: flex-end;
    }
</style>
