<template>
    <div class="account-container">
        <div>
            <div class="panel">
                <div class="account-top account">
                    <!--                    <div class="title action" > Main Account-->
                    <!--                       -->
                    <!--                    </div>-->
                    <!--            <div class="action-container">-->
                    <!--                <div class="add">-->
                    <!--                    <PlusOutlined/>-->
                    <!--                </div>-->
                    <!--            </div>-->
                    <AccountChoose/>
                </div>
                <div class="list" v-if="bsvAsset==null" style="text-align: center">
                    <a-spin/>
                </div>
                <div class="list" v-else>
                    <div class="bsv-item">
                        <div class="info">


                            <div class="balance">
                                <img src="../assets/bsv-icon.svg" alt="">
                                <a-spin v-if="bsvAsset.isRefreshingAmount"/>
                                <span v-else>{{ bsvAsset.balance.total / Math.pow(10, bsvAsset.decimal) }} {{ bsvAsset.name }}</span>
                            </div>
                            <div class="address" id="icon-copy" :data-clipboard-text="$store.getters.address">
                                {{ bsvAsset.addressShow }}
                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0H1H9V1H1V9H0V0ZM2 2H11V11H2V2ZM3 3H10V10H3V3Z" fill="#989a9b"></path>
                                </svg>
                            </div>

                        </div>
                        <div class="action-container">
                            <a-button @click="receive(bsvAsset)">{{ $t('account.receive') }}</a-button>
                            <a-button @click="sendBsv(bsvAsset)">{{ $t('account.send') }}</a-button>
                            <a-button @click="openHistory(bsvAsset.address)">{{ $t('account.history') }}</a-button>

                            <a-modal v-model:visible="bsvAsset.showQr" :footer="null" :closable=false>
                                <div style="display: flex;flex-direction: column;align-items: center">
                                    <qrcode-vue :value="bsvAsset.address" :size="200" level="H"/>
                                    <p style="margin-top: 20px">
                                        {{ bsvAsset.address }}
                                    </p>
                                </div>
                            </a-modal>
                        </div>
                    </div>
                </div>

            </div>
            <div class="panel">
                <div class="account-top">
                    <div class="title"> Tokens</div>
                    <div class="action-container">
                        <div class="add" @click="openTokenList">
                            <PlusOutlined/>
                        </div>
                    </div>
                </div>
                <div class="list" v-if="$store.state.tokenList==null" style="text-align: center">
                    <a-spin/>
                </div>
                <div class="list" v-else>
                    <div class="item" v-for="item in $store.state.tokenList" :class="{'open':item.open}">
                        <div class="info" @click="item.open=!item.open">
                            <div class="left">

                                <img style="width: 36px;height: 36px;border-radius: 50%" :src="item.logo || '/img/empty-token.png'" alt="">
                            </div>
                            <div class="mid">
                                <div class="balance">
                                    <a-spin v-if="item.isRefreshingAmount"/>
                                    <span v-else>{{ item.balance / Math.pow(10, item.decimal) }} {{ item.name }}</span>
                                </div>
                                <div class="address">{{ item.address }}</div>
                            </div>
                            <div class="right">
                                <DownOutlined/>
                            </div>
                        </div>
                        <div class="action-container">
                            <a-button @click="receive(item)">{{ $t('account.receive') }}</a-button>
                            <a-button @click="sendToken(item)">{{ $t('account.send') }}</a-button>
                            <a-modal v-model:visible="item.showQr" :footer="null" :closable=false>
                                <div style="display: flex;flex-direction: column;align-items: center">
                                    <qrcode-vue :value="mainAddress" :size="200" level="H"/>
                                    <p style="margin-top: 20px">
                                        {{ mainAddress }}
                                    </p>
                                </div>
                            </a-modal>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel" v-if="false">
                <div class="account-top">
                    <div class="title"> NFTs</div>
                </div>
                <div class="list" v-if="nftGenesisList==null" style="text-align: center">
                    <a-spin/>
                </div>
                <div class="nft-list">
                    <div class="item" v-for="item in nftGenesisList">
                        <div class="genesis">
                            Genesis:{{ item.genesis }}
                        </div>
                        <div class="count">{{ item.count }}</div>
                    </div>
                </div>
            </div>
            <div class="panel">
                <div class="account-top">
                    <div class="title"> {{$t('account.hot_app')}}</div>
                </div>
                <div class="app-list" v-if="appList!=null">
                    <div class="item" v-for="item in appList">
                        <a :href="item.url" target="_blank">
                            <img :src="item.logo" alt="">
                            <!--                            <span> {{ item.name }}  </span>-->
                        </a>
                    </div>
                    <div class="item">
                        and more ...
                    </div>
                </div>
                <a-spin v-else></a-spin>
            </div>
        </div>


        <div class="footer">
            <a href="https://sensilet.com" target="_blank">
                <img src="../assets/logo.png" alt="">
                Sensilet
            </a>
            <a href="https://t.me/sensilet" target="_blank">
                <img src="/img/telegram.png" alt="">

                Telegram
            </a>
            <a href="https://github.com/sensilet/sensilet" target="_blank">
                <svg height="24" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true" class="octicon octicon-mark-github v-align-middle">
                    <path fill-rule="evenodd"
                          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                GitHub
            </a>
        </div>
    </div>
    <a-modal v-model:visible="showAddTokenPanel" :footer="null" :closable=false>
        <div class="base-token-list" v-if="baseTokenList">
