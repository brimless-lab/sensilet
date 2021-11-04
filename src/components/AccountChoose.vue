<template>
    <a-dropdown placement="bottomCenter" :trigger="['click']">
        <div class="current-account" @click.prevent>

            <div class="word ellipsis account-word" v-if="$store.state.account!=null">
                <div class="account"> {{ $store.getters.alias }} <span class="account-mode">{{ $t(accountMode) }}</span></div>
                <div class="address">
                    {{ $store.getters.addressShow }}
                </div>

            </div>

            <div class="word ellipsis" v-else-if="$store.state.accountList && $store.state.accountList.length>0">
                {{ $t("account.choose") }}

            </div>
            <DownOutlined style="color:#999;font-size: 22px ;padding-left: 4px"/>

        </div>
        <template #overlay>
            <a-menu v-if="$store.state.accountList  && $store.state.accountList .length>0">
                <a-menu-item v-for="item in $store.state.accountList" @click="choose(item)" class="account-item">
                    <div class="info" :class="{'has-alias':item.alias}">
                        <div class="alias ">
                            <div>
                                <div class="alias-word ellipsis">{{ item.alias }}</div>
                                <span class="account-mode"> {{ $t(item.accountMode) }}</span>
                            </div>
                            <EditOutlined style="padding: 8px" @click.stop="openEdit(item)"/>
                        </div>
                        <div class="address">
                            {{ item.addressShow }}
                        </div>
                    </div>
                </a-menu-item>
                <a-menu-divider/>
                <a-menu-item @click="isShowAddNew=true">
                    {{ $t("account.add") }}
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>
    <a-modal v-model:visible="isShowEdit" @ok="handleOk">
        <p>{{ $t("account.alias_input") }}</p>
        <a-input v-model:value="editAlias" :placeholder="$t('account.alias_input')"/>
    </a-modal>
    <a-modal v-model:visible="isShowAddNew" @ok="AddNew" :closable=false>
        <div class="add-choose-container">
            <label class="item">
                <input name="addType" type="radio" v-model="addNewUrl" value="/create"/>
                <span>Create New Mnemonic(12-Words) Account</span>
            </label>
            <div class="line"></div>
            <label class="item">
                <input name="addType" type="radio" v-model="addNewUrl" value="/import"/>
                <span>Restore from Mnemonic</span>
            </label>
            <label class="item">
                <input name="addType" type="radio" v-model="addNewUrl" value="/importPrivateKey"/>
                <span>Restore from Private Key</span>
            </label>
        </div>
    </a-modal>
</template>

<script>
import DownOutlined from '@ant-design/icons-vue/lib/icons/DownOutlined'
import EditOutlined from '@ant-design/icons-vue/lib/icons/EditOutlined'

export default {
    name: "AccountChoose",
    components: {
        DownOutlined, EditOutlined
    },
    data() {
        this.$store.commit('initAccount')
        return {
            showEditItem: null,
            isShowEdit: false,
            editAlias: "",
            accountMode: walletManager.getAccountMode(),
            isShowAddNew: false,
            addNewUrl: '/create',
        }
    },
    methods: {
        add() {
            walletManager.addAccount();
            walletManager.reload();
            window.location.reload();
        },
        openEdit(item) {
            this.showEditItem = item;
            this.isShowEdit = true;
        },
        handleOk() {
            if (!this.editAlias)
                return;
            if (this.editAlias.length > 12)
                return antMessage.error(this.$t('account.alias_max_limit'))
            if (this.editAlias.length < 1)
                return antMessage.error(this.$t('account.alias_min_limit'))

            this.showEditItem.alias = this.editAlias;
            walletManager.saveAlias(this.showEditItem);

            // console.log(this.$store.state.account, this.showEditItem)
            if (this.$store.state.account && this.$store.state.account.address === this.showEditItem.address) {
                this.$store.commit('editAlias', this.editAlias)
            }

            this.isShowEdit = false;
            this.showEditItem = null;
            this.editAlias = "";
        },
        choose(item) {
            walletManager.reload();
            walletManager.chooseAccount(item);
            window.location.reload();
        },
        AddNew() {
            if(this.addNewUrl==='/create'){
                this.add()
            }else
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
    justify-content: center;
    border-radius: 2em;
    padding: 4px 16px;
    cursor: pointer;
    max-width: 375px;
    min-width: 200px;

    background-color: $main-bg;
    transition: .35s;

    &:hover {
        background-color: white;
        box-shadow: 0px 8px 16px 0px rgb(0 0 0 / 5%);;
    }


    .word {
        max-width: 180px;
        color: #333;
    }

    .account-word {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;

        .address {
            font-size: 12px;
            color: #999;
        }

    }
}

.account-mode {
    background-color: #f6f6f6;
    color: #999;
    padding: 0 4px;
    border-radius: 3px;
}

.account-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    border-bottom: 1px #999 solid;

    .info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 325px;
        min-width: 200px;


        .alias {
            width: 120px;
            //overflow: scroll;
            display: flex;
            align-items: center;


            .alias-word {
                width: 90px;
            }

            &::-webkit-scrollbar {
                display: none;
            }
        }

        .address {
            font-family: 'Courier New', Monaco, 'Helvetica Neue', Helvetica, Arial, sans-serif;
            padding-left: 8px;
            color: #666;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;


            .account-mode {

            }
        }

    }
}

.ant-modal-mask {
    z-index: 1000;
}

.ant-modal-wrap {
    z-index: 1001;
}
</style>
