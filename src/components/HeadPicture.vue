<template>
    <div class="head-pic-container" v-if="data">
        <div class="cube-line" v-for="item in data">
            <div class="cube" v-for="i in item" :style="{'background-color':i>0?color:'#f0f0f0'}"></div>
        </div>
    </div>
</template>

<script>
import Random from "@/utils/Random";

export default {
    name: "HeadPicture",
    beforeCreate() {
    },
    props: {
        address: String,
    },
    data() {
        let address = this.address;
        let seed = 0;
        for (let i = 0; address && i < address.length; i++) {
            seed += Math.pow(address.charCodeAt(i), 3) + 1;
        }
        let data = []
        let random = new Random(seed)
        for (let i = 0; i < 5; i++) {
            data.push([
                Math.floor(random.random() * 2),
                Math.floor(random.random() * 2),
                Math.floor(random.random() * 2)
            ])
        }
        let color = ['#8473C6', '#DBBB9A', '#84BED4', '#6F99D2', '#9EDB90'][Math.floor(random.randomInt(0, 5))]
        data = data.map(function (d) {
            d.push(d[1], d[0])
            return d
        })

        return {
            data, color
        }
    }
}
</script>

<style scoped lang="scss">
.head-pic-container {
    background-color: #f0f0f0;
    border-radius: 50%;
    overflow: hidden;

    .cube-line {
        width: 100%;
        display: flex;

        .cube {
            width: 20%;
            padding-top: 20%;
        }
    }

}
</style>
