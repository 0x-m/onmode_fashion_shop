

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





function load_view(url, method='get', payload={}) {
    console.log('load view...')
    const d = document.getElementById('drawer');
    d.showLoader();
    d.open();
    
    method = method.toLowerCase();
    if (method === 'get') {
        get(url, (function(obj) {
            return function (resp, status) {
                if (status === 200) {
                    d.hideLoader();
                    d.setContent(resp);
                }   
                else {
                    //handle error....
                    console.error('error occured during get...')
                }
            };
        })(d));
    }
    else if (method === 'post'){
        post(url, payload, (function(obj) {
            return function(resp, status){
                if (status === 200){
                    d.hideLoader();
                    d.setContent(resp);
                }
                else {
                    //handle error
                    console.error('error occured during post...')
                }
            };
        })(d));
    }
    else {
        console.log('unsupported method....');
    }
  
    // fetch(url,{
    //     header :{
    //         'content-type':'application/x-www-form-urlencoded'
    //     }
    // }).then((res) => {
    //     res.text().then((r)=>{
    //         d.hideLoader();
    //         d.setContent(r);
    //     })
    // });
}

function open_cart() {
    // const d = document.getElementById('drawer');
    // d.showLoader();
    // d.open();
    // fetch("/cart",{
    //     header :{
    //         'content-type':'application/x-www-form-urlencoded'
    //     }
    // }).then((res) => {
    //     res.text().then((r)=>{
    //         d.hideLoader();
    //         d.setContent(r);
    //     })
    // });
   load_view('/cart');
}

function checkout_cart() {
    const d = document.getElementById('drawer');
    d.showLoader();
    d.open();
    fetch("/cart/checkout",{
        header :{
            'content-type':'application/x-www-form-urlencoded'
        }
    }).then((res) => {
        res.text().then((r)=>{
            d.hideLoader();
            d.setContent(r);
        })
    });
   
}

function checkout() {

}

function increment_cart_badge() {
    console.log('increment...');
}

function decrement_cart_badge() {
    console.log('decrement....');
}

function open_search() {
    console.log('search...');
}

function open_dashboard() {
    const d = document.getElementById('drawer');
    // d.showLoader();
    // d.open();
    // fetch("users/dashboard",{
    //     header :{
    //         'content-type':'application/x-www-form-urlencoded'
    //     }
    // }).then((res) => {
    //     res.text().then((r)=>{
    //         d.hideLoader();
    //         d.setContent(r);
    //     })
    // });
    load_view('users/dashboard');
   
}

function open_favourites() {    
    load_view('favourites/');

}

function open_mobile_menu() {
    console.log('menu....')
}

function showMegaMenu() {
    event.stopPropagation();
    event.target.classList.add('cc');
    document.getElementById('megamenu').style.display = 'flex';

}

function closeMegaMenu() {
     const el = document.getElementById('prods');
     document.getElementById('megamenu').style.display = 'none';
     el.classList.remove('cc');
     console.log('move...')
 }


 function get_enrollment_form(){
    load_view("/users/enrollment/","GET");
}

function validate_phone_number(phone_no) {
    console.log("validate..phone...")
    var phone_rx = new RegExp("^09[0-9]{9}$");
    return phone_rx.test(phone_no);

}

function enroll(){
    const phone_no = document.getElementById('phone_no');
    if (!validate_phone_number(phone_no.value)){

       phone_no.error("شماره همراه وارد شده صحیح نمیباشد");
       return;
    }

    // const phone_no = document.getElementById("phone_no").value;
    // data = new FormData();
    // data.append("phone_no", phone_no);
    // const xhttp = new XMLHttpRequest()
    // xhttp.onload = () =>
    // {
    //     if (xhttp.status == 200){
    //         set_view(xhttp.responseText);
    //         end_waiting();
    //     }

     
    // }
    // xhttp.open("POST", "/users/enrollment/");
    // xhttp.setRequestHeader("X-CSRFTOKEN",getCookie("csrftoken"));
    // xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    // start_waiting();
    // xhttp.send("phone_no=" + phone_no.trim());

}

function show_search_page(){
    // console.log("fsdfdsf");
    event.stopPropagation()
    const se = document.getElementById("search-page").innerHTML;
    set_view(se);
    showSidebox();
    
}



function login(){
    var  d = new XMLHttpRequest()
    const password = document.getElementById("password").value;
    const data = new FormData()
    data.append("password", password);
    load_view("/users/login/","POST",data,(x)=>{
        if(x.status == 422 || x.status == 400){
            const msg = "رمز عبور اشتباه است"
            set_error(msg ,1500,()=>{});
            toggle_waiting();

        }
    });
}


function verify_code(){
    const xhttp = new XMLHttpRequest();
    // xhttp.onreadystatechange = () =>{
    //     if(xhttp.status == 200){
            
    //         set_view(xhttp.responseText);
    //     }
        
    // }
    const code = document.getElementById("code").value;
    const data = new FormData()
    data.set("code", code);
    xhttp.onload = () => {
        if(xhttp.status == 422 || xhttp.status == 400){
            const msg = "کد  اشتباه است"
            end_waiting();
            set_error(msg ,1500,()=>{});
            
        
        }

        if(xhttp.status == 200){
            end_waiting()
            set_view(xhttp.responseText);
        }
    }
    xhttp.open("POST","/users/verification/");
    xhttp.setRequestHeader("X-CSRFTOKEN",getCookie("csrftoken"));
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    start_waiting();
    xhttp.send("code=" + code.trim());
    
}

function validate_password(){
    let password = document.getElementById("password").value;
    let confirm = document.getElementById("confirm").value;
    const error = document.getElementById("error");
    let rx = RegExp('(?=.*[0-9])(?=.*[!@#$%^&*.])(?=.{8,})');
    if (password != confirm ){
        error.innerText = "تکرار رمز عبور صحیح نمیباشد"
        return false;
    }
    else if(password.length < 8){
        error.innerText = "رمز عبور باید حداقل هشت حرفی باشد"
        return false
    }
    else if(! rx.test(password)){
        error.innerText = "رمز عبور باید شامل حروف اعداد و نمادها باشد"
        return false
    }
    return true;
}
function set_password(){
    let password = document.getElementById("password").value;
    let confirm = document.getElementById("confirm").value;
    const data = new FormData();
    data.append("password", password);
    data.append("confirm", confirm);
    if(validate_password()){
    //    load_view("/users/set_password/", "POST", data, true);
        const xhttp = new XMLHttpRequest()
        xhttp.onload = () =>{

            if(xhttp.status == 200){
                get_profile();
            }
        }
        xhttp.open("POST","users/set_password/")
        xhttp.setRequestHeader("X-CSRFTOKEN",getCookie("csrftoken"));
        xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        start_waiting();
        xhttp.send("password=" + password.trim() + "&confirm=" + confirm.trim());
    
    }
}



function get_profile(){
    load_view("/users/profile/","GET", null,false);
}


