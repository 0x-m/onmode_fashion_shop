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

/*********** enrollment  ********* */

function show_filter(){
    const xhttp = new XMLHttpRequest()
    console.log("filter...")
    xhttp.onreadystatechange = () =>{
        if(xhttp.status == 200 ){
            document.getElementById("side-box-content").innerHTML = xhttp.responseText;
            showSidebox();
            console.log("success");
        }
    }

    xhttp.open("GET","/cart/");
    xhttp.send();
}

function sett(){
    document.getElementById("max_price").min = document.getElementById("min_price").value;
    document.getElementById("min_val").innerText = document.getElementById("min_price").value;
}


function show_enrollment_form(){
    console.log("show enroll")
    const xhttp = new XMLHttpRequest()
    xhttp.onload = () =>
    {
        if(this.status = 200){
            console.log("success");
            document.getElementById("side-box-content").innerHTML = xhttp.responseText;
            showSidebox();
        }
        
    }
    xhttp.open("GET", event.target.dataset['target']);
    xhttp.send();
}


function validate_phone_number() {
    console.log("validate..phone...")
    var phone_rx = new RegExp("^09[0-9]{9}$");
    var phone_no = document.getElementById('phone_no').value.toString();
    return phone_rx.test(phone_no);

}

function enroll(){
    if (!validate_phone_number()){
        document.getElementById("error").innerText = "شماره همراه وارد شده صحیح نمیباشد";
        return;
    }
    document.getElementById("error").innerText = "";

    const xhttp = new XMLHttpRequest()

    xhttp.onreadystatechange = () => {

        if(xhttp.status == 200){
            console.log("phone send");
            document.getElementById("side-box-content").innerHTML = xhttp.responseText;
            

        }
    }
    
    var phone_no = document.getElementById("phone_no").value;
    console.log(phone_no)
    xhttp.open("POST","users/enrollment/");
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhttp.setRequestHeader("X-CSRFToken",getCookie("csrftoken"));
    xhttp.send("phone_no="+phone_no);

}

function verify_code(){
    console.log("verifiying...")
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () =>{
        if(xhttp.status == 200){
            
            document.getElementById("side-box-content").innerHTML = xhttp.responseText;
        }
        
    }
    let code = document.getElementById("code").value;

    xhttp.open("POST","users/verification/");
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhttp.setRequestHeader("X-CSRFToken",getCookie("csrftoken"));
    xhttp.send("code="+code);
}

function validate_password(){
    let password = document.getElementById("password").value;
    let confirm = document.getElementById("confirm").value;
    if (password == confirm && password.length >= 8){
        return true;
    }
    return false;
}
function set_password(){

    console.log("setting password")
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {

        if(xhttp.status == 200){
            console.log("bingo...")
            document.getElementById("side-box-content").innerHTML = xhttp.responseText;
        }
    };

    let password = document.getElementById("password").value;
    let confirm = document.getElementById("confirm").value;
    if(validate_password()){
        console.log("password validated..")
        xhttp.open("POST","users/set_password/")
        xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xhttp.setRequestHeader("X-CSRFToken",getCookie("csrftoken"));
        xhttp.send("password="+password+"&confirm="+confirm);
    }


}

function login(){
    console.log("login issued...");
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = () => {

        if (xhttp.status == 200){
            document.getElementById("side-box-content").innerHTML = xhttp.responseText;
        }
    }
    const password = document.getElementById("password").value;
    xhttp.open("POST", "users/login/");
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhttp.setRequestHeader("X-CSRFToken",getCookie("csrftoken"));
    xhttp.send("password="+password);

}

function get_profile(){
    console.log("getting profile...")
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = () =>
    {
        if (xhttp.status == 200){
            document.getElementById("side-box-content").innerHTML = xhttp.responseText;
        }
    }

    const f = new FormData()
    

    xhttp.open("GET", "users/profile");
    xhttp.send();

}

function logout(){
    console.log("logout issued..")
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () =>{
        if (xhttp.status == 200){
            document.getElementById("side-box-content").innerHTML = xhttp.responseText;
        }
    }
    xhttp.open("GET","users/logout/")
    xhttp.send()
    

}

function getFavs(){
    var xhttp = new XMLHttpRequest();
    console.log("favs...")

    xhttp.onreadystatechange = () => {

        console.log("favs ready")
        console.log(xhttp.responseText);
        if(xhttp.status == 200){
            document.getElementById("side-box-content").innerHTML = xhttp.responseText;   
            showSidebox();
        }
    };

    xhttp.open("GET","{% url 'favourites:favs' %}")
    xhttp.send();
}
