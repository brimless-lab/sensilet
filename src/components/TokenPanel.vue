<template>
    <div class="panel">
        <div class="account-top">
            <div class="title"> Tokens</div>
            <div v-if="!editTokenMode" class="type-choose">
                <a-radio-group v-model:value="showTokenType" button-style="solid" size="small" @change="showTokenTypeChanged">
                    <a-radio-button value="added">Selected</a-radio-button>
                    <a-radio-button value="all">All</a-radio-button>
                </a-radio-group>
            </div>
            <div v-if="!editTokenMode" class="action-container" :class="{'disable':showTokenType==='all'}">
                <div class="add" @click="openTokenList">
                    <img src="../assets/icon-add.svg" alt="">
                </div>
                <div class="add" @click="enterEditTokenListMode">
                    <img src="../assets/icon-sort.svg" alt="">
                </div>
            </div>
            <div v-else class="action-container">
                <div class="add" @click="cancelEdit">
                    <CloseOutlined/>
                </div>
                <div class="add" @click="commitEdit">
                    <CheckOutlined/>
                </div>
            </div>
        </div>
        <div class="list" v-if="$store.state.tokenList==null" style="padding:16px;text-align: center">
            <a-spin/>
        </div>
        <div class="list" v-else-if="$store.state.tokenList.length>0">
            <div class="item" v-for="(item,index) in editTokenMode? editList:$store.state.tokenList" :class="{'open':item.open&&!editTokenMode }">
                <div class="info" @click="toggleItem(item)">
                    <div class="left" @click="seeTokenDetail(item)">
                        <img :src="item.logo || '/img/empty-token.png'" alt="">
                    </div>
                    <div class="mid">
                        <div class="balance">
                            <a-spin v-if="item.isRefreshingAmount"/>
                            <div v-else>
                                <span>{{ item.name }}</span>

                                <span v-if="!editTokenMode" class="item-amount">
                                            {{ item.balance / Math.pow(10, item.decimal) }}
                                            <span style="color: #999;font-size: 12px" v-if="item.usd">${{ item.usd }}</span>
                                            <span style="color: #999;font-size: 12px" v-else>$ - </span>

                                 </span>
                            </div>
                        </div>
                    </div>
                    <div class="right" v-if="!editTokenMode">
                        <DownOutlined style="color: #999"/>
                    </div>
                    <div class="right actions" v-else>
                        <div class="action" @click="editActionAdd(index)">
                            <ArrowUpOutlined/>
                        </div>
                        <div class="action" @click="editActionSub(index)">
                            <ArrowDownOutlined/>
                        </div>
                        <div class="action" :class="{'checked':item.topped}" @click="editActionTop(index)">
                            <VerticalAlignTopOutlined/>
                        </div>

                        <a-popconfirm
                            title="Are you sure remove this?"
                            @confirm="editActionRemove(index)"
                            :arrowPointAtCenter="true"
                            placement="topRight"
                        >
                            <div class="action">
                                <DeleteOutlined/>
                            </div>
                        </a-popconfirm>

                    </div>
                </div>
                <div class="action-container">
                    <a-button shape="round" @click="receive(item)">
                        <template #icon>
                            <img src="../assets/icon-qrcode.svg" alt="">
                        </template>
                        {{ $t('account.receive') }}
                    </a-button>
                    <a-button shape="round" @click="sendToken(item)" :loading="btnLoading">
                        <template #icon>
                            <img src="../assets/icon-transfer.svg" alt="">
                        </template>
                        {{ $t('account.send') }}
                    </a-button>
                </div>
            </div>
            <div class="refresh-item">
                <span>Total: ${{ $store.state.totalTokenValue}}</span>
                <div class="refresh-icon" @click="refreshToken()">
                    <img src="../assets/icon-refresh.svg" alt="">
                </div>
            </div>
        </div>
        <div class="list" v-else>
            <div class="empty">
                empty
                <div class="refresh-icon" @click="refreshToken()">
                    <img src="../assets/icon-refresh.svg" alt="">
                </div>
            </div>
        </div>
    </div>
    <a-modal v-model:visible="showTransPanel" @ok="transfer()" @cancel="cancelTransfer" :closable=false>

        <div class="trans-info-container" v-if="transInfo">
            <div class="title">
                Send {{ isTransBSV ? "BSV" : transInfo.name }}
            </div>
            <a-input v-model:value="transAddress" @change="transAddressChange" :placeholder="$t('account.input_address')"/>
            <a-input v-model:value="transAmount" @change="transAmountChange"
                     :placeholder="$t('account.input_amount',[transInfo.unit||transInfo.symbol])"/>

            <div class="notice">
                <div class="balance" v-if="transInfo">
                    <div class="key">
                        Balance :
                    </div>
                    <div class="amount">
                        {{ transBalance }} {{ transUnit }}
                    </div>
                    <div class="action" @click="sendAll">Send All</div>
                </div>
                <div class="fee">
                    <div class="key">
                        Fee:
                    </div>
                    <div class="amount">
                        <span v-if="!transFeeLoading">{{ transFee }}</span>
                        <a-spin size="small" v-else/>
                        BSV
                    </div>
                    <div class="action"></div>
                </div>
            </div>
        </div>
    </a-modal>
    <a-modal v-model:visible="isShowAddCustomTokenPanel" @ok="addCustomToken" :closable=false>
        <div class="custom-token-form">
            <a-input class="input" v-model:value="customToken.genesis" placeholder="genesis"/>
            <a-input class="input" v-model:value="customToken.codehash" placeholder="codehash"/>
        </div>
    </a-modal>
    <a-modal v-model:visible="showAddTokenPanel" :footer="null" :closable=false>
        <div class="base-token-list" v-if="baseTokenList">
            <div class="title-container">
                <div class="title">{{ $t('account.token_list') }}</div>
                <div class="action" @click="showAddCustomTokenPanel">{{ $t('account.add_custom_token') }}</div>
            </div>
            <div class="item" v-for="item in baseTokenList" @click="addToken(item)">
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

