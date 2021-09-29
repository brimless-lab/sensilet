const container = document.head || document.documentElement;
const scriptTag = document.createElement('script');
scriptTag.setAttribute('async', 'false');
scriptTag.src = chrome.runtime.getURL('script.js');
container.insertBefore(scriptTag, container.children[0]);
container.removeChild(scriptTag);

window.addEventListener('sato_injected_script_message', (event) => {
    // console.log(event,'##content-script.js');
    chrome.runtime.sendMessage(
        {
            channel: 'sato_contentscript_background_channel',
            data: event.detail,
        },
        (response) => {
            // Can return null response if window is killed
            if (!response) {
                return;
            }
            window.dispatchEvent(
                new CustomEvent('sato_contentscript_message', { detail: response }),
            );
        },
    );
});

console.log('Sensilet loaded');
