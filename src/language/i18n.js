import {createI18n} from 'vue-i18n' //引入vue-i18n组件
import messages from './index'

let lang = localStorage.getItem('lang');

if (!lang) {
    const language = (
        (navigator.language ? navigator.language : navigator.userLanguage) || "en"
    ).toLowerCase();
    lang = language.split("-")[0] || "en";
}
if (['en', 'ja'].indexOf(lang) < 0)
    lang = 'en';
console.log(lang)
const i18n = createI18n({
    fallbackLocale: 'en',
    globalInjection: true,
    legacy: false, // you must specify 'legacy: false' option
    locale: lang,
    // locale: "jp",
    messages,
});


export default i18n
