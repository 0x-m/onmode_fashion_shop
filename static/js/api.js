

function get(url, callback= function(){}) {
    const xr = new XMLHttpRequest();

    xr.onload = function() {
        callback(xr.responseText, xr.status);

    };
    
    xr.open('get', url);
    xr.setRequestHeader("X-CSRFTOKEN",getCookie("csrftoken"));
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

}

function open_cart() {
   const p = document.createElement('p')
   p.style = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);";
   p.innerText = "سبد خرید";
   document.getElementById('drawer').addHeader(p);
   load_view('/cart/');
}

function checkout() {
 load_view('/cart/checkout/');
}

function get_add_product_view(product_id) {
    load_view('/product/add/');
}

function get_selecteds(name, single, allow_empty=false){
    const items = document.getElementById(name).children;
    let selecteds = "";
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

    if (selecteds != "")
        selecteds = selecteds.slice(1,selecteds.length);
    return selecteds;
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


function change_preview() {
    const preview = document.getElementById('gallery-preview')
    target = event.target
    if (target.classList.contains('thumb')) {
        preview.src = event.target.src
        const thumbs = target.parentNode.children;
        for (let i=0; i < thumbs.length; ++i) {
            thumbs.classList.remove('thumb-active')
        }
        target.classList.add('thumb-active')
    }
    
}

function get_attrs(){
    const _attrs = document.getElementById("attr-list").children;
    let attrs = new Map();
    
    for (let i=1; i < _attrs.length; ++i){
        key_value = _attrs[i].children[0].innerHTML.split(':');
        // attrs[key_value[0]] = key_value[1];
        attrs[key_value[0]] =  key_value[1];
    }

    console.log(attrs);

    return JSON.stringify(attrs);
}

function prepare_product_info(command){
    let keyword = '';
    const kk = document.getElementById('keywords');
    if (kk) {
        for (let i of kk.tags){
            keyword += ',' + i;
        }
        keyword = keyword.slice(1, keyword.length);

    }
    let has_error = false;    
    const attrs =  get_attrs();
    console.log(attrs)
    const name = document.getElementById("name").value;
    if (!name){
        document.getElementById('product-name-error-box').innerText = 'نام محصول را وارد کنید';
        has_error = true;
    }
    else {
        document.getElementById('product-name-error-box').innerText = '';
        has_error = false;
    }
    const description = document.getElementById("description").value;
    const quantity = document.getElementById("quantity").value;
    if (!quantity){
        document.getElementById('product-quantity-error-box').innerText = 'تعداد بین 1 تا 100';
        has_error = true;
    }
    else {
        document.getElementById('product-quantity-error-box').innerText = '';
        has_error = false;
    }
    const price = document.getElementById("price").value;
    if (!price){
        document.getElementById('product-price-error-box').innerText = 'قیمت را وارد کنید';
        has_error = true;
    }
    else {
        document.getElementById('product-price-error-box').innerText = '';
        has_error = false;
    }

    if (has_error) {
        return false
    }

    const brand = get_selecteds("brands", true,true);
    const type = get_selecteds("types", true, true);
    const categories = get_selecteds("categories",false, true);
    const subtype = get_selecteds("subtypes", true, true);
    const free_delivery = document.getElementById('free_delivery').checked == 'true' ? 'true': ' ';
    console.log(free_delivery,'ffff')
    const  colors = document.getElementById("colors").children;
    let selected_colors = "";
    for (let i=0; i < colors.length; ++i){
        if (colors[i].classList.contains("inline-item--selected")){
            selected_colors += "," + colors[i].dataset["id"];
        }
    }

    if(selected_colors != "")
          selected_colors = selected_colors.slice(1,selected_colors.length);

    const sizes = document.getElementById("sizes").children;
    let selected_sizes = "";
    for (let i=0; i < sizes.length; ++i){
        if (sizes[i].classList.contains("inline-item--selected")){
            selected_sizes += "," + sizes[i].dataset["id"];
        }
    }
 
    if (selected_sizes != ""){
        selected_sizes = selected_sizes.slice(1, selected_sizes.length);
    }
    
    //-------------------------validations--------------------
    // const errors = new Array()
    // if (name == ""){
    //     errors.push("نام محصول را وارد کنید");

    // }
    // let rx = new RegExp('^[1-9][0-9]{3,6}$');
    // if (!rx.test(price)){
    //     errors.push("قیمت باید بین 1000 تا 10 میلیون تومان باشد");
    // }
    // rx = new RegExp('^[1-9][0-9]{0,2}$')
    // if(!rx.test(quantity)){
    //     errors.push("تعداد باید بین 1 تا 999 باشد");
    // }

    // if(type == ""){
    //     errors.push("نوع محصول را انتخاب کنید");
    // }
    // if(subtype == ""){
    //     errors.push("زیرنوع محصول را انخاب کنید");
    // }
    // if (brand == ""){
    //     errors.push("برند محصول را انتخاب کنید");
    // }
    // if(categories == ""){
    //     errors.push("دسته بندی محصول را مشخص کنید");
    // }
    // if(selected_colors == ""){
    //     errors.push("رنگ بندی محصول را انتخاب کنید")
    // }
    // if(selected_sizes == ""){
    //     errors.push("سایزبندی محصول را انتخاب کنید")
    // }
    // //------------------------------------------------------------

    //------------------- Error Dialog----------------------------
    // if( errors.length !=0){

    //     //--------ul of errors-------------------------
    //     const frag = document.createDocumentFragment();
    //     for (let i=0; i < errors.length; ++i){
    //         // msg += errors[i] + "<br/>";
    //         let li = document.createElement('li');
    //         li.innerHTML = errors[i];
    //         frag.appendChild(li)
    //     }
    //     const err_list = document.createElement('ul');
    //     err_list.appendChild(frag);
    //     //----------------------------------------------

    //     //-------------------fetch drawer---------------
    //     const drawer = document.getElementById('drawer');
    //     const prevcontent = drawer.innerHTML;
    //     //-----------------------------------------------

    //     const err_container = document.createElement('div');
    //     err_container.className = 'container vertical position--center';
    //     err_container.style = 'color:red;font-size:0.9rem;line-height: 1.3rem;'
    //     err_container.appendChild(err_list); //append error list to err_container**

    //     const backbtn = document.createElement('button'); //back to add product button
    //     backbtn.className = 'btn cta mt-1 ';
    //     backbtn.style = "font-size:0.8rem";
    //     backbtn.textContent = "بازگشت"
    //     err_container.appendChild(backbtn); //append backbutton to err_container
    //     drawer.setcc(err_container); //replace drawer content with a given node (err_container)

    //     //handle go back to add product------------------------------
    //     backbtn.addEventListener('click', (function (drawer, val) {
    //         return function() {
    //             drawer.setContent(val);
    //             //ex: try to keeping text contents of add product view...
    //         }
    //     })(drawer,prevcontent)); 
    //     //-----------------------------------------------------------

    //     return null; //data were corrupted so, nothing will return (endpoint_1 of prepare_product_info)
    // }

    //otherwise, in the case of clean data::

    //---------------- return sanitized data-------------------------
    const data = new FormData(); //use form initializer...
    data.append("name", name);
    data.append("price", price);
    data.append("description", description);
    data.append("quantity",quantity);
    data.append("keywords", keyword);
    if (colors)
        data.append("colors", selected_colors);
    if(sizes)
        data.append("sizes", selected_sizes);
    if (type)
        data.append("type", type);
    if (subtype)
        data.append("subtype", subtype);
    if (attrs)
        data.append("attrs",attrs);
    data.append("is_available",'True')
    if (categories)
        data.append("categories",categories);
    if (brand)
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
    if (!data) {
        document.getElementById('product-add-error-box').innerText = 'خطا: لطف موارد خواسته شده را تکمیل کند';
        return;
    }
    console.log(data);
    const xhttp = new XMLHttpRequest()
    xhttp.open("POST", "/product/add/");
    xhttp.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
    xhttp.onload = () =>{
        if(xhttp.status == 200){
            // const sucess = document.getElementById("sucessful-edit").innerHTML;
            const d = document.getElementById('drawer');
            d.hideLoader();
            d.setContent(xhttp.responseText); // ex:change with xhttp.responseText and, in the server side, make the addition is done successfully prompt...
        }

    };
    document.getElementById('drawer').showLoader();
    xhttp.send(data);

  
}


function edit_product(){
    const data = prepare_product_info("edit");
    if (!data) {
        document.getElementById('product-add-error-box').innerText = 'خطا: لطف موارد خواسته شده را تکمیل کند';
        return;
    }
    const product_id = document.getElementById("id").value;
    const xhttp = new XMLHttpRequest()
    xhttp.open("POST", "/product/edit/" + product_id + "/");
    xhttp.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
    xhttp.onload = () =>{
        if(xhttp.status == 200){
            const d = document.getElementById('drawer');
            d.hideLoader();
            d.setContent('success'); // ex:change with xhttp.responseText and, in the server side, make the addition is done successfully prompt...
        }

        if(xhttp.status == 400){
        }
    }   
    document.getElementById('drawer').showLoader();
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
            document.getElementById('drawer').hideLoader();
        }
    }

    xhttp.open("POST", "/product/change_image/")
    const data = new FormData();
    data.append("image",file);
    data.append("id",prod_img_id);
    xhttp.setRequestHeader("X-CSRFToken",getCookie("csrftoken"));
    document.getElementById('drawer').showLoader();
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