<!--            <div class="title-container">-->
<!--                <div class="title">{{ $t('account.hot') }}</div>-->
<!--                <div class="action" @click="showAddCustomTokenPanel">{{ $t('account.add_custom_token') }}</div>-->
<!--            </div>-->
<!--            <div class="item " v-for="item in baseTokenList.hot" @click="addToken(item)">-->
<!--                <img :src="item.logo||'/img/empty-token.png'" alt="">-->
<!--                <div class="info">-->
<!--                    <div class="name">{{ item.name }}</div>-->
<!--                    <div class="genesis ellipsis">Genesis: {{ item.genesis }}</div>-->
<!--                </div>-->
<!--                <svg v-if="item.added" t="1634030847866" class="icon added" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1814" width="48"-->
<!--                     height="48">-->
<!--                    <path-->
<!--                        d="M768 85.333333a85.333333 85.333333 0 0 1 85.333333 85.333334v727.978666a42.666667 42.666667 0 0 1-62.677333 37.717334l-258.688-137.301334a42.666667 42.666667 0 0 0-40.021333 0L233.386667 936.32A42.666667 42.666667 0 0 1 170.666667 898.645333V170.666667a85.333333 85.333333 0 0 1 85.333333-85.333334h512z m-83.498667 223.317334a42.666667 42.666667 0 0 0-60.117333 5.248l-164.394667 195.669333-58.965333-66.730667-3.754667-3.754666a42.666667 42.666667 0 0 0-60.16 60.245333l91.733334 103.893333 3.626666 3.626667a42.666667 42.666667 0 0 0 61.013334-4.437333l196.266666-233.642667 3.2-4.266667a42.666667 42.666667 0 0 0-8.448-55.850666z"-->
<!--                        p-id="1815" fill="#1afa29"></path>-->
<!--                </svg>-->
<!--            </div>-->

            <div class="title-container">
                <div class="title">{{ $t('account.token_list') }}</div>
                <div class="action" @click="showAddCustomTokenPanel">{{ $t('account.add_custom_token') }}</div>
            </div>
            <div class="item" v-for="item in baseTokenList.list" @click="addToken(item)">
                <img :src="item.logo||'/img/empty-token.png'" alt="">
                <div class="info">
                    <div class="name">{{ item.name }}</div>
                    <div class="genesis ellipsis">Genesis: {{ item.genesis }}</div>
                </div>
                <svg v-if="item.added" t="1634030847866" class="icon added" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1814" width="48"
                     height="48">
                    <path
                        d="M768 85.333333a85.333333 85.333333 0 0 1 85.333333 85.333334v727.978666a42.666667 42.666667 0 0 1-62.677333 37.717334l-258.688-137.301334a42.666667 42.666667 0 0 0-40.021333 0L233.386667 936.32A42.666667 42.666667 0 0 1 170.666667 898.645333V170.666667a85.333333 85.333333 0 0 1 85.333333-85.333334h512z m-83.498667 223.317334a42.666667 42.666667 0 0 0-60.117333 5.248l-164.394667 195.669333-58.965333-66.730667-3.754667-3.754666a42.666667 42.666667 0 0 0-60.16 60.245333l91.733334 103.893333 3.626666 3.626667a42.666667 42.666667 0 0 0 61.013334-4.437333l196.266666-233.642667 3.2-4.266667a42.666667 42.666667 0 0 0-8.448-55.850666z"
                        p-id="1815" fill="#1afa29"></path>
                </svg>

            </div>
        </div>
        <div v-else style="display:flex;justify-content:center;align-items: center">
            <a-spin/>
        </div>
    </a-modal>

    <a-modal v-model:visible="showTransPanel" @ok="transfer()" :closable=false>
        <div class="trans-info-container">
            <a-input v-model:value="transAddress" :placeholder="$t('account.input_address')"/>
            <a-input v-model:value="transAmount" :placeholder="$t('account.input_amount',[transType==='BSV'? 'BSV':transInfo.unit])"/>
        </div>
    </a-modal>
    <a-modal v-model:visible="isShowAddCustomTokenPanel" @ok="addCustomToken" :closable=false>
        <div class="custom-token-form">
            <a-input class="input" v-model:value="customToken.genesis" placeholder="genesis"/>
            <a-input class="input" v-model:value="customToken.codehash" placeholder="codehash"/>
            <a-input class="input" v-model:value="customToken.name" placeholder="name"/>
            <a-input class="input" v-model:value="customToken.decimal" type="number" placeholder="decimal"/>
        </div>
    </a-modal>
