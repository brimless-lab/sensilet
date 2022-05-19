// 使用浏览器 IndexedDB缓存metaData 信息
let bg = chrome.extension && chrome.extension.getBackgroundPage();

const indexedDBUtils = bg.indexedDBUtils;

const metaDataDao = {};

const tableName = "metaData";
const metaDataCache = {};

metaDataDao.find = async function (metaTxId) {
    if (metaDataCache[metaTxId])
        return metaDataCache[metaTxId]
    try {
        return await indexedDBUtils.read(tableName, metaTxId)
    } catch (err) {
        return null;
    }

}

metaDataDao.add = async function (metaTxId, data) {
    try {
        if(data)
            data.metaTxId = metaTxId;
        let result = await indexedDBUtils.add(tableName, data, 'metaTxId')
        //缓存下来
        metaDataCache[metaTxId] = result;

        return result;
    } catch (err) {
        console.error(err)
        return null;
    }

}

module.exports = metaDataDao;