function update_cart_summary(){

}


function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

function validateName(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = evt.key;
    console.log(charCode);
    const wilds = ".+--)(*&^%$#@!~`,/'\";:][\|=";
    if (wilds.indexOf(charCode) > 0) {
        return false;
    }
    return true
}

function validate_shop_name(evt){
    evt = (evt) ? evt : window.event;
    var charCode = evt.key;
    console.log(charCode);
    const wilds = ".+--)(*&^%$#@!~`,/'\";:][\|= ";
    if (wilds.indexOf(charCode) > 0) {
        return false;
    }
    return true
}

function validate_email(){
    const email = event.target.value.trim()
    const mail_rx = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
    const err_box =  document.getElementById('email-error');
    console.log(mail_rx.test(email));
    if (!mail_rx.test(email)) {
        err_box.innerText = 'ایمیل معتبر نمیباشد';
        event.target.focus();
        return;
    }
    else{
        err_box.innerText = '';
    }
    get('/users/check_email?email=' + email,function(resp, status){
        if (status != 200){
            document.getElementById('email-error').innerText = 'ایمیل قبلا ثبت شده است';
        }
        else{
            document.getElementById('email-error').innerText = '';
        }
    });
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
    const like = event.target;
    let counts = document.getElementById('like-counts');
    counts_val = +counts.innerText;
    if (like.classList.contains('liked')){
        get('/favourites/remove/' + pid + '/',  function(resp, staus){
            if (staus === 200) {
                if (counts_val > 0)
                    counts_val -=1
                counts.innerText = counts_val;
                like.classList.remove('liked');

            }
        })
    }   
    else {
        get('/favourites/add/' + pid + '/', function(resp, status) {
            if (status === 200) {
                like.classList.add('liked');
                counts_val +=1;
                counts.innerHTML = counts_val;
                open_favourites()
            }
        });
       
    }  
}

