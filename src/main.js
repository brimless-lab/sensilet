let bg = chrome.extension.getBackgroundPage();
if (bg) {
    global.bg = bg;
    console.log(bg);

    //从background中获取bsv对象
    global.bsv = bg.bsv;
    global.sensibleSdk = bg.sensibleSdk;
    global.walletManager = bg.walletManager.init();
    global.tokenManager = bg.tokenManager;
    console.log(bg.sensibleSdk,"#####")

} else
    window.location.reload();

import {} from './utils/golbalUtils'

console.log('######## config');
import config from './config/base'
global.config = config;


import {createApp} from 'vue'

// import router from './router'
import store from './store'

//antd 样式相关导入
import Spin from 'ant-design-vue/lib/spin';
import Tooltip from 'ant-design-vue/lib/tooltip';
import Collapse from 'ant-design-vue/lib/collapse';
import Card from 'ant-design-vue/lib/card';
import CheckBox from 'ant-design-vue/lib/checkbox';
import Button from 'ant-design-vue/lib/button';
import Select from 'ant-design-vue/lib/select';
import Input from 'ant-design-vue/lib/input';
import Dropdown from 'ant-design-vue/lib/dropdown';
import Menu from 'ant-design-vue/lib/menu';
import antMessage from 'ant-design-vue/lib/message';
import antModal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/dist/antd.css';



import {} from './config/errorCode'

import App from './App.vue'
console.log('### init app');

//引入bsv库
// const  bsv = require( 'bsv');
// global.bsv = bsv;
import localManager from './manager/LocalManager'
global.localManager = localManager;

import nftManager from './manager/NftManager'
global.nftManager = nftManager;
import bsvUtils from './utils/bsvUtils'
global.bsvUtils = bsvUtils;
import routerManager from './manager/RouterManager'
global.routerManager = routerManager;


global.antMessage = antMessage;
global.antModal = antModal;

import i18n from './language/i18n'

console.log('init i18n')

// global.antMessage = {};
// global.antModal = {};
createApp(App).use(i18n).use(store)
    .use(Spin).use(Collapse).use(Card).use(CheckBox).use(Button).use(Input).use(Select).use(antModal).use(Dropdown).use(Menu).use(Tooltip)
    .mount('#app');

// console.log('###123');
// console.log( walletManager.signMessage("testaaaaa"));

