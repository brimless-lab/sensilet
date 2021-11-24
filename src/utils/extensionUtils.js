let extensionUtils = {};


extensionUtils.queryCurrentActiveTab = async function () {
    return new Promise((resolve) => {

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if(!tabs)
                return resolve({});
            const [activeTab] = tabs;
            const { id, title, url } = activeTab;
            const { origin, protocol } = url ? new URL(url) : {};

            if (!origin || origin === 'null') {
                resolve({});
                return;
            }

            resolve({ id, title, origin, protocol, url });
        });
    });
}

module.exports = extensionUtils;
