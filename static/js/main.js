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
            
    }
}

function listboxSelect_mono(){
    const item = event.target
    if(item){
        if(item.classList.contains("item")){
            const items = item.parentNode.getElementsByClassName("item")
            for(let i=0; i < items.length; ++i){
                items[i].classList.remove("selected")
               
            }
            item.classList.add("selected")
            
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
               
    if(event.target.classList.contains("inline-item")){
        var colors = event.target.parentNode.getElementsByClassName("inline-item");
        for (var i=0; i < colors.length; ++i){
            colors[i].classList.remove("inline-item--selected");
        }
        event.target.classList.toggle("inline-item--selected");
    }
}
function select_size(){
  if(event.target.classList.contains("inline-item")){
    var sizes = event.target.parentNode.getElementsByClassName("inline-item");
    for (var i=0; i < sizes.length; ++i){
        sizes[i].classList.remove("inline-item--selected");
    }
      event.target.classList.toggle("inline-item--selected");
  }
}


function select_multi_color(){
    console.log("multi color select")
    event.stopPropagation();
    if(event.target.classList.contains("inline-item")){
        event.target.classList.toggle("inline-item--selected");
    }
    
}
function select_multi_size(){
    event.stopPropagation();
  if(event.target.classList.contains("inline-item")){
      event.target.classList.toggle("inline-item--selected");
  }
}

function add_attr(){

    const attr = document.getElementById("attr-txt").value.trim();
    const val = document.getElementById('val-txt').value.trim();
    if (attr == '' || val == ''){
        console.log('emtpy');
        return
    }
  
    product_attrs.set(attr,val)
    var div = document.createElement("DIV");
    div.className = "attr";
    var sp1 = document.createElement("SPAN");
    sp1.innerText = attr + ':' + val;
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
  
    var t = event.target.parentNode.innerText;
    console.log(t);
    product_attrs.delete(t.split(":")[0]);
    console.log(product_attrs)
    event.target.parentNode.remove();
  }

