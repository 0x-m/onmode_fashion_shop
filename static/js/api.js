
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

function start_waiting(){
    document.getElementById("waiting").classList.add("show");

}

function end_waiting(){
    document.getElementById("waiting").classList.remove("show");

}

function toggle_waiting(){
    document.getElementById("waiting").classList.toggle("show");
    document.getElementById("side-box").classList.toggle("overflow-hidden");
}



function set_view(view){
    document.getElementById("side-box-content").innerHTML = view;
    //showSidebox();

}

function load_view(url,method, data, after=()=>{}){
    const xhttp = new XMLHttpRequest()
    xhttp.onload = () =>{
        if (xhttp.status == 200){
            end_waiting();
            set_view(xhttp.responseText);
            
        }
        after(xhttp);
    }
   
    
    showSidebox();
    start_waiting();
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

//-------------------------------------------------------------------------------
//------------------------------------CART---------------------------------------
//-------------------------------------------------------------------------------
function get_cart(){   
   showSidebox();
   start_waiting();
   fetch("/cart/",{
       header :{
           'content-type':'application/x-www-form-urlencoded'
       }
   }).then((res) => {
       res.text().then((r)=>{
           end_waiting();
           set_view(r);
       })
   })
}

function add_to_cart(){
    event.preventDefault()
    event.target.disabled = true;
    const product_id = event.target.dataset["id"];
   // command("/cart/add/" + product_id + "/");
    fetch("/cart/add/" + product_id + "/").then((response) => {
        if(response.ok){
            response.json().then((t) =>{
                const num =  document.getElementById("card-num");
                num.innerText = t['cart_num']
            })
        }
    })
    event.target.disabled = false;


}


function add_to_cart_in_detail_page(){
    const color = document.querySelector("#product-colors>.color.select-color").dataset["id"];
    const size = document.querySelector("#product-sizes>.size.select-size").dataset["id"];
    const product_id = event.target.dataset['id'];
    const quantity = document.getElementById("product-quantity").value
    console.log(color, size, quantity);
    event.preventDefault()
    event.target.disabled = true;
    fetch("/cart/add/" + product_id + "/" + "?q="+ quantity + "&color="+color+"&size="+size).then((response) => {
        if(response.ok){
            response.json().then((t) =>{
                const num =  document.getElementById("card-num");
                num.innerText = t['cart_num']
            })
        }
    })
    event.target.disabled = false;


}

function remove_from_cart(){
    const t = event.target;
    t.disabled = true;
    const item = event.target.parentNode
    const product_id = event.target.dataset["id"]

    msg = "?????? ???????? ???? ?????? ???????? ?????????????? ????????????"
    set_confirmation_dialog(msg, ()=>{

        toggle_confirmation_dialog(); 
        fetch("/cart/remove/" + product_id + "/",{
           method: "GET"
        }).then((resp) => {

            resp.json().then((data)=>{
                document.getElementById("card-num").innerText = data["num"];
                document.getElementById("total_price").innerText = data["total"];
                item.remove();
                if (data["num"] == "0"){
                    document.getElementById("cart-summary").remove();
                }
                t.disabled = false;
                //get_cart()
            })
        })
       
        
    }, () =>{
        toggle_confirmation_dialog();
    });
    
}

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
        document.getElementById("card-num").innerText = resp['num']
    }, ()=>{
        msg = "?????????? ????????????";
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
        document.getElementById("card-num").innerText = resp['num'];
    })
}

function apply_coupon(){
    const coupon_code = document.getElementById("coupon-code").value;
    if (coupon_code.toString().length != 6) {
        return;
    }
    const xhttp = new XMLHttpRequest();
    xhttp.onload = () =>{
        if(xhttp.status == 200){
            end_waiting();
            resp = JSON.parse(xhttp.responseText);
            document.getElementById("total-price").innerHTML = resp["total"];
        }
        if(xhttp.status == 400){
            end_waiting();
            console.log('ssss')
            msg = "???????? ??????????????"
            set_error(msg,2000,()=>{});
        }
    }

    xhttp.open("GET","/cart/apply_coupon/" + coupon_code + "/");
    xhttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
    start_waiting();
    xhttp.send();
}
function checkout_cart(){
    start_waiting();
    fetch('/orders/checkout/',{
        method: 'GET'
    }).then((response) =>{

        response.text().then((txt)=>{
            end_waiting();
            set_view(txt);
        })

    })
}
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------



