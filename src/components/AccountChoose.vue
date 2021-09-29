<template>
  <a-dropdown placement="bottomCenter" :trigger="['click']">
    <div class="current-account" @click.prevent>

      <div class="word ellipsis account-word" v-if="$store.state.account!=null">
        <div class="account"> {{ $store.getters.alias }}</div>
        <div class="address">
          {{ $store.getters.addressShow }}
        </div>
      </div>

      <div class="word ellipsis" v-else-if="$store.state.accountList && $store.state.accountList.length>0">请选择</div>

      <DownOutlined style="color:#E0534F;"/>
    </div>
    <template #overlay>
      <a-menu v-if="$store.state.accountList  && $store.state.accountList .length>0">
        <a-menu-item v-for="item in $store.state.accountList" @click="choose(item)" class="account-item">
          <div class="info" :class="{'has-alias':item.alias}">
            <div class="alias ">{{ item.alias }}</div>
            <div class="address ellipsis">{{ item.address }}</div>
          </div>
          <EditOutlined style="padding: 8px" @click.stop="openEdit(item)"/>
        </a-menu-item>
        <a-menu-divider/>
        <a-menu-item @click="add">
          新增
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <a-modal v-model:visible="isShowEdit" @ok="handleOk">
    <p>请输入一个方便识别的别名</p>
    <a-input v-model:value="editAlias" placeholder="请输入别名..."/>
  </a-modal>
</template>

<script>
import DownOutlined from '@ant-design/icons-vue/lib/icons/DownOutlined'
import EditOutlined from '@ant-design/icons-vue/lib/icons/EditOutlined'

export default {
  name: "AccountChoose",
  components: {
    DownOutlined, EditOutlined
  },
  data() {

    this.$store.commit('initAccount')
    return {
      showEditItem: null,
      isShowEdit: false,
      editAlias: "",
    }
  },
  methods: {
    add() {
      walletManager.addAccount();
      walletManager.reload();
      window.location.reload();
    },
    openEdit(item) {
      this.showEditItem = item;
      this.isShowEdit = true;
    },
    handleOk() {
      this.showEditItem.alias = this.editAlias;
      walletManager.saveAlias(this.showEditItem);

      this.isShowEdit = false;
      this.showEditItem = null;
      this.editAlias = "";
    },
    choose(item) {
      walletManager.chooseAccount(item);
      walletManager.reload();
      window.location.reload();
    }
  }

}


</script>

<style lang="scss" scoped>
.current-account {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 2em;
  padding: 4px 8px;

  .word {
    width: 120px;
    color: #333;
  }

  .account-word{
    display: flex;
    flex-direction: column;
    align-items: center;
     .address{
       font-size: 12px;
       color: #999;
     }
  }
}

.account-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  .info {
    display: flex;
    align-items: center;
    max-width: 300px;


    .alias {
      max-width: 100px;
      overflow: scroll;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .address {
      padding-left: 8px;
      color: #666;
    }

  }
}

.ant-modal-mask {
  z-index: 1000;
}

.ant-modal-wrap {
  z-index: 1001;
}
</style>
