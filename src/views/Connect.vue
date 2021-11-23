<template>
    <div class="panel">
        <div class="title">{{$t('popup.info_request')}}</div>
        <div class="link-info">
            <div class="origin">{{ origin }}</div>
            <svg t="1624589235932" class="icon" width="32" height="32" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2685"
                 data-spm-anchor-id="a313x.7781069.0.i3">
                <path
                    d="M847.9 592H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h605.2L612.9 851c-4.1 5.2-0.4 13 6.3 13h72.5c4.9 0 9.5-2.2 12.6-6.1l168.8-214.1c16.5-21 1.6-51.8-25.2-51.8zM872 356H266.8l144.3-183c4.1-5.2 0.4-13-6.3-13h-72.5c-4.9 0-9.5 2.2-12.6 6.1L150.9 380.2c-16.5 21-1.6 51.8 25.1 51.8h696c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"
                    p-id="2686" data-spm-anchor-id="a313x.7781069.0.i4" class="selected"></path>
            </svg>
            <div class="account-info">
                <div class="account">{{ $store.getters.alias }}</div>
                <div class="address">{{  $store.getters.addressShow }}</div>
            </div>
        </div>
        <div class="notice">{{$t('popup.connect_notice')}}</div>
        <div class="action-container" v-if="!isConnecting">
            <a-button @click="cancel">{{$t('popup.cancel')}}</a-button>
            <a-button type="primary" @click="connect">{{$t('popup.connect')}}</a-button>
        </div>
        <a-spin v-else/>
    </div>
</template>

<script>
import connectManager from '../manager/ConnectManager'

const urlParams = new URLSearchParams(window.location.hash.slice(1));
const origin = urlParams.get('origin');
const request = JSON.parse(urlParams.get('request'));

console.log(request)
export default {
    name: "Connect",
    data() {

        return {
            origin: origin,
            isConnecting: false,
            address: walletManager.getMainAddress()
        }
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
        async connect() {
            this.isConnecting = true;

            await new Promise(resolve => setTimeout(resolve, 100))
            let address = walletManager.getMainAddress();
            let data = await connectManager.connect(address,origin).catch(e => e);

            chrome.runtime.sendMessage({
                channel: 'sato_extension_background_channel',
                data: {
                    id: request.id,
                    result: "success",
                    data,
                },
            });
            window.close();
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

.link-info {
    margin: 20px 0;

    display: flex;
    align-items: center;
    flex-direction: column;

    .icon {
        margin: 10px;
        transform: rotateZ(90deg);
    }

    .account-info {
        display: flex;
        align-items: center;
        justify-content: center;

        .account {

        }

        .address {
            margin-left: 20px;
            color: #666;
            font-size: 12px
        }
    }
}

.notice {
    margin: 10px;
}

.action-container {
    display: flex;
    justify-content: space-between;
}
</style>
