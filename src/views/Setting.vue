<template>
    <div class="setting-container">
        <div class="setting">
            <div class="back btn" @click="goBack">
                <img class="icon" src="../assets/icon-arrow-left.svg" alt="">
            </div>
            <div class="action-list">
                <div class="item btn" @click="openWeb">
                    <FullscreenOutlined class="item-icon"/>
                    <span>{{ $t("setting.expand_view") }}</span>
                </div>

                <div class="divider">
                    {{ $t('setting.account_management') }}
                    <div class="info-container">
                        <span class="value">{{ $store.getters.alias }}</span>
                        <span class="account-mode">
                        {{ $t(accountMode) }}
                    </span>
                    </div>
                </div>
                <div class="item btn" @click="gotoExplorer">
                    <CompassOutlined class="item-icon"/>
                    <span>{{ $t("setting.view_in_explorer") }}</span>
                </div>
                <!--                <div class="item btn" @click="uploadAddressConfirm()">-->
                <!--                    <img v-if="registered" src="../assets/icon-checked.svg" alt="">-->
                <!--                    <img v-else src="../assets/icon-check.svg" alt="">-->
                <!--                    <div class="two-line">-->
                <!--                        <span>{{ $t("setting.register_address") }}</span>-->
                <!--                        <div>-->
                <!--                            <a href="https://sensilet.com/privacy-policy.html" target="_blank">Privacy</a>-->
                <!--                            <span>{{ $store.getters.addressShow }}</span>-->
                <!--                        </div>-->
                <!--                    </div>-->
                <!--                </div>-->


                <!--                <div class="item btn" v-if="!isSinglePrivateKey" @click="gotoImport">-->
                <!--                    <img src="../assets/icon-import.svg" alt="">-->
                <!--                    <span>{{ $t("setting.import_mnemonic") }}</span>-->
                <!--                </div>-->
                <div class="item btn" v-if="!isSinglePrivateKey" @click="gotoExport">
                    <KeyOutlined class="item-icon"/>
                    <span>{{ $t("setting.export_mnemonic") }}</span>
                </div>
                <!--                <div class="item btn" @click="gotoImportPrivateKey">-->
                <!--                    <img src="../assets/icon-import.svg" alt="">-->
                <!--                    <span>{{ $t("setting.import_private_key") }}</span>-->
                <!--                </div>-->
                <div class="item btn" @click="gotoExportPrivateKey">
                    <KeyOutlined class="item-icon"/>
                    <span>{{ $t("setting.export_private_key") }}</span>
                </div>
                <div class="item btn" @click="openEdit">
                    <EditOutlined class="item-icon"/>
                    <div>
                        <span>{{ $t("setting.edit_account_alias") }}:</span>
                        <span class="value">{{ $store.getters.alias }}</span>
                    </div>
                </div>
                <div class="item btn warning" @click="deleteCurrentAccountConfirm">
                    <DeleteOutlined class="item-icon"/>
                    <span>{{ $t("setting.delete_current_account") }}</span>
                </div>
            </div>
            <div class="bottom">
                <div class="version">
                    <a href="https://github.com/sensilet/sensilet/blob/main/release_notes.md" target="_blank">
                        Sensilet {{ version }}
                    </a>
                </div>
                <div class="term-container">
                    <a href="https://sensilet.com/privacy-policy.html" class="term" target="_blank">
                        {{ $t('setting.privacy') }}
                    </a>
                    <a href="https://sensilet.com/term-of-service.html" class="term" target="_blank">
                        {{ $t('setting.term') }}
                    </a>
                </div>
            </div>
        </div>
        <Footer></Footer>

    </div>
    <a-modal v-model:visible="isShowEdit" @ok="handleOk">
        <p>{{ $t("account.alias_input") }}</p>
        <a-input v-model:value="editAlias" :placeholder="$t('account.alias_input')"/>
    </a-modal>
    <a-modal v-model:visible="isShowDelete" @ok="deleteCurrentAccount">
        <p>{{ $t("setting.delete_confirm") }}</p>
        <a-input v-model:value="inputDelete" :placeholder="$t('setting.delete_confirm')"/>
    </a-modal>