</template>

<script>
import apiUtils from "@/utils/apiUtils";

import CheckOutlined from '@ant-design/icons-vue/lib/icons/CheckOutlined'
import CloseOutlined from '@ant-design/icons-vue/lib/icons/CloseOutlined'
import DeleteOutlined from '@ant-design/icons-vue/lib/icons/DeleteOutlined'
import ArrowUpOutlined from '@ant-design/icons-vue/lib/icons/ArrowUpOutlined'
import ArrowDownOutlined from '@ant-design/icons-vue/lib/icons/ArrowDownOutlined'
import VerticalAlignTopOutlined from '@ant-design/icons-vue/lib/icons/VerticalAlignTopOutlined'
import DownOutlined from '@ant-design/icons-vue/lib/icons/DownOutlined'


export default {
    name: "TokenPanel",
    components: {
        CheckOutlined,
        CloseOutlined,
        DeleteOutlined,
        ArrowUpOutlined,
        ArrowDownOutlined,
        VerticalAlignTopOutlined,
        DownOutlined,
        isRefreshAmount: false
    },
    props: {
        showQr: Boolean,
    },
    data() {
        return {
            showTokenType: localManager.getShowTokenType(),
            editTokenMode: false,
            editList: [],
            showTransPanel: false,
            transAddress: "",
            transAmount: null,
            transInfo: null,
            transUnit: "",
            transFee: 0,
            transFeeLoading: false,
            transBalance: 0,
            btnLoading: false,
            isShowAddCustomTokenPanel: false,
            showAddTokenPanel: false,
            baseTokenList: null,
            customToken: {},


        }
    },
    async mounted() {
        await this.refreshToken();
    },
    methods: {
        async refreshToken() {
            this.$store.dispatch('refreshAllToken')
        },
        toggleItem(item) {
            if (!this.editTokenMode)
                item.open = !item.open
        },
        showTokenTypeChanged() {
            localManager.setShowTokenType(this.showTokenType)
            this.$store.dispatch('refreshAllToken')
        },
        async openTokenList() {
            if (this.showTokenType === 'all')
                return
            this.showAddTokenPanel = true;
            this.baseTokenList = null;

            this.baseTokenList = await tokenManager.getTokenListNet();

        },
        enterEditTokenListMode() {
            if (this.showTokenType === 'all')
                return
            //拷贝一份token数据用于临时编辑
            let tempList = JSON.parse(JSON.stringify(this.$store.state.tokenList))
            // 遍历，给上基础排序信息
            for (let i = 0; i < tempList.length; i++) {
                if (!tempList[i].addTime) {
                    //    非置顶
                    tempList[i].addTime = 0;
                }
            }
            this.editList = tempList;
            this.editTokenMode = true
        },
        commitEdit() {
            tokenManager.reSaveToken(this.editList)
            this.$store.dispatch('refreshAllToken')

            this.editTokenMode = false;
            this.editList = [];
        },
        cancelEdit() {
            this.editTokenMode = false;
            this.editList = [];
        },
        editActionAdd(index) {
            if (!this.editTokenMode || !this.editList || this.editList.length < 1)
                return
            if (index <= 0)
                return;

            if (!this.editList[index] || !this.editList[index - 1])
                return;

            if (this.editList[index - 1].topped && !this.editList[index].topped)
                return;


            let temp = this.editList[index - 1]
            this.editList[index - 1] = this.editList[index]
            this.editList[index] = temp;
        },
        editActionSub(index) {
            if (!this.editTokenMode || !this.editList || this.editList.length < 1)
                return
            if (index >= this.editList.length - 1)
                return;
            if (!this.editList[index] || !this.editList[index + 1])
                return;
            if (this.editList[index].topped && !this.editList[index + 1].topped)
                return;

            let temp = this.editList[index + 1];
            this.editList[index + 1] = this.editList[index];
            this.editList[index] = temp;

        },
        editActionTop(index) {
            if (!this.editTokenMode || !this.editList || this.editList.length < 1)
                return

            if (!this.editList[index])
                return;

            let temp = this.editList[index];
            if (temp.topped) {
                temp.topped = false;
                //    取消置顶的元素应该放哪呢
                //    暂时策略，移到非置顶的第一个
                this.editList.splice(index, 1);

                let i = this.editList.findIndex(item => !item.topped)

                if (i >= 0)
                    this.editList.splice(i, 0, temp);
                else
                    this.editList.push(temp)

            } else {
                temp.topped = true;
                this.editList.splice(index, 1);
                this.editList.unshift(temp)
            }
        },
        editActionRemove(index) {
            if (!this.editTokenMode || !this.editList || this.editList.length < 1)
                return

            this.editList.splice(index, 1);
        },
        showAddCustomTokenPanel() {
            this.showAddTokenPanel = false;
            this.isShowAddCustomTokenPanel = true;
        },

        async addCustomToken() {
            if (!this.customToken.genesis || !this.customToken.codehash)
                return;

            let result = await apiUtils.getTokenInfo(this.customToken.genesis, this.customToken.codehash)
            if (!result || result.code !== 0)
                return antMessage.error(this.$t("account.token_error"))

            let tokenInfo = result.data;

            this.customToken.decimal = parseInt(this.customToken.decimal)
            return this.addToken({
                codehash: this.customToken.codehash,
                genesis: this.customToken.genesis,
                network: 'mainnet',
                name: tokenInfo.name,
                decimal: tokenInfo.decimal,
                fixed: tokenInfo.fixed || tokenInfo.decimal,
                unit: tokenInfo.symbol,
                logo: tokenInfo.icon,
            })
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
        async sendToken(item) {
            this.transInfo = item;
            this.transUnit = item.unit || item.symbol;
            this.transBalance = item.balance / Math.pow(10, item.decimal);
            this.showTransPanel = true;


        },
        receive(item) {
            // this.showQr = true
            this.$emit('update:showQr', true);
        },

        async sendAll() {

            this.transAmount = this.transBalance;
            this.transAmountChange()

        },
        transAddressChange(value) {
            if (this.transAddress.length >= 26) {
                if (walletManager.checkBsvAddress(this.transAddress) && this.transAmount > 0) {
                    this.calcTransFee()
                }
            }
        },
        transAmountChange(value) {
            if (this.transAmount > 0 && walletManager.checkBsvAddress(this.transAddress)) {
                this.calcTransFee();
            }
        },
        async calcTransFee() {
            if (this.transFeeLoading)
                return
            this.transFeeLoading = true;
            try {
                let amount = Math.round(parseFloat(this.transAmount) * Math.pow(10, this.transInfo.decimal));
                // console.log(amount)

                let signers = null
                let tokenInfo = await tokenManager.getTokenInfo(this.transInfo.genesis, this.transInfo.codehash);
                console.log(tokenInfo)
                if (tokenInfo.notDefaultSigners ||this.transInfo.genesis === "54256eb1b9c815a37c4af1b82791ec6bdf5b3fa3"
                    || this.transInfo.genesis === "8764ede9fa7bf81ba1eec5e1312cf67117d47930") {
                    signers = await tokenManager.sensibleFt.getSignersFromRabinApis(tokenInfo.signers)
                }
                let fee = await tokenManager.sensibleFt.getTransferEsitimate(this.transInfo.codehash, this.transInfo.genesis,
                    [{
                        address: this.transAddress,
                        amount,
                    }], walletManager.getMainWif(), signers
                );
                fee = fee / Math.pow(10, 8)
                this.transFee = fee;

            } catch (e) {
                console.log(e)
                this.transFee = "Invalid"
            } finally {

                this.transFeeLoading = false;
            }
        },
        cancelTransfer() {
            this.transAddress = "";
            this.transAmount = null;
            this.transFeeLoading = false;
            this.transFee = 0;
        },
        async transfer() {
            //检查信息
            if (!walletManager.checkBsvAddress(this.transAddress)) {
                return antMessage.error(this.$t('account.address_error'))
            }

            let amount = this.transAmount;
            if (isNaN(amount))
                return antMessage.error(this.$t('account.amount_error'))


            amount = Math.round(parseFloat(amount) * Math.pow(10, this.transInfo.decimal));
            if (amount <= 0)
                return antMessage.error(this.$t('account.amount_error_2'))
            if (amount > this.transInfo.balance)
                return antMessage.error(this.$t('account.balance_not_enough'))

            this.btnLoading = true;

            //获取token utxo数
            let utxoCount = await tokenManager.sensibleFt.getUtxoCount(this.transInfo.genesis, this.transInfo.codehash, walletManager.getMainAddress());
            //获取bsv utxo数
            let bsvUtxoCount = await walletManager.getBsvUtxoCount();
            if (bsvUtxoCount > 3 || utxoCount >= 20) {
                antMessage.warn(this.$t('popup.merge_notice'))
                return routerManager.goFor('/merge', '/payToken', {
                    genesis: this.transInfo.genesis,
                    broadcast: true,
                    address: this.transAddress,
                    amount,
                });
            }
            console.log(this.transInfo)
            routerManager.goto('/payToken', {
                genesis: this.transInfo.genesis,
                codehash: this.transInfo.codehash,
                broadcast: true,
                address: this.transAddress,
                amount,
            });

        },
        seeTokenDetail({genesis, codehash}) {
            window.open(`https://blockcheck.info/ft/${codehash}/${genesis}`)
        },
    }
}
</script>

<style scoped lang="scss">
@import "../style/color";

.panel {
    padding: 0;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0px 8px 16px 0px rgb(0 0 0 / 7.5%);;
    transition: .25s;

    &:hover {
        box-shadow: 0px 12px 24px 0px rgb(0 0 0 / 15%);;
    }
}

.account-top {
    height: 36px;
    width: 100%;
    padding: 0 8px 0 16px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    background-color: $base-color;
    color: white;
    position: relative;

    &.account {
        margin-top: 24px;

        background-color: $main-bg;
        justify-content: center;
        position: relative;

        .account-mode {
            position: absolute;
            right: 8px;
            color: #bbb;
        }
    }


    .title {
        font-size: 16px;
        font-weight: bold;

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

    .type-choose {
        border-radius: 2em;
        overflow: hidden;

        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    .action-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-left: -8px;

        &.disable {

            opacity: 0.2;
            cursor: none;

            .add {
                cursor: default;
            }
        }

        .sort {

        }

        .add {
            cursor: pointer;
            padding: 4px 6px;
            border-radius: 5px;

            &:hover {
                background-color: rgba(0, 0, 0, .15);
            }

            img {
                width: 22px;
            }
        }


    }
}

.list {

    .empty {
        padding: 16px;
        text-align: center;
        color: #999;
        position: relative;

        .refresh-icon{
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            padding: 4px;
        }
    }

    .item {
        cursor: pointer;
        border-bottom: #eee 1px solid;

        .info {
            display: flex;
            justify-content: space-between;
            padding: 4px 10px;
            align-items: center;

            &:active {
                background-color: #f5f5f5;
            }

            .left {
                //width: 56px;
                padding: 6px;
                display: flex;
                align-items: center;
                justify-content: center;

                img {
                    width: 28px;
                    border-radius: 50%;
                }
            }

            .mid {
                flex-grow: 99;
                margin-right: 16px;
                margin-left: 10px;

                .balance {

                    div {
                        display: flex;
                        justify-content: space-between;
                        margin-right: 8px;
                        align-items: center;
                    }
                }

                .address {
                    color: $font-weaken;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    width: 260px;
                }

                .item-amount{
                    font-weight: bold;
                    display: flex;
                    flex-direction: column;
                    align-items: end;
                }

            }

            .right {
                margin-right: 8px;
                transition: .25s ease-in-out;

                span {
                    font-size: 12px;
                }

                &.actions {
                    display: flex;

                    .action {
                        padding: 8px;
                        margin-right: 2px;
                        border-radius: 4px;
                        display: flex;
                        align-items: center;

                        &.checked {
                            background-color: $base-color;
                            color: white;

                            span {
                                font-weight: bold;
                                font-size: 18px;

                            }
                        }

                        &:hover {
                            background-color: rgba(0, 0, 0, .15);
                        }

                        span {
                            font-size: 16px;
                        }
                    }
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

            position: relative;
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

    .refresh-item{
        padding: 8px 12px;
        display: flex;
        align-items: center;
        justify-content: end;
        span{
            font-weight: bold;
            margin-right: 16px;
            color: #999;
        }
    }
}
</style>