</template>

<script>
import PlusOutlined from '@ant-design/icons-vue/lib/icons/PlusOutlined'
import DownOutlined from '@ant-design/icons-vue/lib/icons/DownOutlined'
import QrcodeVue from 'qrcode.vue'

import AccountChoose from "../components/AccountChoose";
import Clipboard from "clipboard";
import httpUtils from '../utils/httpUtils';

let clip = null;

export default {
    name: "Account",
    components: {
        AccountChoose,

        QrcodeVue, PlusOutlined,
        DownOutlined
    },
    data() {
        return {
            extName: chrome.i18n.getMessage("extName"),
            asset: [],
            bsvAsset: null,
            appList: null,
            nftGenesisList: null,
            tokenList: null,
            showAddTokenPanel: false,
            baseTokenList: null,
            mainAddress: walletManager.getMainAddress(),
            showTransPanel: false,
            transAddress: "",
            transAmount: null,
            transInfo: {},
            transType: "BSV",
            isShowAddCustomTokenPanel: false,
            customToken: {}

        }
    },
    beforeCreate() {
    },
    async created() {

        let assetData = {
            name: 'BSV',
            balance: {},
            decimal: 8,
            isRefreshingAmount: true,
            address: walletManager.getMainAddress(),
            open: false,
        };

        assetData.addressShow = showLongString(assetData.address, 10)

        let balance = await walletManager.getBsvBalance();

        assetData.balance = {
            total: balance.confirmed + balance.unconfirmed,
            confirmed: balance.confirmed,
            unconfirmed: balance.unconfirmed,
        };
        assetData.isRefreshingAmount = false;


        this.bsvAsset = assetData
        this.nftGenesisList = await nftManager.listAllNft().catch(e => []);

        this.getAppList();

        await this.refreshToken();
    },
    mounted() {
        clip = new Clipboard('#icon-copy');
        clip.on('success', e => {
            antMessage.success(this.$t('account.clip', [e.text]));
        });
    },
    unmounted() {
        //卸载组件时，销毁
        clip.destroy()
    },

    methods: {

        receive(item) {
            item.showQr = true
        },
        async refreshToken() {
            this.$store.dispatch('refreshAllToken')
        },
        async openTokenList() {
            this.showAddTokenPanel = true;
            this.baseTokenList = null;

            this.baseTokenList = await tokenManager.getTokenListNet();

        },
        showAddCustomTokenPanel() {
            this.showAddTokenPanel = false;
            this.isShowAddCustomTokenPanel = true;
        },
        addCustomToken() {
            this.customToken.decimal = parseInt(this.customToken.decimal)
            this.addToken(this.customToken)
        },
        async addToken(item) {
            let err = tokenManager.addToken(item);
            if (!err) {
                this.showAddTokenPanel = false;
                this.isShowAddCustomTokenPanel = false;
                this.customToken = {};
                await this.refreshToken()
            } else {
                antMessage.error(err.message)
                console.error(err)

            }
        },
        sendToken(item) {
            this.transType = 'TOKEN';
            this.transInfo = item;
            this.showTransPanel = true;
        },
        sendBsv(item) {
            this.transType = 'BSV';
            this.transInfo = item;
            this.showTransPanel = true;
        },
        transfer() {
            //检查信息
            if (!walletManager.checkBsvAddress(this.transAddress)) {
                return antMessage.error(this.$t('account.address_error'))
            }

            let amount = this.transAmount;
            if (isNaN(amount))
                return antMessage.error(this.$t('account.amount_error'))

            switch (this.transType) {
                case "BSV":
                    amount = Math.round(parseFloat(amount) * Math.pow(10, 8));
                    if (amount <= 0)
                        return antMessage.error(this.$t('account.amount_error_2'))
                    if (amount > this.transInfo.balance.total)
                        return antMessage.error(this.$t('account.balance_not_enough'))

                    routerManager.goto('/pay', {
                        broadcast: true,
                        address: this.transAddress,
                        amount,
                    });
                    break;
                case "TOKEN":

                    amount = Math.round(parseFloat(amount) * Math.pow(10, this.transInfo.decimal));
                    if (amount <= 0)
                        return antMessage.error(this.$t('account.amount_error_2'))
                    if (amount > this.transInfo.balance)
                        return antMessage.error(this.$t('account.balance_not_enough'))

                    routerManager.goto('/payToken', {
                        genesis: this.transInfo.genesis,
                        broadcast: true,
                        address: this.transAddress,
                        amount,
                    });
                    break;
            }
        },
        openHistory(address) {
            window.open(`https://blockcheck.info/address/${address}`)
        },
        async getAppList() {
            this.appList = (await httpUtils.get('https://sensilet.com/api/application_list')).data
        }

    }
}
</script>

