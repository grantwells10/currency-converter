chrome.runtime.onInstalled.addListener((()=>{chrome.contextMenus.create({id:"exampleContextMenu",title:"Context Menu",contexts:["selection"]})})),chrome.contextMenus.onClicked.addListener(((e,o)=>{if("exampleContextMenu"===e.menuItemId){const o=e.selectionText;console.log(Date.now(),"Selected text: ",o)}})),chrome.runtime.onMessage.addListener((function(e,o,n){return"getResponse"===e.type&&(console.log("[Background] Getting response"),chrome.storage.local.get(["key"]).then((o=>{const n=o.key.apiKey;console.log("[Background] API_KEY: "+n);const t=e.selection;console.log("[Background] selection: "+t)}))),!0})),console.log("[Background] Loaded script");