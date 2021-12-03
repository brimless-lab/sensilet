<template>
    <div class="setting-container">
        <div class="setting">
            <div class="connect-top">
                <div class="back btn" @click="goBack">
                    <img class="icon" src="../assets/icon-arrow-left.svg" alt="">
                </div>
                <a-dropdown placement="bottomCenter" v-if="account!=null"
                            :trigger="['click']">
                    <div class="current-account btn" @click.prevent>
                        <div style="display: flex;align-items: center">
                            <HeadPicture :address="account.address" style="width: 40px;height: 40px;;margin-right: 10px;padding: 8px"/>
                            <div class="word ellipsis account-word">
                                <div class="account">
                                    {{ account.alias }}
                                    <span class="account-mode">{{ $t(accountMode) }}</span>
                                </div>
                                <div class="address">
                                    {{ account.addressShow }}
                                </div>
                            </div>
                        </div>
                        <DownOutlined style="color:#999;font-size: 22px ;padding-left: 4px"/>
                    </div>
                    <template #overlay>
                        <a-menu v-if="addressList  && addressList .length>0" style="max-height: 60vh;overflow-y: scroll">
                            <a-menu-item v-for="item in addressList" @click="choose(item)" class="account-item"
                                         :class="{'selected':item.address===account.address}">
                                <div style="display: flex;align-items: center">
                                    <HeadPicture :address="item.address" style="width: 40px;height: 40px; margin-right: 10px;padding: 8px;"/>
                                    <div class="info" :class="{'has-alias':item.alias}">
                                        <div class="alias ">
                                            <div class="account">
                                                <div class="alias-word ellipsis">{{ item.alias }}</div>
                                                <span class="account-mode"> {{ $t(item.accountMode) }}</span>
                                            </div>
                                            <!--                            <EditOutlined style="padding: 8px" @click.stop="openEdit(item)"/>-->
                                        </div>
                                        <div class="address">
                                            {{ item.addressShow }}
                                        </div>
                                    </div>
                                </div>
                                <CheckOutlined class="arrow"></CheckOutlined>
                            </a-menu-item>
                        </a-menu>
                    </template>
                </a-dropdown>
            </div>


            <div class="action-list">
                <div class="divider">
                    {{$t('setting.connected_web')}}
                </div>
                <div v-if="list == null ">
                    <a-spin></a-spin>
                </div>
                <div v-else-if="Object.keys(list).length<=0" style="text-align: center">
                    {{$t('setting.empty')}}
                </div>
                <div v-else>
                    <div class="item" v-for="(item,index) in list">
                        <div>
                            <img src="../assets/icon-checked.svg" alt="" style="width: 22px;height: 22px">
                            {{ item.originShow }}
                        </div>
                        <div class="delete-btn" @click="disconnect(item.origin)">
                            {{$t('setting.disconnect')}}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import connectManager from '../manager/ConnectManager'

import DownOutlined from '@ant-design/icons-vue/lib/icons/DownOutlined'
import CheckOutlined from '@ant-design/icons-vue/lib/icons/CheckOutlined'
import DeleteOutlined from '@ant-design/icons-vue/lib/icons/DeleteOutlined'

import HeadPicture from "@/components/HeadPicture";

export default {
    name: "ConnectManagement",
    components: {
        HeadPicture,
        DownOutlined, CheckOutlined, DeleteOutlined
    },
    data() {
        return {
            accountMode: walletManager.getAccountMode(),
            account: this.$store.state.account,
            addressList: this.$store.state.accountList,
            list: null,
        }
    },
    async mounted() {
        await this.refreshConnected();
    },
    methods: {
        async refreshConnected() {
            let origin = this.$store.state.activeTab.origin;

            this.list = null;
            let temp = await connectManager.list(this.account.address);
            let list = [];
            if (temp && Object.keys(temp).length > 0) {
                for (let key in temp) {
                    temp[key].origin = key;
                    temp[key].originShow = key.replace("https://", "").replace("http://", "")

                    if(key===origin){
                        temp[key].isActive = true;
                        list.unshift(temp[key])
                    }else {
                        list.push(temp[key])
                    }
                }
            }
            if (origin) {

            }
            this.list = list
        },
        goBack() {
            routerManager.gotoHome();
        },
        async choose(account) {
            this.account = account;
            await this.refreshConnected();
        },
        disconnect(origin) {
            let _this = this;
            antModal.confirm({
                title: this.$t('setting.disconnect') + " " + origin,
                content: this.$t('setting.disconnect_notice'),
                async onOk() {
                    await connectManager.disconnect(_this.account.address, origin, true);
                    //这个不等同步
                    _this.refreshConnected();
                }
            })

        }

    }
}
</script>

