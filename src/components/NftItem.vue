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
                <!--                <img class="pic" v-if="metaData" :src='metaData.image' alt="">-->
                <img class="pic" v-if="metaData && metaData.image" :src='metaData.image ' alt="">
                <QuestionCircleOutlined v-else :style="{fontSize: '24px'}"/>
            </div>
            <div class="desc" v-if="metaData">
                {{ metaData.description }}
            </div>
            <div class="info-list">
                <div class="info">
                    <span>Codehash:</span>
                    <span> {{ mNftInfo.codehashShow }}</span>
                </div>
                <div class="info">
                    <span>Genesis:</span>
                    <span> {{ mNftInfo.genesisShow }}</span>
                </div>
                <div class="info">
                    <span>TokenIndex:</span>
                    <span> {{ mNftInfo.tokenIndex }}</span>
                </div>
                <div class="info" v-if="metaData && metaData.officialSite">
                    <span>Website:</span>
                    <span v-if="metaData.officialSite">
                        <a :href="metaData.officialSite"> {{ metaData.officialSite }} </a>
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
            <AddressInput v-else @next="onTransNext" ref="addressInput" transType="NFT"></AddressInput>

            <div class="action-container">
                <a class="info" :href="`https://blockcheck.info/nft/${mNftInfo.codehash}/${mNftInfo.genesis}/${mNftInfo.tokenIndex}`" target="_blank" rel="noopener">
                    View On Chain</a>
                <a-button shape="round" @click="isTransMode = true" v-if="!isTransMode">
                    <template #icon>
                        <img src="../assets/icon-transfer.svg" alt="">
                    </template>
                    {{ $t('account.send') }}
                </a-button>
                <a-button shape="round" type="primary" @click="transNft" v-else :loading="isTransfering">
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
    emits:[
        'nftTransferred'
    ],
    props: {
        nftInfo: Object,
    },
    data() {
        return {
            mNftInfo: this.nftInfo,
            showDetail: false,
            metaData: null,
            isTransMode: false,
            isTransfering: false,
        }
    },
    watch: {
        nftInfo(newVal) {
            // console.log('#nftInfo change',newVal)
            this.metaData = null;
            if(newVal) {
                this.mNftInfo = newVal;

                this.refreshInfo();
            }else {
                this.mNftInfo = null;
            }
        },
    },
    mounted() {
        this.refreshInfo()
    },
    methods: {
        async refreshInfo() {

            if (this.mNftInfo) {
                this.metaData = await txUtils.getMetaData(this.mNftInfo.metaTxId, this.mNftInfo.metaOutputIndex);
                if(this.metaData){
                    this.metaData.genesisShow = showLongString(this.metaData.genesis)
                    this.metaData.codehashShow = showLongString(this.metaData.codehash)
                }
            }
        },
        detail() {
            this.showDetail = true;
        },
        closeDetail() {
            if (this.$refs && this.$refs.addressInput) {
                this.$refs.addressInput.reset();
            }
            this.isTransMode = false;
        },
        transNft() {
            this.$refs.addressInput.onOk();
        },
        //转移NFT
        async onTransNext(address) {
            if (!walletManager.checkBsvAddress(address)) {
                return antMessage.error(this.$t('account.address_error'))
            }
            if (this.isTransfering)
                return

            this.isTransfering = true;

            await sleep(100)

            // console.log(address)

            nftManager.transfer(address,
                this.mNftInfo.genesis,
                this.mNftInfo.codehash,
                this.mNftInfo.tokenIndex,
                this.metaData && this.metaData.type === 'metaid'
            ).then(async () => {
                await sleep(1000)
                antMessage.success('Success')
                await sleep(1000)
            //    通知转移完成
                this.$emit('nftTransferred')
            }).catch((e) => {

            }).finally(() => {
                this.isTransfering = false
            })
        },

    }
}
</script>

<style scoped lang="scss">
@import '../style/nftItem.scss';

</style>
