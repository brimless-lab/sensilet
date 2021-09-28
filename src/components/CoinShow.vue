<template>
    <div class="coin-type" style="display: inline-block">
        <span v-if="showValue && !isNaN(showValue)" :class="priceColorClass">
            {{showValue}}
        </span>
        <span v-if="!hideUnit"  class="bsv-color" :style="'margin-left:4px;'+'color:'+ color">
            {{unitWord}}
        </span>
    </div>
</template>

<script>
    export default {
        name: "CoinType",
        props: {
            color: String,
            unit:String,
            bigUnit:String ,
            showBigUnit: Boolean,
            hideUnit: Boolean,
            priceColorClass: String,
            value: [String , Number],
            decimal:Number,
            fixed:{type: Number,default:3},
        },

        computed: {
            showValue() {
                return this.bigUnit ? (this.value / Math.pow(10, this.decimal)).toFixed(this.fixed) : this.value;
            },
            unitWord(){
                return this.showBigUnit ? this.bigUnit : this.unit
            }
        },
    }
</script>

<style scoped lang="scss">

</style>
