<template>
    <div class="panel">
        <div class="title">您确定要创建一个NFT吗？</div>
        <div class="genesis-container">
            <div class="info">请选择 Genesis :</div>
            <a-select v-if="genesisList.length>0" v-model:value="genesisIndex" style="width: 280px" >
                <a-select-option  v-for="(item,index) in genesisList" :value="index" >
                        {{item.genesis}}
                </a-select-option>
            </a-select>
            <a-spin v-else/>
        </div>
        <div class="notice">这大概需要花费 {{fee}} Sat.</div>
        <div class="action-container" v-if="!isCreating">
            <a-button @click="cancel">取消</a-button>
            <a-button type="primary" @click="issue">创建</a-button>
        </div>
        <a-spin v-else/>
    </div>
</template>

<script>

    const urlParams = new URLSearchParams(window.location.hash.slice(1));
    const origin = urlParams.get('origin');
    const request = JSON.parse(urlParams.get('request'));

    export default {
        name: "Issue",
        data() {
            return {
                isCreating: false,
                genesisIndex: 0,
                genesisList: [],
                fee:0,
            }
        },
        async mounted() {
            //    对于 issue， 应该先genesis
            //    如果 请求中带了 genesis，则检查此genesis是否是自己拥有的
            //    如果 请求中不包含 genesis , 则判断用户是否已有默认genesis，没有则创建
            let genesisList = await nftManager.listGenesis();
            if (!genesisList || genesisList.length <= 0) {
                return routerManager.goto('/genesis')
            }
            this.genesisList = genesisList;


            let op = "";
            this.fee = await nftManager.sensibleNft.getIssueFee(genesisList[0].sensibleId,genesisList[0].pubKey,op);

        },
        methods: {
            cancel() {
                chrome.runtime.sendMessage({
                    channel: 'sato_extension_background_channel',
                    data: {
                        id: request.id,
                        result: "cancel"
                    },
                });
                window.close();
            },
            async issue() {
                this.isCreating = true;
                await new Promise(resolve => setTimeout(resolve,100));
                let data =await  nftManager.issue(this.genesisList[this.genesisIndex]);
                this.isCreating = false;
                if(data instanceof Error)
                    return;
                // await new Promise(resolve => {setTimeout(resolve,500)})

                chrome.runtime.sendMessage({
                    channel: 'sato_extension_background_channel',
                    data: {
                        id: request.id,
                        result: "success",
                        data
                    },
                });
                window.close();
            }
        }
    }
</script>

<style scoped lang="scss">
    .panel {
        text-align: center;

    }

    .title {
        font-size: 1.2em;
        font-weight: bold;
    }

    .genesis-container{
        margin-top: 10px;
    }

    .notice {
        margin: 10px;
    }

    .action-container {
        margin-top: 10px;

        display: flex;
        justify-content: space-between;
    }
</style>
