<template>
    <div class="nft-item" v-if="metaData" @click="detail">
        <div class="top-info">
            <div class="info"></div>
            <div class="info">#{{ mNftInfo.tokenIndex }}</div>
        </div>
        <img class="pic" v-if="metaData.image" :src='metaData.image ' alt="">
        <QuestionCircleOutlined v-else :style="{fontSize: '24px'}"/>
        <div class="bottom-info">
            <div class="info">{{ metaData.name || 'Unknown' }}</div>

        </div>
    </div>
    <div class="nft-item" v-else>
        <div class="bottom-info">
            <a-spin></a-spin>
        </div>
    </div>
    <a-modal v-model:visible="showDetail" :footer="null" :closable=false @cancel="closeDetail">
        <div class="nft-detail-panel" v-if="mNftInfo">
            <div class="top-info">
                <div class="name" v-if="metaData">{{ metaData.name }}</div>
                <div class="right">#{{ mNftInfo.tokenIndex }}</div>
            </div>
            <div class="img-container">
                <img class="pic" v-if="metaData" :src='metaData.image' alt="">
            </div>
            <div class="desc" v-if="metaData">
                {{ metaData.description }}
            </div>
            <div class="info-list">
                <div class="info">
                    <span>Codehash:</span>
                    <span> {{ mNftInfo.codehash }}</span>
                </div>
                <div class="info">
                    <span>Genesis:</span>
                    <span> {{ mNftInfo.genesis }}</span>
                </div>
                <div class="info">
                    <span>TokenIndex:</span>
                    <span> {{ mNftInfo.tokenIndex }}</span>
                </div>
                <div class="info" v-if="metaData">
                    <span>Website:</span>
                    <span v-if="metaData.officialSite">
                        <a :href="metaData.officialSite"> {{ metaData.officialSite }} </a>
                    </span>
                    <span v-else>
                        Unknown
                    </span>
                </div>
            </div>
            <div v-if="!isTransMode">
                <div class="info-list" v-if="metaData && metaData.attributes">
                    <div class="info" v-for="item in metaData.attributes">
                        <span>{{ item.trait_type }}</span>
                        <span> {{ item.value }}</span>
                    </div>
                </div>
            </div>
            <AddressInput v-else v-model:bindAddress="transAddress"></AddressInput>

            <div class="action-container">
                <a class="info" :href="`https://blockcheck.info/nft/${mNftInfo.codehash}/${mNftInfo.genesis}/${mNftInfo.tokenIndex}`" target="_blank">
                    View On Chain</a>
                <a-button shape="round" @click="isTransMode = true" v-if="!isTransMode">
                    <template #icon>
                        <img src="../assets/icon-transfer.svg" alt="">
                    </template>
                    {{ $t('account.send') }}
                </a-button>
                <a-button shape="round" type="primary" @click="transNft" v-else>
                    <template #icon>
                        <img src="../assets/icon-transfer_white.svg" alt="">
                    </template>
                    {{ $t('account.send') }}
                </a-button>
            </div>
        </div>

    </a-modal>
</template>

<script>
import txUtils from '../utils/txUtils'
import QuestionCircleOutlined from '@ant-design/icons-vue/lib/icons/QuestionCircleOutlined'
import AddressInput from "@/components/AddressInput";

export default {
    name: "NftItem",
    components: {
        AddressInput,
        QuestionCircleOutlined
    },
    props: {
        nftInfo: Object,
    },
    data() {
        return {
            mNftInfo: this.nftInfo,
            showDetail: false,
            metaData: null,
            isTransMode: false,
            transAddress: "",
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
            if (this.mNftInfo) {
                this.metaData = await txUtils.getMetaData(this.mNftInfo.metaTxId, this.mNftInfo.metaOutputIndex);
            }
        },
        detail() {
            this.showDetail = true;
        },
        closeDetail() {
            this.isTransMode = false;
            this.transAddress = "";
        },

        transNft() {
            console.log(this.transAddress)

            if (!walletManager.checkBsvAddress(this.transAddress)) {
                return antMessage.error(this.$t('account.address_error'))
            }

        },
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
        //position: absolute;
        //right: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .pic {
        max-height: 144px;
    }

    .bottom-info {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .panel {
        background-color: white;
    }
}

</style>
