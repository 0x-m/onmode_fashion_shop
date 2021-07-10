

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
    document.getElementById("error-msg").innerText = msg;
    error_dialog.classList.add("show");
    setTimeout(() => {
        error_dialog.classList.remove("show");
    }, timeout);
    after();
}

function set_confirmation_dialog(msg, accept, reject){
    confirmation_dialog = document.getElementById("confirmation-dialog");
    document.getElementById("confirm-msg").innerText = msg
    document.getElementById("confirm-accetp").onclick = () =>{accept();}
    document.getElementById("confirm-reject").onclick = ()=>{ reject();}
    toggle_confirmation_dialog();

}
function toggle_confirmation_dialog(){
    document.getElementById("confirmation-dialog").classList.toggle("show");
    document.getElementById("side-box").classList.toggle("overflow-hidden");
}

function toggle_waiting(){
    document.getElementById("waiting").classList.toggle("show");
    document.getElementById("side-box").classList.toggle("overflow-hidden");
}

function openSidebox(){
    document.getElementById("side-box").classList.add("")
}

function set_view(view){
    const content = document.getElementById("side-box-content");
    content.innerHTML = view;
    showSidebox();

}

function load_view(url,method, data, after=()=>{}){
    const xhttp = new XMLHttpRequest()
    xhttp.onload = () =>{
        if (xhttp.status == 200){
            toggle_waiting();
            set_view(xhttp.responseText);
            
        }
        after(xhttp);
    }
   
    toggle_waiting()

    xhttp.open(method, url);
    xhttp.setRequestHeader("X-CSRFToken",window.CSRF_TOKEN);
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhttp.send(data);
    
}

function  command(url, then = ()=>{}, error = ()=>{}){
    const xhttp = new XMLHttpRequest()
    console.log("data---------");
    
    xhttp.onload = () =>{
       if (xhttp.status == 200){
           then(xhttp.responseText);
       }
    }
    xhttp.onerror= () => {
        error();
        console.log(xhttp.url);
    }
    xhttp.open("GET", url);
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhttp.send();
   
}
function tt(data){
    console.log( data)
}

/********************CART******************** */
function get_cart(){
   // load_view("/cart/","GET");
   fetch("/cart/",{
       header :{
           'content-type':'application/x-www-form-urlencoded'
       }
   }).then((res) => {
       res.text().then((r)=>{
           set_view(r);
       })
   })
}

function add_to_cart(){
    event.preventDefault()
    event.target.disabled = true;
    const product_id = event.target.dataset["id"];
    command("/cart/add/" + product_id + "/");
    const num =  document.getElementById("card-num");
    const q = parseInt(num.innerText) + 1;
    num.innerText = q;
    event.target.disabled = false;


}
function remove_from_cart(){
    const t = event.target;
    t.disabled = true;
    const item = event.target.parentNode
    const product_id = event.target.dataset["id"]
    msg = "آیا مایل به حذف مورد انتخابی هستید؟"
    set_confirmation_dialog(msg, ()=>{

        toggle_confirmation_dialog(); 
        command("/cart/remove/" + product_id + "/", (data) => {
            const num =  document.getElementById("card-num");
            const q = parseInt(num.innerText) - 1;
            num.innerText = q;
            t.disabled = false;
            get_cart();
        })
       
        console.log('remove done');
        
    }, () =>{
        toggle_confirmation_dialog();
        console.log('remove aborted')
    });
    
}

function update_cart(){}

function change_product_color(product_id=null,color_id=null){

    const obj = event.target
    if (obj.classList.contains("color")){
        const color_id = obj.dataset["id"];
        const product_id = obj.parentNode.dataset["id"];
        const color = obj.parentNode.parentNode.parentNode.children[0];

        let data = "?product_id=" + product_id + "&color_id=" + color_id;
        command("/cart/set_color/" + data, (dx) =>{
            color.style.background = obj.style.backgroundColor;
        });
        
    }
}
function change_product_size(){
    const obj = event.target;
    if (obj.classList.contains("size")){
        const size_id = obj.dataset["id"];
        const product_id = obj.parentNode.dataset["id"];
        const size = obj.parentNode.parentNode.parentNode.children[0];
        const data = "?size_id=" + size_id + "&product_id=" + product_id;
        command("/cart/set_size/" + data, (d) =>{
            size.innerText = obj.innerText;
        });
    }
}

function increment_product(){
    const product_id = event.target.dataset["id"];
    command("/cart/increment/" + product_id + "/",(data)=>{
        resp = JSON.parse(data);
        console.log(data);
        document.getElementById("total_price").innerText = resp['total'];
    }, ()=>{
        msg = "اتمام موجودی";
        console.log("err...inc...")
        set_error(msg, 1000, ()=>{});
    });


}
function decrement_product(){
    const product_id = event.target.dataset["id"];
    command("/cart/decrement/" + product_id + "/", (data)=> {
        resp = JSON.parse(data);
        console.log(data);
        document.getElementById("total_price").innerText = resp["total"];
    })
}
function apply_coupon(){
    const coupon_code = document.getElementById("coupon-code").value;
}
function checkout_cart(){}

/********************************************* */

/*******************FAVOURITES**************** */