</template>

<script>
import Footer from "../components/Footer";

import KeyOutlined from '@ant-design/icons-vue/lib/icons/KeyOutlined'
import FullscreenOutlined from '@ant-design/icons-vue/lib/icons/FullscreenOutlined'
import EditOutlined from '@ant-design/icons-vue/lib/icons/EditOutlined'
import DeleteOutlined from '@ant-design/icons-vue/lib/icons/DeleteOutlined'
import CompassOutlined from '@ant-design/icons-vue/lib/icons/CompassOutlined'


import {h} from 'vue'

export default {
    name: "Setting",
    components: {
        Footer,
        KeyOutlined,
        FullscreenOutlined, EditOutlined, DeleteOutlined, CompassOutlined
    },
    data() {
        return {
            version: config.version,
            accountMode: walletManager.getAccountMode(),
            editAlias: "",
            isShowEdit: false,
            isShowDelete: false,
            registered: localManager.isAddressRegistered(walletManager.getMainAddress()),
            isSinglePrivateKey: walletManager.isSinglePrivateKey(),
            inputDelete: "",
        }
    },
    methods: {
        openEdit() {
            this.isShowEdit = true;
        },
        handleOk() {
            if (!this.editAlias)
                return;
            if (this.editAlias.length > 12)
                return antMessage.error(this.$t('account.alias_max_limit'))
            if (this.editAlias.length < 1)
                return antMessage.error(this.$t('account.alias_min_limit'))


            walletManager.saveAlias({
                address: this.$store.getters.address,
                alias: this.editAlias
            });

            // console.log(this.$store.state.account, this.showEditItem)
            // if (this.$store.state.account && this.$store.state.account.address === this.showEditItem.address) {
            this.$store.commit('editAlias', this.editAlias)
            // }

            this.isShowEdit = false;
            this.showEditItem = null;
            this.editAlias = "";
        },
        goBack() {
            routerManager.gotoHome();
        },
        gotoImport() {
            routerManager.goto('/import')
        },
        gotoImportPrivateKey() {
            routerManager.goto('/importPrivateKey')
        },
        openWeb() {
            window.open("/popup.html")
        },
        gotoExplorer() {
            window.open(`https://blockcheck.info/address/${this.$store.getters.address}`)
        },
        gotoExport() {
            antModal.confirm({
                title: this.$t('setting.notice_1'),
                content: this.$t('setting.notice_2'),
                onOk() {
                    routerManager.goto('/export')
                }

            })
        },
        gotoExportPrivateKey() {
            antModal.confirm({
                title: this.$t('setting.notice_1'),
                content: this.$t('setting.notice_2'),
                onOk() {
                    routerManager.goto('/exportPrivateKey')
                }

            })
        },
        deleteCurrentAccountConfirm() {
            this.isShowDelete = true;
        },
        deleteCurrentAccount() {
            if (this.inputDelete.toUpperCase() !== "DELETE") {
                return antMessage.warn(this.$t('setting.delete_confirm'))
            }

            walletManager.deleteCurrent();
            eventManager.dispatchAccountChange();
            window.location.reload();
        },

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
    margin: 16px auto 0;
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

    .bottom {
        .version {
            margin: 32px;
            display: flex;
            align-items: center;
            justify-content: center;

            a {
                text-align: center;
                text-decoration: underline;
            }
        }

        .term-container {
            display: flex;
            justify-content: space-around;

            @media (min-width: 720px) {
                display: none;
            }

            .term {
                //margin: 8px;
                color: #888;
            }
        }
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

            margin-top: 32px;
            margin-bottom: 20px;
            border-bottom: 1px solid $base-color;

            display: flex;
            align-items: center;
            justify-content: space-between;

            .info-container {
                display: flex;
                align-items: center;
                .value {
                    padding-right: 8px;
                    font-weight: normal;
                }
                .account-mode{
                    margin-bottom: 1px;
                }
            }

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

</style>
