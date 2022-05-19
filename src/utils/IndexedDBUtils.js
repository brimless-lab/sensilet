let indexedDBUtils = {};

const linkCache = {};
const hasCreated = {};
const databaseName = "sensilet";
const dataVersion = 1;
let db = null;

indexedDBUtils.link = function () {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(databaseName,dataVersion);

        request.onerror = function (event) {
            reject(event)
        };

        request.onsuccess =async function (event) {
            console.log('data opened');
            db = request.result;
            resolve()
        };
        request.onupgradeneeded =async function (event) {
            //在这里创建 新的表
            console.log('data upgradeneeded');
            await create(event.target.result,"metaData",'metaTxId')
        };
    })
};

async  function create(_db,tableName, key) {
    if (!_db.objectStoreNames.contains(tableName)) {
        _db.createObjectStore(tableName, {keyPath: key});
    }
}


indexedDBUtils.add = async function (tableName, data) {

    return new Promise((resolve, reject) => {

        if(data)   //记录一下创建时间，为之后的删除缓存做准备
            data.createTime = Date.now();
        const request = db.transaction([tableName], 'readwrite')
            .objectStore(tableName)
            .add(data);

        request.onsuccess = function (event) {
            console.log('### indexDB add ')

            resolve();
        };

        request.onerror = function (event) {
            reject(event);
        }
    })
}


indexedDBUtils.read = async function (tableName, key) {

    const transaction = db.transaction([tableName]);
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.get(key);

    return new Promise((resolve, reject) => {
        request.onerror = function (event) {
            reject(event);
        };
        request.onsuccess = function (event) {
            resolve(request.result)
        };
    })

}

module.exports = indexedDBUtils;
