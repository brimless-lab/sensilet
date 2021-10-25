<template>
    <div class="setting-container">
        <div class="setting">
            <div class="back btn" @click="goBack">
                <img class="icon" src="../assets/icon-arrow-left.svg" alt="">
            </div>
            <div class="action-list">
                <div class="item btn" @click="openWeb">
                    <img src="../assets/icon-share.svg" alt="">
                    <span>{{ $t("setting.expand_view") }}</span>
                </div>
<!--                <div class="item btn" v-if="!isSinglePrivateKey" @click="gotoImport">-->
<!--                    <img src="../assets/icon-import.svg" alt="">-->
<!--                    <span>{{ $t("setting.import_mnemonic") }}</span>-->
<!--                </div>-->
                <div class="item btn warning"  v-if="!isSinglePrivateKey"  @click="gotoExport">
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
                <svg height="18" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true" class="octicon octicon-mark-github v-align-middle">
                    <path fill-rule="evenodd"
                          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                GitHub
            </a>
        </div>
    </div>

</template>

<script>

export default {
    name: "Setting",
    data() {
        return {
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

            img {
                width: 28px;
                height: 28px;
            }

            &.warning {
                color: #ee0000;
            }

        }
    }
}

</style>
