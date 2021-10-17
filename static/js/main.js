let product_attrs = new Map()
 //--------------------searchbox-----------------------------------------------
 function toggle_search_box(){
    var box = document.getElementById("search-box");
    box.classList.toggle("show-box");
 }
 //----------------------------------------------------------------------------

function listboxSelect(){
    var item = event.target;
    if(item){
        if(item.classList.contains("item"))
            
            item.classList.toggle("selected");
            item.children[0].classList.toggle("show");
    }
}

function listboxSelect_mono(){
    const item = event.target
    if(item){
        if(item.classList.contains("item")){
            const items = item.parentNode.getElementsByClassName("item")
            for(let i=0; i < items.length; ++i){
                items[i].classList.remove("selected")
                items[i].children[0].classList.remove("show")
               
            }
            item.classList.add("selected")
            item.children[0].classList.add("show")
        }
    }
}
function listboxFilter (){
    var items = event.target.parentNode.getElementsByClassName("item");
    var txt = event.target.value;
    console.log(txt)
    for (var i=0; i < items.length; ++i){
        var val = items[i].innerText;
        
        if(val.indexOf(txt) > -1){
            items[i].style.display = "";
        }
        else{
            items[i].style.display = "none";
        }
    }

}

//-----------------------------------------------------------------------------------------


//------------------------------------------------------------------

 function iListSelect(){
     var item = event.target
     if(item){
         if(item != event.currentTarget){
             item.classList.toggle("selected");
         }
     }
 }


function select_color(){
               
    if(event.target.classList.contains("color")){
        var colors = event.target.parentNode.getElementsByClassName("color");
        for (var i=0; i < colors.length; ++i){
            colors[i].classList.remove("select-color");
        }
        event.target.classList.toggle("select-color");
    }
}
function select_size(){
  if(event.target.classList.contains("size")){
    var sizes = event.target.parentNode.getElementsByClassName("size");
    for (var i=0; i < sizes.length; ++i){
        sizes[i].classList.remove("select-size");
    }
      event.target.classList.toggle("select-size");
  }
}


function select_multi_color(){
    console.log("multi color select")
    event.stopPropagation();
    if(event.target.classList.contains("color")){
        event.target.classList.toggle("select-color");
    }
    
}
function select_multi_size(){
    console.log("multi size select")
    event.stopPropagation();
  if(event.target.classList.contains("size")){
      event.target.classList.toggle("select-size");
  }
}



function add_attr(){
  var t = document.getElementById("attr-txt").value;
  if (t.indexOf(":") < 0){
      return
  }
  k = t.toString().split(":");
  if (product_attrs.has(k[0])){
    product_attrs.set(k[0].trim(),k[1].trim());
      return;
  }
  product_attrs.set(k[0].trim(),k[1].trim());
  var div = document.createElement("DIV");
  div.className = "attr";
  var sp1 = document.createElement("SPAN");
  sp1.innerText = t;
  var sp2 = document.createElement("SPAN");
  sp2.innerHTML = "&times;";
  sp2.className = "close";
  sp2.addEventListener('click', delete_attr);
  div.appendChild(sp1);
  div.appendChild(sp2);
  document.getElementById("attr-list").appendChild(div);
  console.log(product_attrs)
}

function delete_attr(){
  console.log("aads");
  console.log(product_attrs)
  var t = event.target.parentNode.innerText;
  console.log(t);
  product_attrs.delete(t.split(":")[0]);
  console.log(product_attrs)
  event.target.parentNode.remove();
}

