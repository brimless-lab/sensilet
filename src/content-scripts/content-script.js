const container = document.head || document.documentElement;
const scriptTag = document.createElement('script');
scriptTag.setAttribute('async', 'false');
scriptTag.src = chrome.runtime.getURL('script.js');
container.insertBefore(scriptTag, container.children[0]);
container.removeChild(scriptTag);

window.addEventListener('sato_injected_script_message', (event) => {
        //console.log(event,'##content-script.js');

        let responseHandler = null

        if ( ["addEvent","removeEvent"].indexOf(event.detail.method) > -1) {
        //    无需response
        } else
            responseHandler = (response) => {
                // Can return null response if window is killed
                if (!response) {
                    return;
                }
                window.dispatchEvent(
                    new CustomEvent('sato_contentscript_message', {detail: response}),
                );
            }

        chrome.runtime.sendMessage(
            {
                channel: 'sato_contentscript_background_channel',
                data: event.detail,
            }, responseHandler
        );
    }
)
;


chrome.runtime.onMessage.addListener((message) => {
    if (message.channel === 'sato_background_event_channel') {
        window.dispatchEvent(
            new CustomEvent('sato_contentscript_event', {detail: {
                    id: message.id,
                    data: message.data,
                }}),
        );

    }
})


console.log('Sensilet loaded');