function make_issue(){
    fetch("/issue/register/",{
        method: "GET",

    }).then((response)=>{
        response.text().then((txt)=>{
            set_view(txt)
            showSidebox();
        })
    })
}

function toggle_address_form(){
    if(event.target.checked){
        document.getElementById('address_form').style.display = "none"
    }
    else{
        document.getElementById('address_form').style.display = "flex";
    }
}

function get_all_issues(){
    fetch('/issue/all/',{
        method : "GET"
    }).then((response) =>{
        response.text().then((txt) => {
            
        })
    })
}

function change_issue_help(){
    console.log("sddsdsf")
    const id = document.getElementById("subject").value;
    document.getElementById("issue-disc").innerHTML = document.getElementById("help-"+id).innerHTML;
}

/********************************************* */
function purchase(){
    const form = document.getElementById('address_form')
    const use_default_address = document.getElementById("use_default_address").checked;
    const data = new FormData(form);
    if (use_default_address == true){
        data.append('user_default_address','true')
    }
    else if (use_default_address == false){
        data.append('user_default_address', 'false')
    }
    
    const xhttp = new XMLHttpRequest();
    xhttp.onload = () =>{
        if(xhttp.status == 200){
            end_waiting()
            set_view(xhttp.responseText);
        }
    }

    xhttp.open("POST","/orders/checkout/");
    xhttp.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
    start_waiting();
    xhttp.send(data);
}



/*******************FAVOURITES**************** */

function get_favourites(){
   
   start_waiting();
   showSidebox();
   fetch("/favourites/",{
        header: {
            'content-type':'application/x-www-form-urlencoded'
        }
    }).then((response) => {
        if(response.status != 200){
           
        }
        response.text().then((txt)=>{
            set_view(txt);
            end_waiting();
        })
    })
}
function add_to_favourites(){
    const product_id = event.target.dataset["id"];
    command("/favourites/add/" + product_id + "/",(data)=>{
        console.log(data);
    });
}
function remove_from_favourites(){
    const product_id = event.target.dataset["id"];
    msg = "?????? ???????? ???? ?????? ???????? ?????????????? ????????????"
    set_confirmation_dialog(msg , () => {
        toggle_confirmation_dialog();
        start_waiting();
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
        attrs["????????????"] = "??????????"
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
    
    const errors = new Array()

    if (name == ""){
        errors.push("?????? ?????????? ???? ???????? ????????");

    }
    let rx = new RegExp('^[1-9][0-9]{3,6}$');
    if (!rx.test(price)){
        errors.push("???????? ???????? ?????? 1000 ???? 10 ???????????? ?????????? ????????");
    }
    rx = new RegExp('^[1-9][0-9]{0,2}$')
    if(!rx.test(quantity)){
        errors.push("?????????? ???????? ?????? 1 ???? 999 ????????");
    }

    if(type == ""){
        errors.push("?????? ?????????? ???? ???????????? ????????");
    }
    if(subtype == ""){
        errors.push("???????????? ?????????? ???? ?????????? ????????");
    }
    if (brand == ""){
        errors.push("???????? ?????????? ???? ???????????? ????????");
    }
    if(categories == ""){
        errors.push("???????? ???????? ?????????? ???? ???????? ????????");
    }
    if(selected_colors == ""){
        errors.push("?????? ???????? ?????????? ???? ???????????? ????????")
    }
    if(selected_sizes == ""){
        errors.push("???????????????? ?????????? ???? ???????????? ????????")
    }

    if( errors.length !=0){
        let msg = ""
        for (let i=0; i < errors.length; ++i){
            msg += errors[i] + "<br/>";
        }
        // set_error(msg,5000,()=>{

        // })
        document.getElementById('drawer').setContent(msg);
        return null;
    }

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
        for (let i=0; i < images.length && i <= 5; i++){
            data.append("images",images[i]);
        }
    }
    return data;
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
            d.setContent('success');
            
        }
        // if(xhttp.status == 400){
        //     const msg = "???????? ?????????????? ???????????? ?????? ???? ???? ?????????? ???????? ????????"
        //     set_error(msg,1000,()=>{end_waiting();})
        // }
    }
    if (data){
        document.getElementById('drawer').showLoader();
        xhttp.send(data);
    }
  
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


