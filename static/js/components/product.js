
const product_template = document.createElement('template');
product_template.innerHTML = `

    <div class="product">
        <a class="link" href="#">
            <img class="preview"  style="width:100%" />
        </a> 
        <div class="detail">
            <p class="name"></p>
            <p class="price">
                <span class="realprice" ></span>&nbsp;&nbsp;
                <span class="offprice"></span>
            </p>
            <p class="action">
                <ion-icon id="a1" class="icon ml5" name="cart-outline" ></ion-icon>
                <ion-icon id="a2" class="icon ml5" name="heart-outline"></ion-icno>
            </p>
        </div>
        <p class="badge badge-top-left" style="background-color:green"></p>
    </div>

`;

class Product extends HTMLElement {
    constructor() {
        super();
        this.appendChild(product_template.content.cloneNode(true));
        this.addToCartEvent = new CustomEvent('addtocart', {
            bubbles: true,
            cancelable: false,
            composed: true
        });
        this.addToFavouriteEvent = new CustomEvent('addtofavourite', {
            bubbles: true,
            cancelable: false,
            composed: true
        });
        this._addToCart = this._addToCart.bind(this);
        this._addToFavs = this._addToFavs.bind(this);
        this._command = this._command.bind(this);
        this._edit = this._edit.bind(this);
        this._remove = this._remove.bind(this);

    }

    connectedCallback() {
        this._render();
        const a1 = this.querySelector('#a1');
        const a2 = this.querySelector('#a2');
        if (this.editable) {
           
            a1.addEventListener('click', this._remove);
            a2.addEventListener('click', this._edit)
        }
        else {
           
            a1.addEventListener('click', this._addToCart);
            a2.addEventListener('click', this._addToFavs)
        }
    }

    get link() {
        return this.getAttribute('link');
    }

    get preview() {
        return this.getAttribute('preview');
    }

    get title() {
        return this.getAttribute('title');
    }

    get price() {
        return this.getAttribute('price');
    }


    get discounted() {
        const val = this.getAttribute('discounted');
        return (val === '') || (val === 'true');

    }

    get discountedprice() {
        return this.getAttribute('discountedprice');
    }

    get numdiscount() {
        return this.getAttribute('numdiscount');
    }

    get numsaled() {
        return this.getAttribute('numsaled');
    }

    get editable() {
        const val = this.getAttribute('editable');
        return (val === '') || (val === 'true');
    }

    get pid() {
        return this.getAttribute('pid');
    }

    get badge() {
        //(new), (off % sale/total), (outofstock)
        return this.getAttribute('badge');
    }

    get badgeclass(){
        return this.getAttribute('badgeclass');
    }

    get incart() {
        const val = this.getAttribute('incart');
        return (val === '') || (val === 'true');
    }

    get infavs() {
        const val = this.getAttribute('infavs');
        return (val === '') || (val === 'true');
    }
    
    _command(cmd) {
        console.log('ccc..........');
        if (!(cmd === 'add' || cmd === 'remove' || cmd === 'edit'))
            return;
        console.log('command issued...');
        const xr = new XMLHttpRequest();
        xr.onload = function() {
            if (xr.status == 200)
            {
                const cartnum =document.getElementById('cart-num-badge');
                let num = cartnum.textContent;
                if (num == '')
                    num = 0;
                if (cmd == 'add'){
                    if (num < 99)
                        num = parseInt(num) + 1;
                    else
                        num = "+99";
                }
                else if(cmd == 'remove'){
                    if (num >= 1)
                        num = parseInt(num) - 1;
                }
                cartnum.textContent = num;
            }
            console.log('onload for xhr..')
        }
        if (cmd == 'add') {
            get('/cart/add/' + this.pid + '/');
            
        }
        else if (cmd == 'remove'){
            xr.open('get', '/cart/remove/' + this.pid + '/');
        }
        else if (cmd == 'edit'){
            console.log('edit');
        }
        xr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
        xr.send();
       
    }
    
    _addToCart() {
        get('/cart/add/' + this.pid + '/', function(resp, status) {
            update_cart_badge('increment');
        });
    }

    _addToFavs() {
        get('/favourites/add/' + this.pid + '/', function(resp, status) {

        });
    }

    _edit() {
        load_view('/product/eidt/' + this.pid + '/');
    }

    _remove() {
        get('/product/remove/' + this.pid + '/');
    }

    _render() {
        const parts = this.querySelectorAll('.link, .preview, .name, .realprice, .offprice, .badge');
        parts[0].href=this.link;
        parts[1].src = this.preview;
        parts[2].textContent = this.title;
        parts[3].textContent = this.price;
        parts[4].textContent = this.discountedprice;
        parts[5].classList.add(this.badgeclass);
        parts[5].textContent = this.badge;

        this._toggleEditable();
        this._toggleCartAction();
        this._toggleFavAction();

        if (this.discounted) {
            this.querySelector('.realprice').classList.add('line');
        }

        if (!this.badge) {
            this.querySelector('.badge').classList.add('hide');
        }

    }


    _toggleEditable() {
        if (this.editable) {
            const actions = this.querySelectorAll('#a1, #a2');
            actions[0].setAttribute('name', 'trash-outline');
            actions[1].setAttribute('name', 'pencil');
        }
    }

    _hideCartIcon() {
        this.querySelector('#a1').classList.add('hidden');
    }

    _hideFavIcon() {
        this.querySelector('#a2').classList.add('hidden');
    }
    _toggleCartAction() {
        if (!this.editable && this.incart) {
            this._hideCartIcon();
        }
    }

    _toggleFavAction() {
        if (!this.editable && this.infavs) {
            this._hideFavIcon();
        }
    }

}

customElements.define('om-product', Product);