function remove_product_dialog(accept, reject){
    console.log('remove product dialog...');
    const temp = document.getElementById('remove-dialog-box').content.cloneNode(true);
    temp.getElementById('accept-button').addEventListener('click', accept);
    temp.getElementById('reject-button').addEventListener('click', reject);
    document.getElementById('drawer').open();
    document.getElementById('drawer').setcc(temp);
}

function add_to_cart_in_detail_page(){

    let color = null, size = null;
    const id = document.getElementById('product_id').value;
    try{
        color = 
            document.getElementById('product_colors').getElementsByClassName('inline-item--selected').dataset['id'];

        size = document.
        getElementById('product_sizes').
        getElementsByClassName('inline-item--selected').dataset['id'];
    }
    catch {}
    get('/cart/add/' + id + '/?' + 'color=' + color + ';size=' + size, function() {
        update_cart_badge('add');
        open_cart();
    });

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

var prev_cats = "";
function fetch_types(){
    const target = event.target
    if (!target.classList.contains('item')){
        return;
    }
    if (!target.classList.contains('selected')){
        document.getElementById('types').replaceChildren('');
    }
    const cats = get_selecteds('categories', false, true);
    console.log(cats,'categ...');
    if (prev_cats === cats){
        console.log('null');
        return
    }

    document.getElementById('types').replaceChildren('');
    document.getElementById('subtypes').replaceChildren('');
    get('/shop/types?cats='+cats, function(data, status) {
        if (status == 200) {
            const da = JSON.parse(data)
            const frag = new DocumentFragment()
            for (let i=0; i < da['types'].length; ++i) {
                let div = document.createElement('div');
                div.dataset['id'] = da['types'][i].id;
                div.dataset['hascolor'] = da['types'][i]['has_color'];
                div.dataset['hassize'] = da['types'][i]['has_size'];
                div.innerText = da['types'][i].name;
                div.className = 'item';
                frag.appendChild(div);
            }
            document.getElementById('types').replaceChildren(frag);
           
        }
    });
}

var prev_subtype = "";
function fetch_subtypes() {
    const colors = document.getElementById('colors');
    const sizes = document.getElementById('sizes');
    if (!event.target.classList.contains('item'))
        return;
        if (!event.target.classList.contains('selected')){
            document.getElementById('subtypes').replaceChildren('');
        }
    const cats = get_selecteds('categories', false, true);
    const st = get_selecteds('types', true, true);
    const has_color = event.target.dataset['hascolor'];
    const has_size = event.target.dataset['hassize'];

    if (prev_subtype === st){
        return;
    }
    console.log('*********', has_color, has_size);
    if (has_color === 'true'){
        colors.classList.remove('hi');
    }
    else {
        colors.classList.add('hi');
    }
    if (has_size === 'true'){
        sizes.classList.remove('hi');
    }
    else 
    {
        sizes.classList.add('hi')
    }
    console.log(st, 'st----------');
    if (!st)
        return;

    document.getElementById('subtypes').replaceChildren('');
    get('/shop/subtypes?cats='+ cats+'&type=' + st, function(data, status) {
        if (status == 200){
            console.log('subtype');
            const d = JSON.parse(data);
            console.log(d);
            const frag = new DocumentFragment();
            for (let i=0; i < d['subtypes'].length; ++i) {
                let div = document.createElement('div');
                div.className = 'item';
                div.dataset['id'] = d['subtypes'][i]['id'];
                div.innerText = d['subtypes'][i]['name'];
                frag.appendChild(div);
            }
            document.getElementById('subtypes').replaceChildren(frag);
        }
    });
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

function dispatch_pay() {
    //---------------sentinel-------------------
    const uda = document.getElementById("use_default_address").checked;
    const f = document.forms['custom-address'];
    if (!uda) {
        for (let v=0;v < f.elements.length; v++){
            let j = f.elements[v].value.trim()
            if ( j == '' || j == '-1'){
                console.log(f.elements[v])
            alert('خطا: لطفااطلاعات مربوط به آدرس خود را به طور کامل وارد کنید')
            return;
            }
        }
    }
    //------------------------------------------
    load_view('/cart/dispatcher?use_default_address=' + uda);
    const vv = document.forms['custom-address'];
    let fdata = new FormData(vv); 
    window.address_form_data = fdata;
}

function login(){
    const pass = document.getElementById('password');
    document.getElementById('drawer').showLoader();
    load_view('/users/login/', 'post', "password=" + pass.value, success = function() {
        _toggle_nav_actions();

    }, error=function() {
        document.getElementById('login-error').innerText = 'رمز عبور اشتباه است';
        document.getElementById('drawer').hideLoader();
    });
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
            selected_states += "," + t.slice(0,t.length).trim();
        }
    }

    data.append("post_destinations", selected_states.slice(1,selected_states.length));
    
    const xhttp = new XMLHttpRequest()
    xhttp.open("POST", "/shop/edit/");
    xhttp.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
    xhttp.onload = () =>{
        if(xhttp.status == 200){
            document.getElementById('drawer').hideLoader();
            document.getElementById('drawer').setContent(xhttp.responseText);
        }
    }
    document.getElementById('drawer').showLoader();
    xhttp.send(data);
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
    const page_name = document.getElementById('page_name').value;
    console.log(page_name);
    const page_name_error = document.getElementById('page_name_error');
    if (! (rx.test(page_name))){
        page_name_error.value = 'نام بوتیک معتبر نمیباشد';
    }
    document.getElementById('drawer').showLoader();
    post('/appeal/register/', 'page_name=' + page_name + '&description=' + 'توضیحات', function(resp,status) {
        if (status == 200){
            const drawer = document.getElementById('drawer');
            drawer.hideLoader();
            drawer.setContent('درخواست شما ثبت شد...');

        }
        else {
            page_name_error.value = 'این نام صفحه قبلاانتخاب شده است';
            document.getElementById('drawer').hideLoader();
        }
    });
   
}
//----------------------------------------------------


