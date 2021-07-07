

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

function set_error(msg, timeout, after){
    const error_dialog = document.getElementById("error-dialog");
    error_dialog.innerText = msg;
    error_dialog.classList.add("show");
    setTimeout(() => {
        error_dialog.classList.remove("show");
    }, timeout);
    after();
}

function set_confirmation_dialog(msg, accept, reject){
    confirmation_dialog = document.getElementById("confirmation-dialog");
    confirmation_dialog.getElementById("msg").innerText = msg
    confirmation_dialog.getElementById("accept").onclick = accept;
    confirmation_dialog.getElementById("reject").onclick = reject;

}
function toggle_confirmation_dialog(){
    document.getElementById("confirmation-dialog").classList.toggle("show");
    document.getElementById("side-box").classList.toggle("overflow-hidden");
}

function toggle_waiting(){
    document.getElementById("waiting").classList.toggle("show");
    document.getElementById("side-box").classList.toggle("overflow-hidden");
}


function set_view(view){
    document.getElementById("side-box-content").innerHTML = view;
}

function load_view(url,method, data,enc){
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = () =>{
        if (xhttp.status == 200){
            toggle_waiting();
            set_view(xhttp.responseText);
        }
        else {
            set_error("error");
        }
    }
    toggle_waiting()
    if (method == "POST"){
        xhttp.setRequestHeader("X-CSRFToken",getCookie("csrftoken"));

    }
    if (enc == true){
        xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    }
    xhttp.open(method, url);
    xhttp.send(data);
}

function command(url, data){
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = () =>{
       return (xhttp.status == 200);
    }
    xhttp.open("GET", url);
    xhttp.send(data);
}

/********************CART******************** */
function get_cart(){

    load_view("/cart/")
}

function add_to_cart(){
    const product_id = event.target.dataset["id"];
    const data = new FormData()
    data.append("id", id);
    command("/cart/add/", data);
}
function remove_from_cart(){
    const product_id = event.target.dataset["id"]
    const data = new FormData()
    data.append("id",product_id);
    command("/cart/remove/",data);
}
function update_cart(){}
function change_product_color(){
    const color = event.target;
    if (color.classList.contains("color")){
        const color_id = color.dataset["id"];
        const data = new FormData()
        data.append("id",color_id);
        command("/cart/set_color/",data);
    }
}
function change_product_size(){
    const size = event.target;
    if (color.classList.contains("size")){
        const size_id = color.dataset["id"];
        const data = new FormData()
        data.append("id",size_id);
        command("/cart/set_size/",data);
    }
}
function increment_product(){
    const product_id = event.target.dataset["id"];
    const data = new FormData();
    data.append("id",product_id);
    res = command("/cart/increment/",data);
    if (!res){
        msg = "اتمام موجودی";
        set_error(msg, 1000, ()=>{});
    }

}
function decrement_product(){
    const product_id = event.target.dataset["id"];
    const data = new FormData();
    data.append("id",product_id);
    res = command("/cart/decrement/",data);
    if (!res){
        msg = "اتمام موجودی";
        set_error(msg, 1000, ()=>{});
    }
}
function apply_coupon(){
    const coupon_code = document.getElementById("coupon-code").value;
}
function checkout_cart(){}

/********************************************* */

/*******************FAVOURITES**************** */

function get_favourites(){
    load_view("/favourites/","GET",null)
}
function add_to_favourites(){
    const product_id = event.target.dataset["id"];
    const data = new FormData()
    data.append("id", product_id);
    command("/favourites/add/", data);
}
function remove_from_favourites(){
    const product_id = event.target.dataset["id"];
    const data = new FormData()
    data.append("id", product_id);
    command("/favourites/remove/", data);
}

/********************************************* */

/*********************SHOP******************** */

function get_add_product_form(){
    load_view("product/add/", "GET", null, false);
}

function add_product(){

}

function edit_product(){
    const product_id = event.target.dataset["id"];
    const data = new FormData();
    data.append("id", product_id);
    load_view("/product/add_edit/", data);
}

function remove_product(){
    const product_id = event.target.dataset["id"];
    const data = new FormData();
    data.append("id", product_id);
    msg = "آیا از حذف محصول اطمینان دارید؟"
    set_confirmation_dialog(msg,()=>{
        command("product/remove/", data);
        confirmation_dialog.classList.remove("show");


    }, () => {
        confirmation_dialog.classList.remove("show");
    })

}
function changeimg(){
    const id = event.target.dataset['img'];
    const img = document.getElementById(id);
    const prod_img_id = img.dataset['id'];
    const file = event.target.files[0];
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () =>{
        if (xhttp.status == 200){
            path = xhttp.responseText;
            img.src = path;
        }
    }

    xhttp.open("POST", "shops/change_image/")
    const data = new FormData();
    data.append("image",file);
    data.append("id",prod_img_id);
    xhttp.setRequestHeader("X-CSRFToken",getCookie("csrftoken"));
    xhttp.send(data);
    
}


/********************************************* */