<style scoped lang="scss">

.account-container {
    min-height: calc(100vh - 56px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.panel {
    padding: 0
}

.account-top {
    height: 56px;
    width: 100%;
    padding: 0 8px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    background-color: #f5f5f5;
    color: rgba(0, 0, 0, .87);

    &.account {
        justify-content: center;
    }

    .title {


        &.action {
            z-index: 1;
            padding: 4px 16px;
            cursor: pointer;
            border-radius: 5px;

            &:hover {
                background-color: #ddd;
            }
        }
    }

    .action-container {
        .add {
            cursor: pointer;

        }
    }
}

.app-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    .item {
        box-sizing: border-box;
        width: calc(50% - 16px);
        height: 48px;
        padding: 4px;
        margin: 8px;
        background: #fff;
        border-radius: 8px;
        overflow: hidden;

        display: flex;
        align-items: center;
        justify-content: center;
        //box-shadow: 3px 3px 9px 0 rgba(0, 0, 0, 0.1);

        a {
            display: flex;
            flex-direction: column;
            align-items: center;

            img {
                //width: 48px;
                height: 42px;
            }

            span {
                margin-top: 8px;
            }
        }
    }
}

.list {
    .item {
        cursor: pointer;

        .info {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            align-items: center;

            &:active {
                background-color: #f5f5f5;
            }

            .left {
                width: 56px;
                display: flex;
                align-items: center;
                justify-content: center;

                img {
                    width: 48px
                }
            }

            .mid {
                flex-grow: 99;

                .balance {

                }

                .address {
                    color: #666;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    width: 260px;
                }

            }

            .right {
                transition: .25s ease-in-out;

                span {
                    font-size: 18px;

                }
            }
        }

        .action-container {
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 0 32px;


            height: 0;
            overflow: hidden;
            transition: .25s;

            cursor: auto;

        }

        &.open {
            .info {
                .right {
                    transform: rotateZ(180deg);

                    span {
                    }
                }
            }

            .action-container {
                height: 56px;
            }
        }
    }

    .bsv-item {
        margin-top: 16px;

        .info {
            margin-top: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;

            img {
                width: 32px;
                height: 32px;
                border-radius: 50%
            }

            .balance {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                color: #333;

                img {
                    margin-right: 20px;
                }

                //font-weight: bold;
            }

            .address {
                padding: 4px 8px;
                border-radius: 5px;

                &:hover {
                    background-color: #F2F3F4;
                }
                &:active{
                    background-color: #e2e3e4;
                }
            }
        }

        .action-container {
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-around;
        }
    }
}

.nft-list {
    .item {
        display: flex;
        align-items: center;

        .genesis {
            padding: 16px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .count {
            padding-right: 16px;
        }
    }
}

</style>