function showMegaMenu() {
    event.stopPropagation();
    event.target.classList.add('cc');
    document.getElementById('megamenu').style.display = 'flex';

 }




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
    load_view('/shop/order/' + id + '/detail/');
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
    console.log('------------------', data);

    const email = document.getElementById("profile-email").value;
    const card = document.getElementById("profile-merchan_card").value;
    const errors = new Array()
    if(! is_valid_email(email)){
        errors.push('ایمیل نامعتبر است');
    }
    if(!is_valid_card(card)){
        errors.push('شماره کارت نامعتبر است');
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
            document.getElementById('drawer').setContent(xhttp.responseText);
            document.getElementById('drawer').hideLoader();
        }
    }
    document.getElementById('drawer').showLoader();
    xhttp.send(data);
}


function apply_coupon(){
    const coupon_code = document.getElementById("coupon-code").value;
    if (coupon_code.toString().length != 8) {
        alert('wrong');
        return;
    }
    const xhttp = new XMLHttpRequest();
    xhttp.onload = () =>{
        if(xhttp.status == 200){
          
            alert('success')
            resp = JSON.parse(xhttp.responseText);
            document.getElementById("total_sum").innerHTML = 'مبلغ' + resp["total"] + 'تومان' ;
        }
        if(xhttp.status == 400){
           alert('کوپن نامعتبر')
        }
    }

    xhttp.open("GET","/cart/apply_coupon/" + coupon_code + "/");
    xhttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
    xhttp.send();
}

