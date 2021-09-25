
function get(url, callback) {
    const xr = new XMLHttpRequest();
    xr.onload = function() {
        callback(xr.responseText, xr.status);
    };
    
    xr.open('get', url);
    xr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xr.send();
    
}

function post(url, payload, callback) {
    const xr = new XMLHttpRequest();
    xr.onload = function() {
        callback(xr.responseText, xr.status);
    };
    xr.open('post', url);
    xr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xr.setRequestHeader("X-CSRFTOKEN",getCookie("csrftoken"));
    xr.send(payload);
}

function getCookie(name){
    let cookieValue = null;
    if(document.cookie && document.cookie != ''){
        const cookies = document.cookie.split(';');
        for(let i = 0; i < cookies.length; ++i){
            const cookie = cookies[i].trim();
            if(cookie.substring(0, name.length + 1) === (name + '=')){
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
        return cookieValue;
    }
}