function get_favourites(){
    load_view("/favourites/","GET")
}
function add_to_favourites(){
    const product_id = event.target.dataset["id"];
    command("/favourites/add/" + product_id + "/",(data)=>{
        console.log(data);
    });
}
function remove_from_favourites(){
    const product_id = event.target.dataset["id"];
    msg = "آیا مایل به حذف مورد انتخابی هستید؟"
    set_confirmation_dialog(msg , () => {
        toggle_confirmation_dialog();
        command("/favourites/remove/" + product_id + "/",()=>{
            get_favourites();
        });
    }, () => {
        toggle_confirmation_dialog();
    })
}

/********************************************* */

/*********************SHOP******************** */

function get_add_product_form(){
    load_view("/product/add/", "GET", null, false);
}


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
    data.append("keywords", keywords);
    data.append("colors", selected_colors);
    data.append("sizes", selected_sizes);
    data.append("type", type);
    data.append("subtype", subtype);
    data.append("attrs",attrs);
    data.append("is_available",'True')
    data.append("categories",categories);
    data.append("brand", brand);
    if (command == "add"){
        const images = document.getElementById("images").files;
        for (let i=0; i < images.length; i++){
            data.append("images",images[i]);
        }
    }
    return data;
}

function add_product(){
    const data = prepare_product_info("add");
    load_view("/product/add/","POST", data, false);
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



function edit_product(){
    const product_id = event.target.dataset["id"];
    const data = new FormData();
    data.append("id", product_id);
    load_view("/product/add_edit/","POST", data);
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

function get_messages(){
    load_view("/messages/","GET", null);
}
function get_appeal_form(){
    load_view("/appeal/register/", "GET", null);
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
    const data = new FormData()
    const page_name = document.getElementById("page_name").value
    const rx = new RegExp("^[a-z0-9_]{4,}$")
    if (! (rx.test(page_name)) ){
        return
    }
    const description = document.getElementById("description").value
    data.append("page_name", page_name)
    data.append("description", description)
    load_view("/appeal/register/", "POST",data, (x)=>{
        if(x.status == 200){
            console.log("successsfull");
        }
    })
       
}
/*******************REGISTRATION**************** */
function get_enrollment_form(){
    load_view("/users/enrollment/","GET");
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
    data = new FormData();
    data.set("phone_no", phone_no);
    
    fetch("/users/enrollment/",{
        header:{
            "X-CSRFToken":getCookie("csrftoken")
        },
        
        body: data
    }).then((res) =>{
        if(res.status == 200){
            res.text(r).then((s) => {
                set_view(s);
            })
        }
    });
    //load_view("/users/enrollment/","POST", data);
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
    console.log(code)
    const data = new FormData()
    data.set("code", code);
    load_view("/users/verification/", "POST", data,(x)=>{
        if(x.status == 422 || x.status == 400){
            const msg = "کد  اشتباه است"
            set_error(msg ,1500,()=>{});
            toggle_waiting();

        }
    });
    
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
       load_view("/users/set_password/", "POST", data, true);
    }
}



function get_profile(){
    load_view("/users/profile/","GET", null,false);
}

function edit_profile(){
    form = document.getElementById("personal_info");
    const data = new FormData(form); //"?first_name=" + first_name + "&last_name=" + last_name;
    const email = document.getElementById("email").value;
    const card = document.getElementById("merchan_card").value;
    if(! is_valid_email(email) && ! is_valid_card(card)){
        const msg  = "شماره کارت و ایمل نامعتبر است"
        set_error(msg,1000);
        return
    }
    else if(! is_valid_email(email)){
        const msg  = " ایمل نامعتبر است"
        set_error(msg,1000);
        return
    }
    else if(! is_valid_card(card)){
        const msg  = "شماره کارت نامعتبر است"
        set_error(msg,1000);
        return
    }

    fetch("/users/profile/", 
    {
        method: 'post',
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: data

        
    }).then((res)=>{
        if(res.status == 200){
            msg = "اطلاعات ویرایش شد"
            set_error(msg,1000,()=>{
                
            })
        }
      
    })
}

/************************************************ */

function checkout_request(){
    load_view("/account/checkout","GET",null);
}

function deposit_request(){
    load_view("/account/deposit","GET",null);

}

function get_edit_shop_form(){
    load_view("/shop/edit/","GET",null);
}

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
function is_valid_email(email){
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
function validate_email(){
    const email = document.getElementById("email")
    if (! is_valid_email(email.value)){
        email.classList.add("error");
    }
    else{
        email.classList.remove("error")
    }
}

function is_valid_card(card_num){

    card_num = String(card_num);
    const rx = new RegExp("^[0-9]{16}$");
    if (card_num != "" && rx.test(card_num)){
        let sum = 0;
        let pattern = "2121212121212121";
        for (let i=0;i < card_num.length; i = i + 2){
          let p = parseInt(card_num[i]) * parseInt(pattern[i])
          if (p > 9){
              p -=9;
          }
          sum +=p;
        }
        
        return (sum % 10 == 0);
    }
    return false;
}

function validate_card(){
    const card = document.getElementById("merchan_card");
    
    if(! is_valid_card(card.value)){
        card.classList.add("error");
    }
    else{
        card.classList.remove("error");
    }
    
}