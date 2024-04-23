import{convertCurrency,extractCurrencyAndAmount}from"./chrome-extension-react-typescript-starter-main/public/convert.js";import createPopup from"./chrome-extension-react-typescript-starter-main/public/content.js";function getGPTResponse(e,t,n){let o={model:"gpt-3.5-turbo",messages:[{role:"user",content:t}]},c=JSON.stringify(o);fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:c}).then((e=>e.json())).then((e=>{var t="No response";e.choices&&(t=e.choices[0].message.content),console.log("[Background] sending response: "+t),n({result:t})})).catch((e=>{console.log("error: "+e)}))}chrome.runtime.onInstalled.addListener((()=>{chrome.contextMenus.create({id:"exampleContextMenu",title:"Context Menu",contexts:["selection"]})})),chrome.contextMenus.onClicked.addListener(((e,t)=>{if("exampleContextMenu"===e.menuItemId){const t=e.selectionText;console.log(Date.now(),"Selected text: ",t)}})),chrome.runtime.onMessage.addListener((function(e,t,n){return"getResponse"===e.type&&(console.log("[Background] Getting response"),chrome.storage.local.get(["key"]).then((t=>{const o=t.key.apiKey;console.log("[Background] API_KEY: "+o);const c=e.selection;console.log("[Background] selection: "+c),getGPTResponse(o,c,n)}))),!0})),console.log("[Background] Loaded script"),document.addEventListener("mouseup",(function(e){var t=window.getSelection(),n=t.toString().trim();if(console.log("[Content] selection: "+t),n&&""!==n){var o=t.getRangeAt(0).getBoundingClientRect();const e=extractCurrencyAndAmount(n),c=convertCurrency(e.number,e.currency,"USD"),r=createPopup(c,o);document.body.appendChild(r),document.addEventListener("mousedown",(function(e){r.contains(e.target)||(r.parentNode.removeChild(r),document.removeEventListener("mousedown",arguments.callee))}))}}));