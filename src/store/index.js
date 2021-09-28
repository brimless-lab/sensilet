import { createStore } from 'vuex'

export default createStore({
  state: {
    satoshis:0,
    accountList:[],
    account:null,
    tokenList:null,
  },
  getters:{
    address(state) {
      return state.account ? state.account.address : ""
    },
    addressShow(state) {
      return state.account ? showLongString(state.account.address) : ""
    },
    alias(state) {
      return state.account ? state.account.alias : ""
    },

  },
  mutations: {
    initAccount(state){
      state.accountList = walletManager.listAccount();
      state.account = walletManager.getCurrentAccount();
    },

  },
  actions: {
    async refreshAsset({commit,state}){

    },
    async refreshAllToken({commit,state}){
      state.tokenList = await tokenManager.listUserTokens().catch(e => [])
    }
  },
  modules: {

  }
})
