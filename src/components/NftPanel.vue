<template>
    <div class="panel">
        <div class="panel-top">
            <div class="title"> {{ $t('account.nfts') }}</div>
        </div>
        <div class="list" v-if="nftGenesisList==null" style="text-align: center;padding: 8px">
            <a-spin v-if="true"/>
            <div v-else class="empty">
                {{ $t('account.coming_soon') }}
            </div>
        </div>
        <div class="nft-list" v-else-if="nftGenesisList.length>0">
            <div class="item" v-for="item in nftGenesisList" @click="gotoNftList(item)">
                <div class="left">
                    <img :src="item.logo" alt="">
                </div>
                <div class="mid">
                    <div class="nft-info">
                        <div class="name">{{ item.name }}</div>
                        <div class="genesis ellipsis">
                            {{ $t('account.genesis') }}:{{ item.genesisShow }}
                        </div>
                    </div>
                    <div class="count">{{ item.count + item.pendingCount }}</div>
                </div>
                <div class="right">
                    <RightOutlined></RightOutlined>
                </div>
            </div>
<!--            <div class="refresh-item">-->
<!--                <div class="refresh-icon" @click="refreshNft()">-->
<!--                    <img src="../assets/icon-refresh.svg" alt="">-->
<!--                </div>-->
<!--            </div>-->
        </div>
        <div class="list" v-else>
            <div class="empty">
                {{ $t('account.empty') }}
            </div>
        </div>
    </div>
</template>

<script>
import RightOutlined from '@ant-design/icons-vue/lib/icons/RightOutlined'

export default {
    name: "NftPanel",
    components: {
        RightOutlined
    },
    data() {
        return {
            nftGenesisList: null,

        }
    },
    mounted() {
        this.refreshNft();
    },
    methods: {
        async refreshNft() {
            this.nftGenesisList = null;
            let startTime = Date.now();
            let list = (await nftManager.listAllNft().catch(e => {
                console.error(e);
                return []
            })) || [];
            list = list.filter(item => {  //过滤掉总数为0的
                return (item.count + item.pendingCount) > 0
            })

            list.forEach(item => {  //添加默认信息
                item.genesisShow = showLongString(item.genesis, 16)
                item.logo = '/img/empty-token.png'
                item.name = "loading"
            })

            let during = Date.now() - startTime;
            if(during<500)
                await sleep(600 - during)

            this.nftGenesisList = list;

            //    补充nft信息
            const nftInfoTable = await nftManager.getNftInfoTable()



            for (let i = 0; i < this.nftGenesisList.length; i++) {
                let item = this.nftGenesisList[i]
                let info = nftInfoTable[item.genesis]
                if (!info)
                    info = await nftManager.getNftInfo(item.codehash,item.genesis,this.$store.getters.address).catch(e=>{
                        console.log(e);
                        return null;
                    });
                if (info) {
                    item.name = info.name
                    if (info.logo)
                        item.logo = info.logo
                }else
                    item.name = "unknown"

            }
        },
        gotoNftList(nftInfo) {
            routerManager.goto('/nftList', nftInfo)
        }
    }
}
</script>

<style scoped lang="scss">


.list {

    .empty {
        padding: 16px;
        text-align: center;
        color: #999;
        position: relative;

        .refresh-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            padding: 4px;
        }
    }

    .item {
        cursor: pointer;
        border-bottom: #eee 1px solid;
    }

}


.nft-list {
    .item {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #eee;

        justify-content: space-between;
        padding: 4px 10px;


        .left {
            //width: 56px;
            padding: 6px;
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                width: 28px;
                border-radius: 5px;
            }
        }

        .mid {
            flex-grow: 99;
            margin-right: 16px;
            margin-left: 10px;

            display: flex;
            align-items: center;
            justify-content: space-between;

            .nft-info {
                .name {
                    font-weight: bold;
                }

                .genesis {
                    color: #999;
                }
            }

            .count {
                font-weight: bold;

            }
        }

        .right {
            margin-right: 8px;
            transition: .25s ease-in-out;

            span {
                font-size: 12px;
                color: #999;
            }


        }
    }


    .refresh-item {
        padding: 8px 12px;
        display: flex;
        align-items: center;
        justify-content: end;

        span {
            font-weight: bold;
            margin-right: 12px;
            color: #999;
        }
    }

}


</style>