function toggle_address(){
    document.getElementById('other-address').classList.toggle('hi');

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



function get_cities(pair){

    let selected_prov = event.target.selectedOptions[0].dataset['pid'];
    if (selected_prov != -1){
        fetch("/cities/" + "?province_id=" + selected_prov ,{
            header:{
                "Content-type":"applicatin/json"
            }
        }).then((res) => {
            res.json().then((data)=> {
                console.log(data);
                const cities = document.getElementById(pair);
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

function pay(){

    const amount = document.getElementById('amount').value.trim(); 
    console.log(amount);
    const xhr = new XMLHttpRequest();
    const drawer = document.getElementById('drawer');
    drawer.showLoader();
    xhr.onload = function() {
            drawer.hideLoader();
            drawer.setContent(this.responseText);
            document.getElementById('cart-num-badge').innerText = '0';
    }
    // xhr.open('post','/payments/dispatch/');
    xhr.open('post', '/payments/checkout/')
    xhr.setRequestHeader("X-CSRFTOKEN",getCookie("csrftoken"));
    xhr.send(window.address_form_data);
    
    // load_view('/payments/dispatch/','post',fdata);
}


function deposit_then_pay(){
    const amount = document.getElementById('cart-total').value;
    window.open('/payments/deposit/?amount' + amount + '&direct=true');
}

function deposit_account(){
    const amount = document.getElementById('deposit-amount').value.trim();
    if (amount == '' )
        return
    window.open('/payments/deposit/?amount=' + amount, '_self');
}

function widthraw_account() {
    const amount = document.getElementById('widthraw-amount').value.trim();
    if (amount == '')
    return
    load_view('/account/withdraw?amount=' + amount)
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

function get_messages(){
    load_view('/messages/', 'get')
}

function _select_tab() {
    const target = event.target;
    const tab_id = target.dataset['tab'];
    const contents = target.parentNode.parentNode.children;

    for (let i=0; i < contents.length; ++i){
        contents[i].classList.remove('tran')
    }
    document.getElementById(tab_id).classList.add('tran');
}
function select_tab(){
    const target = event.target;
    if (target.classList.contains('tab-item')){
        const tab_id = target.dataset['tab'];
        console.log(tab_id);
        const items = target.parentNode.children;
        for (let i = 0; i < items.length; ++i){
            items[i].classList.remove('tab-item-selected');
        }
        const contents = target.parentNode.parentNode.getElementsByClassName('tab-contents')[0].children;
        for (let i=0; i < contents.length; ++i){
            contents[i].classList.remove('tab-show-content');
        }
        target.classList.add('tab-item-selected');
        document.getElementById(tab_id).classList.add('tab-show-content');

    }

}

function show_filter() {
    const d = document.getElementById('drawer');
    const c = document.getElementById('filter_box');
    d.setcc(c.content.cloneNode(true));
    d.open();
}

function accept_order(){
    let id = document.getElementById('order_id').value;
    load_view('/shop/order/' + id + '/accept/');
}
function reject_order() {
    let id = document.getElementById('order_id').value;
    load_view('/shop/order/' + id + '/reject/');
}
function send_tracking_code() {
    let id = document.getElementById('order_id').value;
    let code = document.getElementById('tracking_code').value;
    load_view('/shop/order/' + id + '/tracking_code/' + '?tracking_code=' + code);
}

function cancel_order(){
    let id = document.getElementById('order_id').value;
    load_view('/user/order/' + id + '/cancel/');
}

function verify_recieved_order(){
    let id = document.getElementById('order_id').value;
    load_view('/user/order/' + id + '/verify/');
}


function mark__as_read(){
    const target = event.target;
    const id = target.dataset['id'];
    const spinner = document.createElement('span');
    spinner.className.add('loader');
    target.replaceChildren(spinner)
    get('/messages/' + id + '/mark_as_read', function(data,status) {
        if (status === 200){
            target.remove();
        }
    });    
}

function filter_product(){
    const categories = get_selecteds('filter-categories',false, true);
    const types = get_selecteds('filter-types', false, true);
    const subtypes = get_selecteds('filter-subtypes', false, true);
    const brands = get_selecteds('filter-brands', false, true);
    const  colors = document.getElementById("filter-colors").children;
    let selected_colors = "";
    for (let i=0; i < colors.length; ++i){
        if (colors[i].classList.contains("inline-item--selected")){
            selected_colors += "," + colors[i].dataset["id"];
        }
    }
    const sizes = document.getElementById("filter-sizes").children;
    let selected_sizes = "";
    for (let i=0; i < sizes.length; ++i){
        if (sizes[i].classList.contains("inline-item--selected")){
            selected_sizes += "," + sizes[i].dataset["id"];
        }
    }

    document.getElementById('categories').value = categories;
    document.getElementById('types').value = types;
    document.getElementById('subtypes').value = subtypes;
    document.getElementById('brands').value = brands;
    document.getElementById('colors').value = selected_colors;
    document.getElementById('sizes').value = selected_colors;

}

function register_checkout_request(){
    
}

function issue_deposit(){
    const amount = document.getElementById('deposit-amount').value;
    get('/payments/pay/?type=deposit&amount=' + amount + '/');
}