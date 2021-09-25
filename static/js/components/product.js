
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
    }

    connectedCallback() {
        this._render();
        const a1 = this.querySelector('#a1');
        const a2 = this.querySelector('#a2');
        if (this.editable) {
            console.log('editable');
            a1.addEventListener('click', this._remove);
            a2.addEventListener('click', this._edit)
        }
        else {
            console.log('normal..');
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

    
    _addToCart() {
        console.log('add to cart');
    }

    _addToFavs() {
        console.log('add to favs');
    }

    _edit() {
        console.log('edit....')
    }

    _remove() {
        console.log('remove..');
    }

    _render() {
        console.log(this.title, this.badge, this.price, this.discountedprice)
        const parts = this.querySelectorAll('.link, .preview, .name, .realprice, .offprice, .badge');
        console.log(parts);
        console.log('------------');
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