//content scripts are the one's that actually interacts with the webpage (essentially DOM elements
let count=0;
async function sendRequestToPython(url){
    let cleanText = await fetch(url,
        {
            method:'GET',
            mode:'cors'
        })
        .catch((error) => {
        console.log(error);
    });
    // console.log(clean.before,clean.after);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(cleanText.json());
        }, 100);
    });
}
function execute(){
    sendRequestToPython('http://localhost:5000/censor').then((data)=>{
        console.log(data.result.before,data.result.after);
        if (data.result.after.includes("**")){//real-time profanity detection
            document.activeElement.value=data.result.after;
            alert(`Your sentence contains banned word of ${data.result.before.toUpperCase()}. Please change it !`);
            // window.location.reload();
        }
    });
}
function handler2(event){
    //only send request to python if the first time the user type, and subsequent request will be made if the user finish the sentence to prevent hitting request continuously.
    count++;
    console.log(count);
    const regex=/[A-Za-z0-9]/
    if (count===1 && regex.test(event.key) && event.target.attributes.length>2){
        console.log(event.key);
        execute();
    }
    else if (event.key==="." && count>1){
        execute();
        fetch("http://localhost:5000/censor/delete", {
            method:'DELETE',
            mode:'cors'
        }).catch((error) => {
            console.log(error);
        });
    }
}
function handler1(event){
    const isExist = document.activeElement.outerHTML;
    //make sure that we listen on the text area, not outside of it, so that we won't fetch in unnecessary place in HTML
    if (event.target.attributes.length>2 && (isExist.toLowerCase().includes("text") || isExist.toLowerCase().includes("input")||isExist.toLowerCase().includes("comment"))){
        document.addEventListener('keydown', handler2);
    }
}
sendRequestToPython("http://localhost:5000/censor/check").then((data)=>{
    //this is because we want to persist the state of our configuration whenever the user navigate between page
    //however we ignore to check the status of false because false means that we don't listen to the dom click
    //this function will execute after the extension configuration (ON/OFF) has been configured before by the user.
    console.log(data.status)
    if (data.status.toogleOn==="true"){
        document.addEventListener('click', handler1);
    }
});
chrome.runtime.onConnect.addListener(function(port) {
    //this function will execute when the user open the extension, and click ON OFF button
    if(port.name === "run"){
        port.onMessage.addListener(function(response) {
            if(response.censor){//make sure the current tabs matched with background.js so to prevent the user changing the location of the tab
                document.addEventListener('click', handler1);
            }
            else{
                document.removeEventListener('click', handler1);
                window.location.reload();
            }
        });
    }
});