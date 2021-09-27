

function get(url, callback= function(a, b){}) {
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


function load_view(url, method='get', payload={},success=function(){}, error=function(){}) {
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
                    success();
                }   
                else {
                    //handle error....
                    console.error('error occured during get...')
                    error();
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
                    success();
                }
                else {
                    //handle error
                    console.error('error occured during post...');
                    error();
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
   load_view('/cart/');
}

function checkout_cart() {

}

function checkout() {

}

function add_product(product_id) {
    load_view('/product/add/');
}

function update_cart_badge(cmd, val=0) {
    const cart_badge = document.getElementById('cart-num-badge');
    let count_string = cart_badge.innerText;
    if (count_string === '99+') {
        return;
    }

    let count = parseInt(count_string);
    switch(cmd) {
        case 'increment':
            cart_badge.innerText = (count + 1 > 99) ? "99+" : count + 1;
            break;
        case 'decrement':
            cart_badge.innerText = (count - 1 >= 0) ? count - 1 : 0;
            break;
        case 'add':
            const res = count + parseInt(val);
            cart_badge.innerText = (res  > 99) ? "99+" : res;
            break;
        case 'subtract':
            const ress = count - parseInt(val);
            cart_badge.innerText = (ress >= 0) ? res : 0;
            break;
    }
}



function open_search() {
    console.log('search...');
}

function open_dashboard() {
    load_view('/users/dashboard');
}

function open_favourites() {    
    load_view('/favourites/');
}


function open_mobile_menu() {
    const d = document.getElementById('drawer');
    const s = document.getElementById('mobile_menu');
    d.setcc(s.content.cloneNode(true));
    d.open();
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
    load_view("/users/enrollment/");
}

function validate_phone_number(phone_no) {
    console.log("validate..phone...")
    var phone_rx = new RegExp("^09[0-9]{9}$");
    return phone_rx.test(phone_no);

}

function enroll(){
    const phone_no = document.getElementById('phone_no');
    if (!validate_phone_number(phone_no.text)){
       phone_no.error("شماره همراه وارد شده صحیح نمیباشد");
       console.log('invalid', phone_no.text);
       return;
    }
    console.log(phone_no.text);
    load_view('/users/enrollment/','post',"phone_no=" + phone_no.text.trim());
}

function show_search_page(){
    // console.log("fsdfdsf");
    event.stopPropagation()
    const se = document.getElementById("search-page").innerHTML;
    set_view(se);
    showSidebox();
    
}



function login(){
    const pass = document.getElementById('password');
    load_view('/users/login/', 'post',"password=" + pass.text,success= function() {
        location.reload();
    } ,error=function() {
        document.getElementById('drawer').hideLoader();
        pass.error('رمز عبور نادرست میباشد.');
    });
    
}


function verify_code(){
    const code = document.getElementById('verification_code');
    load_view('/users/verification/', 'post', 'code=' + code.text.trim(), 
    function() {
        document.getElementById('drawer').hideLoader();
        code.error('کد اشتباه است. دوباره تلاش کنید');
    });
}

function validate_password(){
    let password = document.getElementById("password");
    let confirm = document.getElementById("confirm");
    const error = document.getElementById("error");
    let rx = RegExp('(?=.*[0-9])(?=.*[!@#$%^&*.])(?=.{8,})');
    if (password.text != confirm.text ){
       confirm.error("تکرار رمز عبور صحیح نمیباشد");
        return false;
    }
    else if(password.text.length < 8){
        password.error("رمز عبور باید حداقل هشت حرفی باشد");
        return false
    }
    else if(! rx.test(password.text)){
        password.error("رمز عبور باید شامل حروف اعداد و نمادها باشد");
        return false
    }
    return true;
}
function set_password(){
    let password = document.getElementById("password").text;
    let confirm = document.getElementById("confirm").text;
    console.log(password, confirm);
    if (!validate_password()) {
        return;
    }
    load_view('/users/set_password/', 'post', "password=" + password.trim() + "&confirm=" + confirm.trim());
}

function reset_password() {
    load_view('/users/reset_password/')
}



function get_profile(){
    load_view("/users/profile/","GET", null,false);
}

function fetchComment() {
    const pid = 1;
    const xr = new XMLHttpRequest();
    const cbox = document.getElementById('comment-box');

    xr.onload = function() {
        if (xr.status == 200) {
            cbox.appendChild(xr.responseText);
            //remove comment-button
        }
    };

    xr.open('get','');
    xr.send();
}

function add_comment() {
    //comment
}



