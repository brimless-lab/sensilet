<template>
  <div class="setting">
    <div class="back btn" @click="goBack">
      <img class="icon" src="../assets/icon-arrow-left.svg" alt="">
    </div>
    <div class="action-list">
      <div class="item btn" @click="openWeb">
        <img src="../assets/icon-share.svg" alt="">
        <span>展开视图</span>
      </div>
      <div class="item btn" @click="gotoImport">
        <img src="../assets/icon-import.svg" alt="">
        <span>导入助记词</span>
      </div>
    </div>
  </div>

</template>

<script>
export default {
  name: "Setting",
  methods:{
    goBack(){
      routerManager.gotoHome();
    },
    gotoImport() {
      routerManager.goto('/import')
    },
    openWeb() {
      window.open("/popup.html")
    },
  }
}
</script>

<style scoped lang="scss">

.setting {
  height: calc(100vh - 88px);
  width: 375px;
  margin: 16px auto;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 5px;
  box-shadow: 0 1px 2px #ddd;

  .btn{
    position: relative;
    box-shadow: 0 1px 2px #ddd;

    &:hover{
      box-shadow: 0 2px 4px #ddd;
    }
    &:active{
      box-shadow: 0 1px 1px #ddd;
    }
  }

  .back{
    width: 42px;
    height: 42px;
    background-color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .action-list{
    .item{
      background-color: white;
      margin-top: 20px;
      padding: 8px 16px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      img{
        width: 28px;
        height: 28px;
      }

    }
  }
}

</style>
