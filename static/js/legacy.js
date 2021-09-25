function open_cart() {
    const d = document.getElementById('drawer');
    d.showLoader();
    d.open();
    fetch("/cart",{
        header :{
            'content-type':'application/x-www-form-urlencoded'
        }
    }).then((res) => {
        res.text().then((r)=>{
            d.hideLoader();
            d.setContent(r);
        })
    });
   
}

function checkout_cart() {
    const d = document.getElementById('drawer');
    d.showLoader();
    d.open();
    fetch("/cart/checkout",{
        header :{
            'content-type':'application/x-www-form-urlencoded'
        }
    }).then((res) => {
        res.text().then((r)=>{
            d.hideLoader();
            d.setContent(r);
        })
    });
   
}

function checkout() {

}

function increment_cart_badge() {
    console.log('increment...');
}

function decrement_cart_badge() {
    console.log('decrement....');
}

function open_search() {
    console.log('search...');
}

function open_dashboard() {
    const d = document.getElementById('drawer');
    d.showLoader();
    d.open();
    fetch("users/dashboard",{
        header :{
            'content-type':'application/x-www-form-urlencoded'
        }
    }).then((res) => {
        res.text().then((r)=>{
            d.hideLoader();
            d.setContent(r);
        })
    });
   
}

function open_favourites() {    
    console.log('favs...')

}

function open_mobile_menu() {
    console.log('menu....')
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


