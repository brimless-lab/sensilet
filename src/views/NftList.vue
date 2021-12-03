<template>
    <div class="setting-container">
        <div class="setting">
            <div class="connect-top">
                <div class="back btn" @click="goBack">
                    <img class="icon" src="../assets/icon-arrow-left.svg" alt="">
                </div>
            </div>


            <div class="container">
                <div class="divider">
                    {{ nftInfo.name }}
                </div>
                <div v-if="list == null ">
                    <a-spin></a-spin>
                </div>
                <div v-else-if="Object.keys(list).length<=0" style="text-align: center">
                    {{ $t('setting.empty') }}
                </div>
                <div v-else class="list">
                    <div class="item" v-for="(item,index) in list">
                        <NftItem :nftInfo="item"></NftItem>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import apiUtils from '../utils/apiUtils'
import NftItem from "@/components/NftItem";

export default {
    name: "NftList",
    components: {
        NftItem
    },
    data() {
        // console.log(this.$store.state.account)
        return {
            list: null,
            nftInfo: routerManager.data
        }
    },
    async mounted() {
        await this.refreshNftList();
    },
    methods: {
        async refreshNftList() {
            let result = await apiUtils.listNftByGenesis(this.nftInfo.codehash, this.nftInfo.genesis, this.$store.getters.address)
            console.log(result)
            if (result.code === 0 && result.data) {
                this.list = result.data.utxo;
            }
        },
        goBack() {
            routerManager.gotoHome();
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

    .container {
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

        .list {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;

            .item {
                width: 48%;
                margin-bottom: 20px;
                //border-radius: 5px;
                //display: flex;
                //align-items: center;
                //justify-content: space-between;

                position: relative;

                &:nth-child(odd){
                    margin-right: 2%;
                }
                &:nth-child(even){
                    margin-left: 2%;
                }

            }
        }
    }
}

</style>
