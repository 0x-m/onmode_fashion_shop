

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
    xhttp.open("GET", "/product/add_edit/");
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

    xhttp.open("GET","/favourites/")
    xhttp.send();
}

function openDialog(){
    const img1 = document.getElementById("img-1")
    

}

function changeimg(){
    const id = event.target.dataset['img'];
    const img = document.getElementById(id);
    const prod_img_id = img.dataset['id'];
    const file = event.target.files[0];
    console.log(file)
    console.log(prod_img_id)
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () =>{
        if (xhttp.status == 200){
            path = xhttp.responseText;
            img.src = path;
            console.log("changed...");
        }
    }

    xhttp.open("POST", "shops/change_image/")
    const data = new FormData();
    data.append("image",file);
    data.append("id",prod_img_id);
    xhttp.setRequestHeader("X-CSRFToken",getCookie("csrftoken"));
    xhttp.send(data);
    
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

function product_form(){
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
    console.log("----------------")
    console.log(attrs);
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

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
        document.getElementById("side-box-content").innerHTML = xhttp.responseText;
        console.log("done...")
        console.log(xhttp.responseText)


    }
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
    console.log(data.get("images"));
    xhttp.open("POST", "/product/add_edit/");
    xhttp.setRequestHeader("X-CSRFToken",getCookie("csrftoken"));
    xhttp.send(data);

}

function filter_product(){

    console.log("submitting....")

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