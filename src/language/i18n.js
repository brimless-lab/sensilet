import { createI18n } from 'vue-i18n' //引入vue-i18n组件
import messages from './index'
const language = (
    (navigator.language ? navigator.language : navigator.userLanguage) || "en"
).toLowerCase();
let lang = language.split("-")[0] || "en";
console.log(lang)
if(['en','jp'].indexOf(lang)<0)
    lang = 'en';
console.log(lang)
const i18n = createI18n({
    fallbackLocale: 'en',
    globalInjection:true,
    legacy: false, // you must specify 'legacy: false' option
    locale: lang,
    // locale: "jp",
    messages,
});


export default i18n
