<template>
    <a-dropdown placement="bottomCenter" :class="{'hide':!$store.state.account && (!$store.state.accountList || $store.state.accountList.length<=0 )}" :trigger="['click']">
        <div class="current-account" @click.prevent>
            <div v-if="$store.state.account!=null && current!=='/create' " style="display: flex;align-items: center">
                <HeadPicture :address="$store.getters.address" style="width: 40px;height: 40px;;margin-right: 10px;padding: 8px"/>
                <div class="word ellipsis account-word">
                    <div class="account">
                        {{ $store.getters.alias }}
                        <span class="account-mode">{{ $t(accountMode) }}</span>
                    </div>
                    <div class="address">
                        {{ $store.getters.addressShow }}
                    </div>
                </div>
            </div>
            <div class="word ellipsis" v-else-if="$store.state.accountList && $store.state.accountList.length>0">
                {{ $t("account.choose") }}
            </div>
            <DownOutlined style="color:#999;font-size: 22px ;padding-left: 4px"/>

        </div>
        <template #overlay>
            <a-menu v-if="$store.state.accountList  && $store.state.accountList .length>0" style="max-height: 60vh;overflow-y: auto">
                <a-menu-item v-for="item in $store.state.accountList" @click="choose(item)" class="account-item"
                             :class="{'selected':item.address===$store.getters.address && current!=='/create' }">
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
                <a-menu-divider/>
                <a-menu-item @click="isShowAddNew=true">
                    {{ $t("account.add") }}
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>

    <a-modal v-model:visible="isShowAddNew" @ok="AddNew" :closable=false>
        <div class="add-choose-container">
            <label class="item">
                <input name="addType" type="radio" v-model="addNewUrl" value="/create"/>
                <span>{{$t('account.add_type_1')}}</span>
            </label>
            <div class="line"></div>
            <label class="item">
                <input name="addType" type="radio" v-model="addNewUrl" value="/import"/>
                <span>{{$t('account.add_type_2')}}</span>
            </label>
            <label class="item">
                <input name="addType" type="radio" v-model="addNewUrl" value="/importPrivateKey"/>
                <span>{{$t('account.add_type_3')}}</span>
            </label>
        </div>
    </a-modal>
</template>

<script>
import DownOutlined from '@ant-design/icons-vue/lib/icons/DownOutlined'
// import EditOutlined from '@ant-design/icons-vue/lib/icons/EditOutlined'
import CheckOutlined from '@ant-design/icons-vue/lib/icons/CheckOutlined'
import HeadPicture from "@/components/HeadPicture";

export default {
    name: "AccountChoose",
    components: {
        HeadPicture,
        DownOutlined, CheckOutlined
    },
    data() {
        return {
            accountMode: walletManager.getAccountMode(),
            showEditItem: null,
            isShowEdit: false,
            editAlias: "",
            isShowAddNew: false,
            addNewUrl: '/create',
            current:routerManager.getCurrentPage()
        }
    },
    methods: {
        add() {
            walletManager.removeAccount();
            walletManager.reload();
            window.location.reload();
        },

        choose(item) {
            if (item.address === this.$store.getters.address) {
                if(this.current==='/create')
                    routerManager.gotoHome()
                return
            }
            walletManager.reload();
            walletManager.chooseAccount(item);
            eventManager.dispatchAccountChange();
            window.location.reload();
        },
        AddNew() {
            // if (this.addNewUrl === '/create') {
            //     this.add()
            // } else
                routerManager.goto(this.addNewUrl)
        }
    }

}


</script>

<style lang="scss" scoped>

@import "../style/color";


.current-account {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-radius: 2em;
    padding: 4px 12px;
    cursor: pointer;

    width: 224px;

    background-color: $main-bg;
    transition: .35s;

    &:hover {
        background-color: white;
        box-shadow: 0px 8px 16px 0px rgb(0 0 0 / 5%);;
    }


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

.ant-modal-mask {
    z-index: 1000;
}

.ant-modal-wrap {
    z-index: 1001;
}
</style>
