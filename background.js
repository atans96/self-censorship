//background scripts are something that run in background and listen for triggers while
// the user interacts with the chrome browser (such as listening for a click event on a tab)
//Background script can't access the DOM of the page, but gives you full access to the api of the extension.
//full API: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs
//In the background script you store the state of your extension, because it lives until the browser is closed.
// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
//     //before execute content.js, we wait until the tabs page fully loaded to handle the case of website slow
//     //https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated
//     if (changeInfo.status === 'complete') {
//         chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
//             let url = tabs[0].url;
//             if (url.includes("https") || url.includes("http")) {
//                 //https://developer.chrome.com/extensions/messaging#simple
//                 port = chrome.tabs.connect(tabs[0].id, {name: "active"});
//                 port.postMessage({url: url});//send message to content.js
//             }
//         });
//     }
// });
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
   if (request.Censorship){
       chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
           let url = tabs[0].url;
           if (url.includes("https") || url.includes("http")) {
               port = chrome.tabs.connect(tabs[0].id, {name: "run"});
               port.postMessage({censor: true});//send message to content.js
           }
       });
       // sendResponse(config);//because we receive request from popup.js, we send response back to content.js
   }
   else{
       chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
           let url = tabs[0].url;
           if (url.includes("https") || url.includes("http")) {
               port = chrome.tabs.connect(tabs[0].id, {name: "run"});
               port.postMessage({censor: false});//send message to content.js
           }
       });
   }
});