<style scoped lang="scss">
@import "../style/color";

.setting-container {
    height: calc(100vh - 48px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: $main-bg;

}

.setting {
    flex: 1;
    width: 375px;
    margin: 16px auto 16px;
    padding: 16px;
    background-color: #fafafa;
    border-radius: 10px;
    box-shadow: 0 1px 2px #ddd;

    display: flex;
    flex-direction: column;

    .btn {
        position: relative;
        box-shadow: 0 1px 2px #ddd;

        &:hover {
            box-shadow: 0 2px 4px #ddd;
        }

        &:active {
            box-shadow: 0 1px 1px #ddd;
        }

        .value {

        }

    }

    .connect-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .back {
        width: 42px;
        height: 42px;
        background-color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .action-list {
        flex: 1;
        padding-top: 20px;

        .divider {
            padding: 4px;
            font-size: 16px;
            font-weight: bold;

            //margin-top: 32px;
            margin-bottom: 20px;
            border-bottom: 1px solid $base-color;

            display: flex;
            align-items: center;
            justify-content: space-between;

        }

        .item {
            background-color: white;
            margin-bottom: 20px;
            padding: 8px 16px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            position: relative;

            .two-line {
                //flex: 1;
                margin-left: 10px;
                font-weight: bold;

                div {
                    display: flex;
                    justify-content: space-between;

                    span {
                        color: #999;
                    }
                }
            }

            img {
                width: 28px;
                height: 28px;
            }

            &.warning {
                color: #ee0000;
            }

            .red-point {
                width: 10px;
                height: 10px;
                top: 0;
                right: 0;
            }

            .item-icon {
                font-size: 22px;
                color: #888;
            }

            .value {
                margin-left: 8px;
                color: #999;
            }
        }
    }
}

.current-account {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-radius: 2em;
    padding: 4px 24px;
    cursor: pointer;
    width: 270px;

    transition: .35s;

    background-color: white;
    box-shadow: 0px 8px 16px 0px rgb(0 0 0 / 5%);;


    .word {
        font-size: 16px;
        max-width: 180px;
        color: #333;
    }

    .account-word {
        display: flex;
        flex-direction: column;
        //align-items: center;
        //justify-content: space-around;

        .address {
            font-size: 12px;
            color: #999;
        }

    }
}


.account-item {

    .info {
        padding: 4px;
        display: flex;
        flex-direction: column;
        //align-items: center;
        //justify-content: space-between;
        max-width: 325px;
        min-width: 240px;


        .alias {
            //width: 120px;
            //overflow: scroll;
            display: flex;
            align-items: center;

            .account {
                display: flex;
                flex-direction: row;
            }

            .alias-word {
                max-width: 120px;
                margin-right: 8px;
            }

            &::-webkit-scrollbar {
                display: none;
            }
        }

        .address {
            //font-family: 'Courier New', Monaco, 'Helvetica Neue', Helvetica, Arial, sans-serif;
            //padding-left: 8px;
            //font-size: 12px;
            color: #999;

            //display: flex;
            //flex-direction: column;
            //align-items: center;
            //justify-content: space-between;

        }

    }

    .selected {

    }
}

.delete-btn {
    padding: 4px 16px;
    border-radius: 2em;
    background-color: #f1f2f3;
    font-weight: 700;
    color: #527195;
    cursor: pointer;
}

</style>