function get_edit_product(){
    event.stopPropagation();
    const product_id = event.target.dataset["id"];

    showSidebox();
    start_waiting();
    fetch("/product/edit/" + product_id + "/").then((res) => {

        if(res.ok){
            res.text().then((txt)=>{
                end_waiting();
                set_view(txt);
            })
        }
    });
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
            const msg = "???????? ?????????????? ???????????? ?????? ???? ???? ?????????? ???????? ????????"
            set_error(msg,1000,()=>{end_waiting();})
        }
    }   
    start_waiting();
    xhttp.send(data);
}

function remove_product(){
    event.stopPropagation();
    const product_id = event.target.dataset["id"];
    const product = document.getElementById("product-" + product_id);
    const data = new FormData();
    data.append("id", product_id);
    showSidebox();
    msg = "?????? ???? ?????? ?????????? ?????????????? ????????????"
    set_confirmation_dialog(msg,()=>{
        
        const xhttp = new XMLHttpRequest();
        xhttp.onload = () =>{

            if(xhttp.status == 200){
                end_waiting();
                const success = document.getElementById("sucessful-edit").innerHTML;
                set_view(success);
                product.remove();
                end_waiting();
            }
        }
        // confirmation_dialog.classList.remove("show");
        toggle_confirmation_dialog();
        xhttp.open("GET","/product/remove/" + product_id);
        
        start_waiting();
        xhttp.send()
        

    }, () => {
        // confirmation_dialog.classList.remove("show");
        toggle_confirmation_dialog();
    })
}
function changeimg(){
    const num = event.target.dataset['num'];
    console.log(num)
    const id = event.target.dataset['img'];
    const img = document.getElementById(id);
    const prod_img_id = img.dataset['id'];
    const product_id = document.getElementById("id").value;
    const product = document.getElementById("product-" + product_id);
    console.log(product)
    const file = event.target.files[0];
    const xhttp = new XMLHttpRequest();
    xhttp.onload = () =>{
        if (xhttp.status == 200){
            path = xhttp.responseText;
            img.src = path;
            if(num == 1){
                console.log("ojk...")
                product.children[0].children[0].src = path;
            }
        }
    }

    xhttp.open("POST", "/product/change_image/")
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
    const xhttp = new XMLHttpRequest();

    xhttp.onload = ()=>
    {
        if (xhttp.status == 200){
            end_waiting();
            set_view(xhttp.responseText);
        }
    }

    xhttp.open("POST", '/appeal/register/');
    xhttp.setRequestHeader("X-CSRFTOKEN",getCookie("csrftoken"));
    start_waiting()
    xhttp.send(data);



       
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
        document.getElementById("error").innerText = "?????????? ?????????? ???????? ?????? ???????? ??????????????";
        return;
    }
    document.getElementById("error").innerText = "";

    const phone_no = document.getElementById("phone_no").value;
    data = new FormData();
    data.append("phone_no", phone_no);
    const xhttp = new XMLHttpRequest()
    xhttp.onload = () =>
    {
        if (xhttp.status == 200){
            set_view(xhttp.responseText);
            end_waiting();
        }

     
    }
    xhttp.open("POST", "/users/enrollment/");
    xhttp.setRequestHeader("X-CSRFTOKEN",getCookie("csrftoken"));
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    start_waiting();
    xhttp.send("phone_no=" + phone_no.trim());

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
            const msg = "?????? ???????? ???????????? ??????"
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
            const msg = "????  ???????????? ??????"
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
        error.innerText = "?????????? ?????? ???????? ???????? ??????????????"
        return false;
    }
    else if(password.length < 8){
        error.innerText = "?????? ???????? ???????? ?????????? ?????? ???????? ????????"
        return false
    }
    else if(! rx.test(password)){
        error.innerText = "?????? ???????? ???????? ???????? ???????? ?????????? ?? ???????????? ????????"
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


function toggle_state_list(){
    
  const states = document.getElementById("states").children;
  if (event.target.checked == true){
  for (let i=0; i < states.length; ++i){
      states[i].classList.add('selected');
      states[i].children[0].classList.add('show');
  }
  }
  else {
    for (let i=0; i < states.length; ++i){
        states[i].classList.remove('selected');
        states[i].children[0].classList.remove('show');
    }
  }
}

function edit_profile(){
    form = document.getElementById("personal_info");
    const data = new FormData(form); //"?first_name=" + first_name + "&last_name=" + last_name;
    const email = document.getElementById("email").value;
    const card = document.getElementById("merchan_card").value;
    if(! is_valid_email(email) && ! is_valid_card(card)){
        const msg  = "?????????? ???????? ?? ???????? ?????????????? ??????"
        set_error(msg,1000);
        return
    }
    else if(! is_valid_email(email)){
        const msg  = " ???????? ?????????????? ??????"
        set_error(msg,1000);
        return
    }
    else if(! is_valid_card(card)){
        const msg  = "?????????? ???????? ?????????????? ??????"
        set_error(msg,1000);
        return
    }
    else if(! validate_province_and_city()){
        const msg  = "?????????? ?? ?????????????? ??????????????"
        set_error(msg,1000);
        return
    }
    const xhttp = new XMLHttpRequest()
    xhttp.open("POST", "/users/profile/");
    xhttp.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
    xhttp.onload = () =>{
        if(xhttp.status == 200){
            const sucess = document.getElementById("sucessful-edit").innerHTML;
            set_view(sucess);
            end_waiting();
        }
    }
    start_waiting();
    xhttp.send(data);
}

/************************************************ */

function get_cities(){
    const province_name = event.target.value;
    let province_id = null
    const provinces = document.getElementById("provinces").getElementsByTagName("option");
    
    for (let i=0; i < provinces.length; ++i){
        if(provinces[i].value.trim() == province_name.trim()){
            province_id = provinces[i].dataset["id"];
            break;
        }
    }


    if (province_id != null && province_id != ""){
        fetch("/cities/" + "?province_id=" + province_id ,{
            header:{
                "Content-type":"applicatin/json"
            }
        }).then((res) => {
            res.json().then((data)=> {
                const cities = document.getElementById("cities");
                const fragment = document.createDocumentFragment();

                cities.innerHTML = "";
                console.log(data);
                for(let i=0; i< data['cities'].length; ++i){
                    let option  = document.createElement("option");
                    option.value = data['cities'][i];
                    fragment.appendChild(option);
                }
                cities.appendChild(fragment);
            })
        })
    }

}

function validate_province_and_city(){
    console.log("fsdsf")
    const province = document.getElementById("state");
    const city = document.getElementById("city");

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

    if (! is_provinace){
        province.classList.add("error");
    }
    else{
        province.classList.remove("error");
    }

    if (! is_city){
        city.classList.add("error");
    }
    else{
        city.classList.remove("error");
    }

    return is_city && is_provinace;
}

function checkout_request(){
    load_view("/account/checkout","GET",null);
}

function deposit_request(){
    load_view("/account/deposit","GET",null);

}

function get_edit_shop_form(){
    load_view("/shop/edit/","GET",null);
}

function edit_shop(){
    const shop_form = document.querySelector("#shop_form");
    const data = new FormData(shop_form);
    const states = document.querySelector("#states").children;
    let selected_states = "";
    for (let i=0; i < states.length; i++){
        if( states[i].classList.contains("selected")){
            let t = states[i].innerText;
            selected_states += "," + t.slice(0,t.length - 1).trim();
        }
    }
    
    data.append("post_destinatinos", selected_states.slice(1,selected_states.length));
    const xhttp = new XMLHttpRequest()
    xhttp.open("POST", "/shop/edit/");
    xhttp.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
    // fetch("/shop/edit/",{
    //     method: "POST",
    //     header:
    //     {
    //         "X-CSRFToken": getCookie("csrftoken")
    //     },
    //     body: data

    // }).then((response) =>{
    //     if(response.ok){
    //         const sucess = document.getElementById("sucessful-edit").innerHTML;
    //         set_view(sucess);
    //     }
    // })
    xhttp.onload = () =>{
        if(xhttp.status == 200){
            const sucess = document.getElementById("sucessful-edit").innerHTML;
            set_view(sucess);
            end_waiting();
        }
    }
    start_waiting();
    xhttp.send(data);
}




/*********************ORDERS********************* */
function get_user_orders(){
    console.log('ordes...');    
    event.stopPropagation();
    showSidebox();
    start_waiting();
    fetch('/user/orders/',{
        method: "GET"
    }).then((res) => {
        
        res.text().then((txt)=>{
            end_waiting();
            set_view(txt);
        }
        );
    });
}

function get_shop_orders(){
    console.log('ordes...');    
    event.stopPropagation();
    showSidebox();
    start_waiting();
    fetch('/shop/orders/',{
        method: "GET"
    }).then((res) => {
        
        res.text().then((txt)=>{
            end_waiting();
            set_view(txt);
        }
        );
    });
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
    fetch(`/shop/order/<order_id>/detail/` + id + '/',{
        method: "GET"

    }).then((response) =>{
        
        response.text().then((txt) => {
            end_waiting();
            set_view(txt);
        })
    })
}

function accept_order(){
    const order_id = event.target.dataset['id'];
    start_waiting();
    fetch(`/shop/order/${order_id}/accept/`,{
        method: 'GET'
    }).then((response) => {
        response.text().then((txt) => {
            end_waiting();
            set_view(txt);
        })
    })
}
function reject_order(){
    const order_id = event.target.dataset['id'];
    start_waiting();
    fetch(`/shop/order/${order_id}/reject/`,{
        method: 'GET'
    }).then((response) => {
        response.text().then((txt) => {
            end_waiting();
            set_view(txt);
        })
    })
}
function cancell_order(){
    const order_id = event.target.dataset['id'];
    start_waiting();
    fetch(`/user/order/${order_id}/cancell/` ,{
        method: 'GET'
    }).then((response) => {
        response.text().then((txt) => {
            end_waiting();
            set_view(txt);
        })
    });
}
function recieve_order() {
    const order_id = event.target.dataset['id'];
    start_waiting();
    fetch(`/user/order/${order_id}/verify/`,{
        method: 'GET'
    }).then((response) => {
        response.text().then((txt) => {
            end_waiting();
            set_view(txt);
        })
    });
}

function send_tracking_code(){
    const order_id = event.target.dataset['id'];
    const tracking_code = document.getElementById('tracking_code').value
    start_waiting();
    fetch('/orders/tracking_code/' + order_id + '/' + "?tracking_code=" + tracking_code ,{
        method: 'GET',
        header: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    }).then((response) => {
        response.text().then((txt) => {
            end_waiting();
            set_view(txt);
        })
    })
}

/*********************COMMENTS******************* */

function get_comments(){

}

function leave_comment(){
    const title = document.getElementById("comment-title").value;
    const body = document.getElementById("comment-body").value;
    console.log(title,body)
    const product_id = event.target.dataset['id'];
   
    if(title != "" && body != ""){

        const xhttp = new XMLHttpRequest()
        const data = new FormData();
        data.append("comment_title",title);
        data.append("comment_body", body);
        xhttp.onload = ()=>{

            if( xhttp.status == 200){
                showSidebox();
                set_view(xhttp.responseText);
            }
        }
        xhttp.open("POST","/comments/product/" + product_id + "/leave/" );
        xhttp.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        xhttp.send(data);
       
    }

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

function validate_card(){
    const card = document.getElementById("merchan_card");
    
    if(! is_valid_card(card.value)){
        card.classList.add("error");
    }
    else{
        card.classList.remove("error");
    }
    
}