/*******************REGISTRATION**************** */
function get_enrollment_form(){
    load_view("users/enrollment/");
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

    const phone_no = document.getElementById("phone_no").value;
    const data = new FormData();
    data.append("phone_no", phone_no);
    load_view("/users/enrollment","POST", data, true);
}

function login(){
    const password = document.getElementById("password").value;
    const data = new FormData()
    data.append("password", password);
    load_view("users/login/","POST",data, true);
}

function logout(){
    load_view("/users/logout/", "GET", null, false);
}

function verify_code(){
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () =>{
        if(xhttp.status == 200){
            
            document.getElementById("side-box-content").innerHTML = xhttp.responseText;
        }
        
    }
    const code = document.getElementById("code").value;
    const data = new FormData()
    data.append("code", code);
    load_view("users/verification", "POST", data, true);
    
}

function validate_password(){
    let password = document.getElementById("password").value;
    let confirm = document.getElementById("confirm").value;
    const error = document.getElementById("error");
    let rx = RegExp('(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');
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
       load_view("users/set_password", "POST", data, true);
    }
}



function get_profile(){
    load_view("/users/profile/","GET", null,false);
}

/************************************************ */


/*********************ORDERS********************* */
function get_orders(){

}

function order_accepted(){}
function order_rejected(){}
function order_sent(){}
function order_cancelled() {}
function order_received() {}
function issue_order_return() {}
/*********************COMMENTS******************* */

function get_comments(){

}

function leave_comment(){

}
/************************************************** */

function get_selecteds(name, single){
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
        return "0"
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
    let attrs = new Object();
    for (let i=0; i < _attrs.length; ++i){
        key_value = _attrs[i].children[0].innerHTML.split(':');
        attrs[key_value[0]] = key_value[1];
    }
    return JSON.stringify(attrs);
}

function add_product(){
    const id = document.getElementById("id");
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const quantity = document.getElementById("quantity").value;
    const keywords = document.getElementById("keywords").value;
    const price = document.getElementById("price").value;
    const brand = get_selecteds("brands", true);
    const type = get_selecteds("types", true);
    const categories = get_selecteds("categories",false);
    const subtype = get_selecteds("subtypes", true);
    const images = document.getElementById("images").files;
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
    if (selected_colors == ""){
        selected_colors = all_colors;
    }
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
    if (selected_sizes == ""){
        selected_sizes = all_sizes;
    }
    selected_sizes = selected_sizes.slice(1, selected_sizes.length);
    

    const data = new FormData();
    data.append("name", name);
    data.append("price", price);
    data.append("description", description);
    data.append("quantity",quantity);
    data.append("id",document.getElementById("id").value);
    data.append("keywords", keywords);
    data.append("colors", selected_colors);
    data.append("sizes", selected_sizes);
    data.append("type", type);
    data.append("subtype", subtype);
    data.append("attrs",attrs);
    data.append("is_available",'True')
    data.append("categories",categories);
    data.append("brand", brand);
    for (let i=0; i < images.length; i++){
        data.append("images",images[i]);
    }
    load_view("","POST", data, false);
    xhttp.open("POST", "/product/add_edit/");
    xhttp.setRequestHeader("X-CSRFToken",getCookie("csrftoken"));
    document.getElementById("waiting-overlay").classList.add("show");
    
    setTimeout(() => {
        document.getElementById("waiting-overlay").classList.remove("show");
        document.getElementById("side-box").classList.remove("overflow-hidden");

    }, 4000);
   // xhttp.send(data);

}

function filter_product(){
    document.getElementById("categories").value = get_selecteds("category_list", false);
    document.getElementById("types").value = get_selecteds("type_list", false);
    document.getElementById("subtypes").value = get_selecteds("subtype_list", false);
    document.getElementById("brands").value = get_selecteds("brand_list", false);
    console.log(get_selecteds("category_list",false));
    let selected_colors = "";
    let all_colors = "";
    const colors = document.getElementById("color_list").children;
    for (let i=0; i < colors.length; ++i){
        all_colors += "," + colors[i].dataset["id"];
        if (colors[i].classList.contains("select-color")){
            selected_colors += "," + colors[i].dataset["id"];
        }
    }

    const sizes = document.getElementById("size_list").children;
    let selected_sizes = "";
    let all_sizes = "";
    for (let i=0; i < sizes.length; ++i){
        all_sizes += "," + sizes[i].dataset["id"];

        if (sizes[i].classList.contains("select-size")){
            selected_sizes += "," + sizes[i].dataset["id"];
        }
    }

    if (selected_colors == ""){
        selected_colors = all_colors;
    }
    if (selected_sizes == ""){
        selected_sizes = all_sizes;
    }
    console.log("colors");
    console.log(selected_colors);
    console.log("sizes");
    console.log(selected_sizes);
    document.getElementById("colors").value = selected_colors.slice(1,selected_colors.length);
    document.getElementById("sizes").value = selected_sizes.slice(1, selected_sizes.length);
    return true
}

