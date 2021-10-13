

function get(url, callback= function(){}) {
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
                    d.hideLoader();
                    error();
                }
            };
        })(d));
    }
    else if (method === 'post'){
        post(url, payload, (function(obj) {
            return function(resp, status){
                if (status === 200){
                    obj.hideLoader();
                    obj.setContent(resp);
                    success();
                }
                else {
                   obj.hideLoader();
                   error();
                }
            };
        })(d));
    }
    else {
       
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

function checkout() {
 //
}

function get_add_product_view(product_id) {
    load_view('/product/add/');
}

function get_selecteds(name, single){
    console.log('aaaa');
    const items = document.getElementById(name).children;
    let selecteds = ""
    let all = ""
    for (let i=0; i < items.length; ++i){
        all += "," + items[i].dataset["id"];
        if (items[i].classList.contains("selected")){
            if (single){
                return items[i].dataset["id"]
            }
            selecteds += ',' + items[i].dataset["id"]
        }
    }
    if(single && selecteds == ""){
        return items[0].dataset["id"];
    }
    if (selecteds == ""){
        selecteds = all;
    }
    return selecteds.slice(1,selecteds.length) //eliminating first ,
}

function validate_field(rx){
    console.log("validate...")
    const  regx = new RegExp(rx)
    const  obj = event.target
    if (!regx.test(obj.value)){
        obj.classList.add("error");
    }
    else{
        obj.classList.remove("error");
    }
}


function get_attrs(){
    const _attrs = document.getElementById("attr-list").children;
    let attrs = new Map();
    
    for (let i=1; i < _attrs.length; ++i){
        key_value = _attrs[i].children[0].innerHTML.split(':');
        // attrs[key_value[0]] = key_value[1];
        attrs.set(key_value[0], key_value[1]);
    }

    console.log(attrs.keys.length)
    if(attrs.keys.length == 0){
        attrs["مخشصات"] = "ندارد"
    }
    console.log(attrs);
    return JSON.stringify(attrs);
}

function prepare_product_info(command){
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const quantity = document.getElementById("quantity").value;
    const keywords = document.getElementById("keywords").value;
    const price = document.getElementById("price").value;
    const brand = get_selecteds("brands", true);
    const type = get_selecteds("types", true);
    const categories = get_selecteds("categories",false);
    const subtype = get_selecteds("subtypes", true);
    const free_delivery = document.getElementById('free_delivery').checked;
    
    const attrs =  get_attrs();

    const  colors = document.getElementById("colors").children;
    let selected_colors = "";
    let all_colors = "";
    for (let i=0; i < colors.length; ++i){
        all_colors += "," + colors[i].dataset["id"];
        if (colors[i].classList.contains("select-color")){
            selected_colors += "," + colors[i].dataset["id"];
        }
    }
    // if (selected_colors == ""){
    //     selected_colors = all_colors;
    // }
    if(selected_colors != "")
          selected_colors = selected_colors.slice(1,selected_colors.length);

    const sizes = document.getElementById("sizes").children;
    let all_sizes = "";
    let selected_sizes = "";
    for (let i=0; i < sizes.length; ++i){
        all_sizes += "," + sizes[i].dataset["id"];
        if (sizes[i].classList.contains("select-size")){
            selected_sizes += "," + sizes[i].dataset["id"];
        }
    }
    // if (selected_sizes == ""){
    //     selected_sizes = all_sizes;
    // }
    if (selected_sizes != ""){
        selected_sizes = selected_sizes.slice(1, selected_sizes.length);
    }
    
    //-------------------------validations--------------------
    const errors = new Array()
    if (name == ""){
        errors.push("نام محصول را وارد کنید");

    }
    let rx = new RegExp('^[1-9][0-9]{3,6}$');
    if (!rx.test(price)){
        errors.push("قیمت باید بین 1000 تا 10 میلیون تومان باشد");
    }
    rx = new RegExp('^[1-9][0-9]{0,2}$')
    if(!rx.test(quantity)){
        errors.push("تعداد باید بین 1 تا 999 باشد");
    }

    if(type == ""){
        errors.push("نوع محصول را انتخاب کنید");
    }
    if(subtype == ""){
        errors.push("زیرنوع محصول را انخاب کنید");
    }
    if (brand == ""){
        errors.push("برند محصول را انتخاب کنید");
    }
    if(categories == ""){
        errors.push("دسته بندی محصول را مشخص کنید");
    }
    if(selected_colors == ""){
        errors.push("رنگ بندی محصول را انتخاب کنید")
    }
    if(selected_sizes == ""){
        errors.push("سایزبندی محصول را انتخاب کنید")
    }
    //------------------------------------------------------------

    //------------------- Error Dialog----------------------------
    if( errors.length !=0){

        //--------ul of errors-------------------------
        const frag = document.createDocumentFragment();
        for (let i=0; i < errors.length; ++i){
            // msg += errors[i] + "<br/>";
            let li = document.createElement('li');
            li.innerHTML = errors[i];
            frag.appendChild(li)
        }
        const err_list = document.createElement('ul');
        err_list.appendChild(frag);
        //----------------------------------------------

        //-------------------fetch drawer---------------
        const drawer = document.getElementById('drawer');
        const prevcontent = drawer.innerHTML;
        //-----------------------------------------------

        const err_container = document.createElement('div');
        err_container.className = 'container vertical position--center';
        err_container.style = 'color:red;font-size:0.9rem;line-height: 1.3rem;'
        err_container.appendChild(err_list); //append error list to err_container**

        const backbtn = document.createElement('button'); //back to add product button
        backbtn.className = 'btn cta mt-1 ';
        backbtn.style = "font-size:0.8rem";
        backbtn.textContent = "بازگشت"
        err_container.appendChild(backbtn); //append backbutton to err_container
        drawer.setcc(err_container); //replace drawer content with a given node (err_container)

        //handle go back to add product------------------------------
        backbtn.addEventListener('click', (function (drawer, val) {
            return function() {
                drawer.setContent(val);
                //ex: try to keeping text contents of add product view...
            }
        })(drawer,prevcontent)); 
        //-----------------------------------------------------------

        return null; //data were corrupted so, nothing will return (endpoint_1 of prepare_product_info)
    }

    //otherwise, in the case of clean data::

    //---------------- return sanitized data-------------------------
    const data = new FormData(); //use form initializer...
    data.append("name", name);
    data.append("price", price);
    data.append("description", description);
    data.append("quantity",quantity);
    data.append("keywords", keywords);
    data.append("colors", selected_colors);
    data.append("sizes", selected_sizes);
    data.append("type", type);
    data.append("subtype", subtype);
    data.append("attrs",attrs);
    data.append("is_available",'True')
    data.append("categories",categories);
    data.append("brand", brand);
    data.append('free_delivery', free_delivery);
    if (command == "add"){
        const images = document.getElementById("images").files;
        for (let i=0; i < images.length && i <= 5; i++){
            data.append("images",images[i]);
        }
    }
    return data;
    //----------------------------------------------------
}

function toggle_search_box(){
    var box = document.getElementById("search-box");
    box.classList.toggle("show-box");
 }

function add_product(command){
    const data = prepare_product_info("add");
    const xhttp = new XMLHttpRequest()
    xhttp.open("POST", "/product/add/");
    xhttp.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
    xhttp.onload = () =>{
        if(xhttp.status == 200){
            // const sucess = document.getElementById("sucessful-edit").innerHTML;
            const d = document.getElementById('drawer');
            d.hideLoader();
            d.setContent('success'); // ex:change with xhttp.responseText and, in the server side, make the addition is done successfully prompt...
            
        }
        // if(xhttp.status == 400){
        //     const msg = "لطفا اطلاعات خواسته شده را به درستی وارد کنید"
        //     set_error(msg,1000,()=>{end_waiting();})
        // }
    }
    if (data) {
        document.getElementById('drawer').showLoader();
        xhttp.send(data);
    }
  
}


function edit_product(){
    const data = prepare_product_info("edit");
    const product_id = document.getElementById("id").value;
    const xhttp = new XMLHttpRequest()
    xhttp.open("POST", "/product/edit/" + product_id + "/");
    xhttp.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
    xhttp.onload = () =>{
        if(xhttp.status == 200){
            const sucess = document.getElementById("sucessful-edit").innerHTML;
            set_view(sucess);
            end_waiting();
        }
        if(xhttp.status == 400){
            const msg = "لطفا اطلاعات خواسته شده را به درستی وارد کنید"
            set_error(msg,1000,()=>{end_waiting();})
        }
    }   
    
    xhttp.send(data);
}

function changeimg(){
    const num = event.target.dataset['num'];
    const id = event.target.dataset['img'];
    const img = document.getElementById(id);
    const prod_img_id = img.dataset['id'];


    //--------------check for size-------------------
    const t = event.target; 
    if (t.files.length == 0) //any image ???
        return;
    
    const file = t.files[0]; 
    if (Math.round(file.size / 1024) > 150){ //above 150kb
        alert('حجم فایل باید کمتر از 150 کیلوبایت باشد');
        return;
    }
    //------------------------------------------------
    
    const xhttp = new XMLHttpRequest();
    xhttp.onload = () =>{
        if (xhttp.status == 200){
            path = xhttp.responseText;
            img.src = path;
            // if(num == 1){
            //     console.log("ojk...")
            //     product.children[0].children[0].src = path;
            // }
        }
    }

    xhttp.open("POST", "/product/change_image/")
    const data = new FormData();
    data.append("image",file);
    data.append("id",prod_img_id);
   
    xhttp.setRequestHeader("X-CSRFToken",getCookie("csrftoken"));
    xhttp.send(data);
    
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
            cart_badge.innerText = (ress >= 0) ? ress : 0;
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

//in product detail page
function add_to_favourites() {
    const pid = document.getElementById('product_id').value;
    get('/favourites/add/' + pid + '/', function(resp, status) {
        if (status === 200) {
        }
    });
    console.log('addddd');
    event.target.style.color = 'red';

  
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

function testcc(){
    load_view('/test');
    console.log('ssaaa');
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
    const phone_no = document.getElementById('phone-no');
    const err = document.getElementById('phone-error');
    if (!validate_phone_number(phone_no.value)){
       err.innerText = "شماره همراه وارد شده صحیح نمیباشد";
       return;
    }
    console.log(phone_no.value);
    load_view('/users/enrollment/','post',"phone_no=" + phone_no.value.trim());
}

function show_search_page(){
    // console.log("fsdfdsf");
    event.stopPropagation()
    const se = document.getElementById("search-page").innerHTML;
    set_view(se);
    showSidebox();
    
}

function _toggle_nav_actions() {
    document.getElementById('cart-icon').classList.remove('hi');
    document.getElementById('user-icon').classList.remove('hi');
    document.getElementById('login-button').classList.add('hi');
}

function login(){
    const pass = document.getElementById('password');
    document.getElementById('drawer').showLoader();
    // post('/users/login/',"password=" + pass.text, function(resp, status) {
    //     if (status == 200) {
    //          //ex: change content with resp and make corresponding welcome message page...
    //         document.getElementById('drawer').setContent('در حال انتقال....');
    //         window.open('/', "_self");
    //     }
    //     if (status !== 200) {
    //         console.log('errr.....post');
    //         document.getElementById('drawer').hideLoader();
    //         pass.error('رمز عبور نادرست میباشد.');
    //         document.getElementById('drawer').hideLoader();
    //     }
    // });
    load_view('/users/login/', 'post', "password=" + pass.value, success = function() {
        _toggle_nav_actions();

    }, error=function() {
        document.getElementById('login-error').innerText = 'رمز عبور اشتباه است';
        document.getElementById('drawer').hideLoader();
    })
    
}


function verify_code(){
    const code = document.getElementById('verification-code');
    const err = document.getElementById('verification-error');
    load_view('/users/verification/', 'post', 'code=' + code.value.trim(), 
    function() {
        document.getElementById('drawer').hideLoader();
        err.innerText =  'کد اشتباه است. دوباره تلاش کنید';
    });
}

function validate_password(){
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;
    const password_error = document.getElementById("password-error");
    const confirm_err = document.getElementById('confirm-error');
    let rx = RegExp('(?=.*[0-9])(?=.*[!@#$%^&*.])(?=.{8,})');
    if (password != confirm ){
        confirm_err.innerText = "تکرار رمز عبور صحیح نمیباشد";
        return false;
    }
    else if(password.length < 8){
        password_error.innerText = "رمز عبور باید حداقل هشت حرفی باشد";
        return false
    }
    else if(! rx.test(password)){
        password_error.innerText = "رمز عبور باید شامل حروف اعداد و نمادها باشد";
        return false
    }
    return true;
}
function set_password(){
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;
    if (!validate_password()) {
        return;
    }
    document.getElementById('drawer').showLoader();
    load_view('/users/set_password/', 'post',
    "password=" + password.trim() + "&confirm=" + confirm.trim(), 
    success=function() {
        _toggle_nav_actions();
    });
}

function reset_password() {
    load_view('/users/reset_password/')
}

function get_profile(){
    load_view("/users/profile/","GET", null);
}

let num_of_comment_pages = 0;
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

    xr.open('get','/product/comments/' + pid + '/');
    xr.send();
}

function add_comment() {
    const comment_body = document.getElementById('comment-body');
    if (comment_body.value.trim() == ''){
        alert('نظر خود را بنویسید...')
        return;
    }
    const pid = document.getElementById('product_id').value;
    const author = document.getElementById('author').value;
    const btn = document.getElementById('comment-submit');
    btn.setAttribute('disabled', true);
    const lod = document.createElement('div');
    lod.className='loader';
    const btn_txt = btn.textContent;
    lod.style = 'width:16px;height:16px;margin:0 auto;'
    btn.replaceChildren(lod);

    const data = new FormData();
    data.append('comment_body', comment_body.value);
    data.append('comment_title', 'no');
    post('/comments/product/' + pid + '/leave/','comment_body=' + comment_body.value + '&comment_title='+ 'no', function(resp, status) {
        if (status != 200){
            const bb  = document.getElementById('comment-submit');
            alert('خطا در ارسال نظر...');
            bb.replaceChildren(btn_txt);
            bb.setAttribute('disabled', false);
            return;
        }
        const com = document.createElement('om-comment');
        com.setAttribute('author', author );
        com.setAttribute('body', comment_body.value);
        com.setAttribute('date', 'اکنون...');
        const cbox = document.getElementById('comment-box');
        const btn = document.getElementById('comment-submit');
        cbox.insertBefore(com, cbox.firstChild);
        comment_body.remove();
        btn.remove();

    });
}

function get_edit_shop_form(){
    load_view("/shop/edit/");
}

function edit_shop(){
    const shop_form = document.getElementById("shop_form");
    console.log(shop_form);
    let data = new FormData(shop_form);
    const states = document.querySelector("#states").children;
    let selected_states = "";
    for (let i=0; i < states.length; i++){
        if( states[i].classList.contains("selected")){
            let t = states[i].innerText;
            selected_states += "," + t.slice(0,t.length - 1).trim();
        }
    }

    data.append("post_destinations", selected_states.slice(1,selected_states.length));
    
    const xhttp = new XMLHttpRequest()
    xhttp.open("POST", "/shop/edit/");
    xhttp.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
    xhttp.onload = () =>{
        if(xhttp.status == 200){
            
            document.getElementById('drawer').setContent(xhttp.responseText);

        }
    }

    xhttp.send(data);
    //why below code does not work!!!!???? why???-----------------------------
    // load_view('/shop/edit/', 'post', data, function(resp, status) {
    //     if (states === 200) {
    //         document.getElementById('drawer').setContent('success');
    //     }
    // });
    //------------------------------------------------------------------------
}

//-----------appeal for new boutique------------------
function get_appeal_form(){
    load_view("/appeal/register/");
}
function validate_page_name(){
    const obj = event.target
    const rx = new RegExp("^[a-z0-9_]{4,}$");
    if (! (rx.test(page_name)) ){
        obj.classList.add("error")
    }
    else{
        obj.classList.remove("error")
    }
}
function make_appeal_for_boutique(){
    const rx = new RegExp("^[a-z0-9_]{4,}$")
    if (! (rx.test(page_name.text))){
        page_name.error('نام صفحه انتخابی نامعتبر است')
    }

    post('/appeal/register/', 'page_name=' + page_name.text + '&description=' + 'توضیحات', function(resp,status) {
        if (status == 200){
            const drawer = document.getElementById('drawer');
            drawer.setContent('درخواست شما ثبت شد...');

        }
        else {
            page_name.error('این نام صفحه قبلاانتخاب شده است');
        }
    });
   
}
//----------------------------------------------------

function show_order_detail(){
    console.log('dssdsd');
    const id = event.target.dataset['id'];
    fetch(`/user/order/${order_id}/detail/` ,{
        method: "GET"

    }).then((response) =>{
        
        response.text().then((txt) => {
            end_waiting();
            set_view(txt);
        })
    })
}

function show_shop_order_detail(){
    const id = event.target.dataset['id'];
    fetch(`/shop/order/<order_id>/detail/` + id + '/',{
        method: "GET"

    }).then((response) =>{
        
        response.text().then((txt) => {
            end_waiting();
            set_view(txt);
        })
    })
}

function is_valid_email(email){
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


function is_valid_card(card_num){

    card_num = String(card_num);
    const rx = new RegExp("^[0-9]{16}$");
    if (card_num != "" && rx.test(card_num)){
        let sum = 0;
        let pattern = "2121212121212121";
        for (let i=0;i < card_num.length; i++){
          let p = parseInt(card_num[i],10) * parseInt(pattern[i],10)
          if (p > 9){
              p -=9;
          }
          sum +=p;
        }
        
        return (sum % 10 == 0);
    }
    return false;
}


function cvt_fa_No_2_en(str){
    const cvt_map = {
        '۰': '0', 
        '۱': '1', 
        '۲': '2', 
        '۳': '3', 
        '۴': '4', 
        '۵': '5', 
        '۶': '6', 
        '۷': '7', 
        '۸': '8', 
        '۹': '9',
        '' : '0',
        '١' : '1',
        '٢' : '2',
        '٣' : '3',
        '٤' : '4',
        '٥' : '5',
        '٦' : '6',
        '٧' : '7',
        '٨' : '8',
        '٩' : '9',

    };
    let newstr = '';
    for (let i=0; i < str.length; ++i){
        newstr += cvt_map[str[i]];
    }
    
    return (newstr.length > 0 ? newstr: str);

}

function edit_profile(){
    form = document.getElementById("personal_info");
    const data = new FormData(form); //"?first_name=" + first_name + "&last_name=" + last_name;
    const email = document.getElementById("profile-email").value;
    const card = document.getElementById("profile-merchan_card").value;
    const errors = new Array()
    if(! is_valid_email(email)){
        errors.push('ایمیل نامعتبر است');
    }
    if(!is_valid_card(card)){
        errors.push('شماره کارت نامعتبر است');
    }
    if(!validate_province_and_city()){
        const msg  = "استان و شهرستان انتخابی مغایرت دارند";
        errors.push(msg);
    }

    if (data.get('first_name').trim() === '' || data.get('last_name').trim() === ''){
        errors.push('لطفا نام و نام خانوادگی خود را وارد کیند');
    }


    if( errors.length !=0){

        //--------ul of errors-------------------------
        const frag = document.createDocumentFragment();
        for (let i=0; i < errors.length; ++i){
            // msg += errors[i] + "<br/>";
            let li = document.createElement('li');
            li.innerHTML = errors[i];
            frag.appendChild(li)
        }
        const err_list = document.createElement('ul');
        err_list.appendChild(frag);
        //----------------------------------------------

        //-------------------fetch drawer---------------
        const drawer = document.getElementById('drawer');
        const prevcontent = drawer.content;
        //-----------------------------------------------

        const err_container = document.createElement('div');
        err_container.className = 'container vertical position--center';
        err_container.style = 'color:red;font-size:0.9rem;line-height: 1.3rem;'
        err_container.appendChild(err_list); //append error list to err_container**

        const backbtn = document.createElement('button'); //back to add product button
        backbtn.className = 'btn cta mt-1 ';
        backbtn.style = "font-size:0.8rem";
        backbtn.textContent = "بازگشت"
        err_container.appendChild(backbtn); //append backbutton to err_container
        drawer.setcc(err_container); //replace drawer content with a given node (err_container)

        //handle go back to add product------------------------------
        backbtn.addEventListener('click', (function (drawer, val) {
            return function() {
                drawer.setContent(val);
                //ex: try to keeping text contents of add product view...
            }
        })(drawer,prevcontent)); 
        //-----------------------------------------------------------

        return; //data were corrupted so, nothing will return (endpoint_1 of prepare_product_info)
    }

    const xhttp = new XMLHttpRequest()
    xhttp.open("POST", "/users/profile/");
    xhttp.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
    xhttp.onload = () =>{
        if(xhttp.status == 200){
            document.getElementById('drawer').setContent('successfully edited');
        }
    }
    xhttp.send(data);
}


function apply_coupon(){
    console.log('apply.....');
    const coupon_code = document.getElementById("coupon-code").value;
    if (coupon_code.toString().length != 6) {
        alert('wrong');
        return;
    }
    const xhttp = new XMLHttpRequest();
    xhttp.onload = () =>{
        if(xhttp.status == 200){
          
            alert('success')
            resp = JSON.parse(xhttp.responseText);
            document.getElementById("total-sum").innerHTML = 'مبلغ' + resp["total"] + 'تومان' ;
        }
        if(xhttp.status == 400){
           alert('کوپن نامعتبر')
        }
    }

    xhttp.open("GET","/cart/apply_coupon/" + coupon_code + "/");
    xhttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
    xhttp.send();
}

function show_order_detail(){
    const id = event.target.dataset['id'];

    fetch(`/user/order/${id}/detail/` ,{
        method: "GET"

    }).then((response) =>{
        response.text().then((txt) => {
            document.getElementById('drawer').setContent(txt);
            
        })
    })
    document.getElementById('drawer').open();
}

function show_shop_order_detail(){
    const id = event.target.dataset['id'];
    fetch(`/shop/order/<order_id>/detail/` + id + '/',{
        method: "GET"

    }).then((response) =>{
        
        response.text().then((txt) => {
            end_waiting();
            set_view(txt);
        })
    })
}


function get_cities(){
    const province_name = event.target.value;
    let province_id = null
    // const provinces = document.getElementById("provinces").getElementsByTagName("option");

    // for (let i=0; i < provinces.length; ++i){
    //     if(provinces[i].value.trim() == province_name.trim()){
    //         province_id = provinces[i].dataset["id"];
    //         break;
    //     }
    // }

    // selected_prov = document.getElementById('provinces').selectedOptions[0];
    selected_prov = event.target.value;
    if (selected_prov != -1){
        fetch("/cities/" + "?province_id=" + selected_prov ,{
            header:{
                "Content-type":"applicatin/json"
            }
        }).then((res) => {
            res.json().then((data)=> {
                console.log(data);
                const cities = document.getElementById("cities");
                const fragment = document.createDocumentFragment();
                cities.innerHTML = '';
                for(let i=0; i< data['cities'].length; ++i){
                    let option  = document.createElement("option");
                    option.innerText = data['cities'][i];
                    fragment.appendChild(option);
                }
                cities.appendChild(fragment);
            })
        })
    }

}

function validate_province_and_city(){
    const province = document.getElementById("profile-state");
    const city = document.getElementById("profile-city");
    const provinces = document.getElementById("provinces").getElementsByTagName("option");
    const cities = document.getElementById("cities").getElementsByTagName("option");
    let is_provinace = false , is_city = false;
    for (let i=0; i < provinces.length; ++i){
        if (provinces[i].value.trim() == province.value.trim()){
            is_provinace = true
            break;
        }
    }
    for (let j=0; j < cities.length; ++j){
        if(cities[j].value.trim() == city.value.trim()){
            is_city = true
            break;
        }
    }
    console.log(is_city);
    return is_city && is_provinace;
}

function send_issue(){
    const subject_id = document.getElementById('issue-subject').selectedItems;
    const btn = event.target;
    const description = document.getElementById('issue-description');
    if (subject_id.length != 1){
        alert('لطفا موضوع را انتخاب کنید')
    }
    if (description.value.trim() === ''){
        alert('توضیحات خالیست')
    }
    const prev_txt = btn.innerText;
    const lod = document.createElement('div');
    lod.className='loader';
    const btn_txt = btn.textContent;
    lod.style = 'width:16px;height:16px;margin:0 auto;'
    btn.replaceChildren(lod);
    

    post('/issue/register/', 'subject=' + subject_id + '&description=' + description.value, 
        function(resp, status) {
            console.log(status,'.....')
        if ( status === 200){
            btn.disabled = true;
            btn.replaceChildren('شکایت ثبت شد');
            btn.style.backgroundColor = '#efefef';
            btn.style.color = '#333';
        }
        else {
            btn.replaceChildren(prev_txt)
            alert('خطا');
        }
    });

}

function filter_orders(url, status) {
    if (status.length !== 1)
        return;
    window.open(url, '_self');
}
function fitler_user_orders() {
    const status = document.getElementById('order-status').selectedItems;
    if (status.length !== 1)
        return;
    window.open('/user/orders/' + status[0] + '/','_self');
}
function filter_shop_orders(){
    const status = document.getElementById('order-status').selectedItems;
    if (status.length !== 1)
        return;
    window.open('/shop/orders/' + status[0] + '/','_self');
}

function get_wallet() {
    load_view('/account/wallet', 'get',null)
}