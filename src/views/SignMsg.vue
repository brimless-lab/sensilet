<template>
    <div class="panel">
        <div class="title" v-if="origin">{{$t('popup.sign_msg_request')}}</div>
        <div class="pay-info" v-if="origin">
            <div class="origin">{{ origin }}</div>
        </div>
        <div class="notice">
            {{$t('popup.sign_notice')}}
        </div>
        <div class="notice">{{$t('popup.sign_msg')}}</div>
        <div class="msg-panel">{{msg}}</div>
        <div class="action-container" v-if="!isCreating">
            <a-button @click="cancel">{{$t('popup.cancel')}}</a-button>
            <a-button type="primary" @click="commit">{{$t('popup.sign')}}</a-button>
        </div>
        <a-spin v-else/>
    </div>
</template>

<script>

const urlParams = new URLSearchParams(window.location.hash.slice(1));
const origin = urlParams.get('origin');
const request = JSON.parse(urlParams.get('request'));

export default {
    name: "Pay",
    data() {
        console.log(request.params)
        return {
            isCreating: false,
            origin,
            msg: request.params.msg,
        }
    },
    async mounted() {

    },
    methods: {
        cancel(result = 'cancel') {
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
                await sleep(10)

                chrome.runtime.sendMessage({
                    channel: 'sato_extension_background_channel',
                    data: {
                        id: request.id,
                        result: "success",
                        data :walletManager.signMessage(this.msg),
                    },
                });
                window.close();

            } catch (e) {
                console.error(e)
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
.msg-panel{
    max-height: 300px;
    overflow-y: scroll;
    margin: 16px 0;
    padding: 8px;
    border-radius: 5px;
    border: 1px #ccc solid;
    background-color: whitesmoke;
    white-space: pre-line;
    overflow-wrap: break-word;
    line-height: 140%;
    font-family: Euclid, Roboto, Helvetica, Arial, sans-serif;
    color: #5d5d5d;
    font-style: normal;
    font-weight: normal;
    text-align: left;
    &::-webkit-scrollbar{
        width:0;
        height: 0;
    }
}
</style>
