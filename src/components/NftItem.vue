<template>
    <div class="nft-item" v-if="info" @click="detail">
        <div class="top-info">
            <div class="info"></div>
            <div class="info">#{{ mTokenIndex }}</div>
        </div>
        <img class="pic" :src='info.metaData.image' alt="">
        <div class="bottom-info">
            <div class="info">{{ info.metaData.name }}</div>
            <a class="info" :href="'https://blockcheck.info/nft/22519e29424dc4b94b9273b6500ebadad7b9ad02/1a644549f97acc1a33f4e20bd1eff275df99a2bf/'+mTokenIndex" target="_blank">View
                On Chain</a>
        </div>
    </div>
    <div class="nft-item" v-else>
        <div class="bottom-info">
            <a-spin></a-spin>
        </div>
    </div>
    <div class="ant-modal-mask" v-if="showDetail">
        <div class="panel">
            <img class="pic" :src='info.metaData.image' alt="">

        </div>
    </div>
</template>

<script>
import apiUtils from '../utils/apiUtils'
import txUtils from '../utils/txUtils'

export default {
    name: "NftItem",
    props: {
        nftInfo: Object,
    },
    data() {
        return {
            mNftInfo: this.nftInfo,
            info: null,
            showDetail: false,
        }
    },
    watch: {
        nftInfo(newVal) {
            this.mNftInfo = newVal;
            this.refreshInfo();
        },
    },
    mounted() {
        this.refreshInfo()
    },
    methods: {
        async refreshInfo() {
            // console.log(this.mTokenIndex)
            if (this.mTokenIndex !== null) {
                let result = await apiUtils.getNftDetail("", "", this.mNftInfo.tokenIndex)
                if (result) {
                    this.info = result;
                }
            }
            let metaData = await txUtils.getMetaData(this.mNftInfo.metaTxId, this.mNftInfo.metaOutputIndex)
            if(metaData){

            }

        },
        detail() {
            this.showDetail = true;
        }
    }
}
</script>

<style scoped lang="scss">
.nft-item {

    background-color: white;
    border-radius: 16px;
    padding: 10px;
    position: relative;
    //overflow: hidden;
    border: 2px solid #ccc;
    text-align: center;


    .top-info {
        position: absolute;
        right: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .pic {
        height: 144px;
    }

    .bottom-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
}

</style>
