//--------------------------combobox-----------------------------------------
let product_attrs = new Map()
function openCombobox(){
    event.stopPropagation();
    event.preventDefault();
   // document.getElementById("drop").classList.toggle("show");
   var dropid = event.target.dataset["dropdown"];
   document.getElementById(dropid).classList.toggle("show");
   var toggle = event.target.children[0]; //toggle is the first child of event source!
   toggle.classList.toggle("up-arrow");
    
}

function comboboxSelectItem()
{
     var dropdown = event.currentTarget;
     var item = event.target; //clicked item

     if(item.classList.contains("item")){ //if an item was been clicked not dropdown container

         var items = dropdown.getElementsByClassName("item");
         //deselect all items----------------------
         for (var i=0; i < items.length; ++i){
             items[i].classList.remove("selected"); 
             
         }
         //-----------------------------------------

         item.classList.add("selected"); //select clicked item

         //add item's text and toggle icon to combobox header
         var sp = document.createElement("span");
         sp.classList.add("toggle");
         dropdown.parentNode.children[0].innerText = item.innerText;
         dropdown.parentNode.children[0].append(sp);
         //--------------------------------------------------
         
     }
 
}

// document.getElementsByClassName("combobox")

 window.addEventListener("click",()=>{
  var dropdowns = document.getElementsByClassName("dropdown");
  for(var i=0; i<dropdowns.length; ++i){
      dropdowns[i].classList.remove("show");
  }
});

//-------------------------------------------------------------------
//----------------------------------------
//-----------------slide show-------------

const slideshows = document.getElementsByClassName("slideshow");
for(let i=0; i < slideshows.length; i++){
    sessionStorage.setItem(slideshows[i].id,"0");
}

function nextSlide(){
    const ss = event.target.closest(".slideshow");
    var curr_slide = parseInt(sessionStorage.getItem(ss.id));
    showSlide((curr_slide + 1));
}

function prevSlide() {
    const ss = event.target.closest(".slideshow");
    var curr_slide = parseInt(sessionStorage.getItem(ss.id));
    showSlide((curr_slide + 1));
}

 function showSlide(n){
   const ss = event.target.closest(".slideshow");
   console.log(ss);
   const  slides = ss.getElementsByClassName("slide");
   console.log("num of" + slides.length);
   const dots = ss.getElementsByClassName('dot');
   let curr_slide = parseInt(sessionStorage.getItem(ss.id));
   
   if (n >= slides.length) { 
       curr_slide = 0; 
     }
   else if (n < 0) { 
       curr_slide = slides.length - 1;
     }
   else {
       curr_slide = n;
   }

   var i = 0;
   for (; i < slides.length; ++i) 
   {
       slides[i].classList.remove("dis-block");
       dots[i].classList.remove("active");
   }

   slides[curr_slide].classList.add("dis-block");
   dots[curr_slide].classList.add("active");
   sessionStorage.setItem(ss.id,curr_slide.toString());
   console.log(sessionStorage.getItem(ss.id),"session");

 }


 //--------------------searchbox-----------------------------------------------
 function toggle_search_box(){
    var box = document.getElementById("search-box");
    box.classList.toggle("show-box");
 }
 //----------------------------------------------------------------------------

var slider = document.getElementById("price-slider");
var val = document.getElementById("slider-val");
val.innerHTML = parseInt(slider.value) * 1000 + "  تومان";
slider.oninput= function() {
    val.innerHTML = parseInt(this.value) * 1000 + "  تومان";
};

function listboxSelect(){
    var item = event.target;
    
    if(item){
        if(item.classList.contains("item"))
            
            item.classList.toggle("selected");
            item.children[0].classList.toggle("show");
           // console.log(item.children[0]);
            //item.children[0].classList.toggle("visi");
            //  ele[0].classList.toggle("visi");
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

function show()
{
    document.getElementById("filter-box").classList.toggle("show");
}
//-----------------------------------------------------------------------------------------

//-------------------------numberbox-------------------------------
function increment() {
    var txt = event.target.parentNode.children[1];
    txt.value = (parseInt(txt.value) + 1).toString();
}
function decrement() {
    var txt = event.target.parentNode.children[1];
    var n = (parseInt(txt.value) - 1);
    if( n < 1){
        return
    }
    txt.value = (parseInt(txt.value) - 1).toString();
}
//------------------------------------------------------------------

//-------------------gallery -----------------------
function changeHero() {
    const src = event.target.src;
    const hero = document.getElementById("hero");  
    if (src){
        hero.src = src;
    }
 }
 //--------------------------------------------------
 function iListSelect(){
     var item = event.target
     if(item){
         if(item != event.currentTarget){
             item.classList.toggle("selected");
         }
     }
 }
 //--------------------------------------------------

 function showSidebox(){
    document.getElementById("overlay").classList.add("show");
    document.getElementById("side-box").classList.add("side-box-show");
    document.body.classList.add("overflow-hidden");
}

function closeSidebox(){
    document.getElementById("overlay").classList.remove("show");
    document.getElementById("side-box").classList.remove("side-box-show");
    document.getElementById("side-box-content").innerHTML = "";
    document.body.classList.remove("overflow-hidden");
}
/******************************** */

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
    
//   if (window.product_attrs == null){
//      window.product_attrs = new Map();
//   }
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