let toogleOn= document.getElementById("on");
let toogleOff= document.getElementById("off");
function loadConfig(){
    //load config file (json file) in client-side, instead of server-side
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange=function () {
            var status = xhr.status;
            if (status === 200) {
                resolve(JSON.parse(xhr.response))
            }
        }
        xhr.open("GET",chrome.runtime.getURL("config.json"),true);
        xhr.send();
    });
}
temp=loadConfig();
temp.then((data)=>{
    console.log(data.toogleOn,data.toogleOff);
    if (data.toogleOn==="true"){
        toogleOn.setAttribute("checked","")
    }
    if (data.toogleOff==="true"){
        toogleOff.setAttribute("checked","")
    }
    if (data.toogleOn==="false"){
        toogleOn.removeAttribute("checked")
    }
    if (data.toogleOff==="false"){
        toogleOff.removeAttribute("checked")
    }
})
function setter(ToogleOn,ToogleOff){
    if (ToogleOn){
        toogleOn.setAttribute("checked","");
    }
    if (!ToogleOn){
        toogleOn.removeAttribute("checked");
    }
    if (ToogleOff){
        toogleOff.setAttribute("checked","");
    }
    if (!ToogleOff){
        toogleOff.removeAttribute("checked");
    }
}
toogleOn.onclick=function(element){
    chrome.runtime.sendMessage({Censorship:true});
    fetch("http://localhost:5000/?toogleOn=true&toogleOff=false", {
        method:'GET',
        mode:'cors'
    }).then((response)=>{
            if (response.status===200){
                setter(true,false);
            }
        })
        .catch((error) => {
        console.log(error);
    });
}
toogleOff.onclick=function (element) {
    chrome.runtime.sendMessage({Censorship:false});
    fetch("http://localhost:5000/?toogleOn=false&toogleOff=true", {
        method:'GET',
        mode:'cors'
    }).then((response)=>{
        if (response.status===200){
            setter(false,true);
        }
    })
        .catch((error) => {
            console.log(error);
        });
}