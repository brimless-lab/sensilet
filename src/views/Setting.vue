<template>
    <div class="setting-container">
        <div class="setting">
            <div class="back btn" @click="goBack">
                <img class="icon" src="../assets/icon-arrow-left.svg" alt="">
            </div>
            <div class="action-list">
                <div class="item btn" @click="uploadAddressConfirm()">
                    <img v-if="registered" src="../assets/icon-checked.svg" alt="">
                    <img v-else src="../assets/icon-check.svg" alt="">
                    <div class="two-line">
                        <span>{{ $t("setting.register_address") }}</span>
                        <div>
                            <a href="">Privacy</a>
                            <span>{{ $store.getters.addressShow }}</span>
                        </div>
                    </div>
                </div>
                <div class="item btn" @click="openWeb">
                    <img src="../assets/icon-share.svg" alt="">
                    <span>{{ $t("setting.expand_view") }}</span>
                </div>
                <!--                <div class="item btn" v-if="!isSinglePrivateKey" @click="gotoImport">-->
                <!--                    <img src="../assets/icon-import.svg" alt="">-->
                <!--                    <span>{{ $t("setting.import_mnemonic") }}</span>-->
                <!--                </div>-->
                <div class="item btn warning" v-if="!isSinglePrivateKey" @click="gotoExport">
                    <img src="../assets/icon-export.svg" alt="">
                    <span>{{ $t("setting.export_mnemonic") }}</span>
                </div>
                <!--                <div class="item btn" @click="gotoImportPrivateKey">-->
                <!--                    <img src="../assets/icon-import.svg" alt="">-->
                <!--                    <span>{{ $t("setting.import_private_key") }}</span>-->
                <!--                </div>-->
                <div class="item btn warning" @click="gotoExportPrivateKey">
                    <img src="../assets/icon-export.svg" alt="">
                    <span>{{ $t("setting.export_private_key") }}</span>
                </div>
            </div>
        </div>
        <Footer></Footer>

    </div>

</template>

<script>
import httpUtils from '../utils/httpUtils';
import Footer     from "../components/Footer";

import {h} from 'vue'
import AccountChoose from "@/components/AccountChoose";

export default {
    name: "Setting",
    components: {
        Footer,
    },
    data() {
        return {
            registered: localManager.isAddressRegistered(walletManager.getMainAddress()),
            isSinglePrivateKey: walletManager.isSinglePrivateKey(),
        }
    },
    methods: {
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
        uploadAddressConfirm() {
            let _this = this;
            antModal.confirm({
                title: this.$t('setting.register_address'),
                content: h("div",{style: {display: "flex", "justify-content": "space-between"  },},
                    [
                        h('a', {href: "baidu.com"}, "Privacy"),
                        h('span', {style: {color: "#999"}}, this.$store.getters.addressShow)
                    ]
                ),
                onOk() {
                    httpUtils.post('https://sensilet.com/api/register_address',{
                    // httpUtils.post('http://127.0.0.1:30021/register_address', {
                        address: walletManager.getMainAddress()
                    }).then((data) => {
                        if (data.code === 200) {
                            localManager.setAddressRegistered(walletManager.getMainAddress())
                            _this.registered = true;
                            if (data.data)
                                antMessage.success(_this.$t("setting.address_exists"))
                            else
                                antMessage.success(_this.$t("setting.register_success"))
                        } else
                            antMessage.success('Fail:' + data.msg)
                    })
                }

            })
        }
    }
}
</script>

<style scoped lang="scss">
.setting-container {
    height: calc(100vh - 56px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;

}

.setting {
    flex: 1;
    width: 375px;
    margin: 16px auto 0;
    padding: 16px;
    background-color: #fafafa;
    border-radius: 5px;
    box-shadow: 0 1px 2px #ddd;

    .btn {
        position: relative;
        box-shadow: 0 1px 2px #ddd;

        &:hover {
            box-shadow: 0 2px 4px #ddd;
        }

        &:active {
            box-shadow: 0 1px 1px #ddd;
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
        .item {
            background-color: white;
            margin-top: 20px;
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
                //color: #ee0000;
            }

            .red-point {
                width: 10px;
                height: 10px;
                top: 0;
                right: 0;
            }
        }
    }
}

</style>
