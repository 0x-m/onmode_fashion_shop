const favTemplate = document.createElement('template');
favTemplate.innerHTML = `
    
    <div class="fav-item">
        <img class="preview" style="width:96px">
        <ion-icon id="remove"  name="close-outline" class="icon remove"></ion-icon>
        <ion-icon  id="cart" name="cart-outline" class="icon addtocart"></ion-icon>
        <span class="fav-badge"></span>
        <div class="detail">
            <h4 class="title"></h4>
            <h5 class="boutique"></h5>
            <p class="description"></p>
            <h5 class="price"></h5>
        </div>
    </div>
`;


class FavouriteItem extends HTMLElement {

    constructor() {
        super();
        this.appendChild(favTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        this._render();
        this._setHandllers();
    }

    _setHandllers() {
        const elems = this.querySelectorAll('#remove, #cart');
        elems[0].addEventListener('click', this._remove);
        elems[1].addEventListener('click', this._addToCart);
    }
    get link() {
        return this.getAttribute('link');
    }

    get preview() {
        return this.getAttribute('preview')
    }

    get boutique() {
        return this.getAttribute('boutique');
    }
    
    get title() {   
        return this.getAttribute('title');

    }

    get description() {
        return this.getAttribute('description')
    }

    get price() {
        return this.getAttribute('price');
    }

    get badge() {
        return this.getAttribute('badge');
    }

    get badgeclass() {
        return this.getAttribute('badgeclass');
    }

    get incart() {
        const val = this.getAttribute('incart');
        return (val === '') || (val === 'true');
    }


    _render() {
        const parts = this.querySelectorAll('.preview, .fav-badge, .title, .boutique, .description, .price');
        parts[0].src = this.preview;
        parts[1].textContent = this.badge;
        parts[1].classList.add(this.badgeclass);
        parts[2].textContent = this.title;
        parts[3].textContent = this.boutique;
        parts[4].textContent = this.description;
        parts[5].textContent = this.price;
        

        this._hideBage();
        this._hideCartIcon();   

    }

    _hideCartIcon() {
        if(this.incart) {
            this.querySelector('.addtocart').classList.add('hide'); 
        }
    }

    _hideBage() {
        if (!this.badge) {
            this.querySelector('.badge').classList.add('hide');
        }
    }
    _addToCart() {
        console.log('add to cart');
    }

    _remove() {
        console.log('remove...');
    }


}

customElements.define('fav-item', FavouriteItem);