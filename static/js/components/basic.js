



class Switch extends HTMLElement {
    get checked() {
        return this._checkbox.checked;
    }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                #checkbox {
                    font-size: 30px;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    width: 3rem;
                    height: 1.5rem;
                    background: transparent;
                    border: 1px solid lightgray;
                    border-radius: 3em;
                    position: relative;
                    cursor: pointer;
                    outline: none;
                    -webkit-transition: all .2s ease-in-out;
                    transition: all .2s ease-in-out;
                }
                #checkbox:after {
                    position: absolute;
                    content: "";
                    width: 1.5rem;
                    height: 1.5rem;
                    border-radius: 50%;
                    background: lightgray;
                    transform-origin: center,center;
                    -webkit-transform: scale(.7);
                    transform: scale(.7);
                    left: 0;
                    top: -1px;
                    -webkit-transition: all .2s ease-in-out;
                    transition: all .2s ease-in-out;
                }
                #checkbox:checked:after{
                    left: 1.4rem;
                    background-color: rgb(92, 92, 92);
                }
                #checkbox:checked {
                    border-color: gray;
                }
            </style>

            <input type="checkbox" id="checkbox">
        `;
        this._checkbox = this.shadowRoot.getElementById('checkbox');
        this._checkbox.checked = this.hasAttribute('checked') ? true : false;
        if (this.hasAttribute('onchange')) {
            console.log('hooked');
            this._checkbox.addEventListener('change', eval(this.getAttribute('onchange')));
        }
    }
}

customElements.define('om-switch', Switch);


const Itemtemplate = document.createElement('template');
Itemtemplate.innerHTML = `
    <style>
    :host {
        position: relative;
        margin-top: 2px;
    }
    #container {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        cursor: pointer;
        padding: 0.3rem;
        position: relative;
        scroll-snap-algin: center;
        
    }
    
    #container:hover {
        background-color: rgba(240,240,240,0.6);    
    }
    #icon {
        flex: 5%;
        pointer-events: none;
    }

    #caption {
        flex: 95%;
        display: block;
        margin-left: 3px;
        margin-right: 3px;
        font-size: 0.9rem;
        color: #aaa;
        
    }
    .selected {
        background-color: rgba(240,240,240,0.7);
    }
    .disabled {
        pointer-events: none;
        color: #efefef;
    }
    </style>

    <div  id="container">
        <span part="icon" id="icon">
            <slot></slot>
        </span>
        <span part="caption" id="caption"></span>
    </div>

`;

class ListboxItem extends HTMLElement {

    static get observedAttributes() {
        return ['selected', 'disabled', 'caption', 'value'];
    }

    get selected() {
        const val = this.getAttribute('selected');
        return (val === 'true') || (val === '') ? true : false;
    }

    set selected(value) {
        const bool_val = Boolean(value);
        this.setAttribute('selected', value);
    }

    get caption() {
        return this.getAttribute('caption');
    }

    set caption(value) {
        this.setAttribute('caption', value);
    }

    get disabled() {
        const val = this.getAttribute('disabled');
        return (val === 'true') || (val === '') ? true : false;
    }

    set disabled(value) {
        const boo_val = Boolean(value);
        this.setAttribute('disabled', value);
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(value) {
        this.setAttribute('value', value);
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(Itemtemplate.content.cloneNode(true));
        this._container = this.shadowRoot.querySelector('#container');
        this.shadowRoot.querySelector('#caption').textContent = this.getAttribute('caption');

    }

    connectedCallback() {
        this.#toggleSelect();
    }

    attributeChangedCallback(name, oldval, newval) {
        if (oldval === newval)
            return;
        switch(name) {
            case 'selected':
                this.#toggleSelect();
                break;
            case 'caption':
                this.#setCaption(newval);
                break;
            case 'disabled':
                this.#toggleDisabled();
                break;
        }
    }

    #toggleDisabled() {

        if (this.disabled) {
            this._container.classList.add('disabled');
        }
        else{
            this._container.classList.remove('disabled');
        }
    }
    #toggleSelect() {
        if (this.selected === true){
            this._container.classList.add('selected');
        }
        else {
            this._container.classList.remove('selected');
        }
    }

    #setCaption(txt) {
        this.shadowRoot.querySelector('#caption').textContent = txt;
    }


}

const listBoxTemplate  = document.createElement('template');
listBoxTemplate.innerHTML = `

    <style>
        :host {
            display: block;
            flex-direction: column;
            position: relative;
            overflow: auto;
           
        }
        #container {
            background-color:white;
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(240,240,240,0.9);
            position: relative;
            scroll-snap-type: y mandatory;
            
            
        }
        #items {
            display: flex;
            flex-direction: column;
        }
        #searchBox {
            position: sticky;
            top:0;
            left: 0;
            z-index: 10;
            display: none;
            outline: none;
            border: 1px solid #efefef;
            padding:0.3rem;
            margin: 0.2rem;
            color: #aaa;
        }

        .search-visible {
            display: block !important;
        }
        .hidden {
           display: none !important;
        }
        listbox-item::part(caption) {
            color: red !important;
        }
    </style>

    <div id='container'>
        <input type="text" id="searchBox">
        <div id="items">
            <slot></slot>
        </div>
    </div>
   
`;

class Listbox extends HTMLElement {

    static get observedAttributes() {
        return ['multiple', 'searchable']
    }

    get multiple() {
        const val = this.getAttribute('multiple');
        return (val === 'true') || (val === '') ? true : false;
    }

    set multiple(value) {
        this.setAttribute('multiple', Boolean(value));
    }

    get searchable(){
        const val = this.getAttribute('searchable');
        return (val === 'true') || (val === '') ? true : false;
    }

    set searchable(value) {
        this.setAttribute('searchable', Boolean(value));
    }

    get selectedItems(){
        return this._getSelectedItems();
    }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(listBoxTemplate.content.cloneNode(true));
        const _itemsBox = this.shadowRoot.querySelector('#items');
        const _searchbox = this.shadowRoot.querySelector('#searchBox');
        this._onitemsBoxClick = this._onitemsBoxClick.bind(this);
        this._filterItems = this._filterItems.bind(this);
        _itemsBox.addEventListener('click', this._onitemsBoxClick);
        _searchbox.addEventListener('keyup', this._filterItems);


    }

    connectedCallback() {
        this._items = Array.from(this.querySelectorAll('listbox-item'));
        console.log(this._items);
       

    }

    _filterItems(e) {
        this._items[0].classList.add('ad');
        let txt = e.target.value;
        this._items.forEach( item => {
            if (item.caption.indexOf(txt) < 0) {
                item.style.display = 'none';
            }
            else{
                item.style.display = 'block';
                item.classList.add('ad');
                console.log(item.className);
            }
         });
    }
    _selectItem(item) {
        if (!this.multiple)
            this._clearSelections();
        item.selected = !item.selected;
    }
    _onitemsBoxClick(e) {
        console.log('clicked');
        e.preventDefault();
        e.stopPropagation();
        const tag = e.target.tagName.toLowerCase();
        if ( tag === 'listbox-item'){
            console.log('inside');
            this._selectItem(e.target);
        }
    }
  

    _clearSelections() {
        this._items.forEach( item => {
            item.selected = false;
        });
    }

    _getSelectedItems() {
        return this._items.filter(item => item.selected === ture)
                          .map(item => item.value);
    }

    _toggleSearchBox() {
        const searchBox = this.shadowRoot.querySelector('#searchBox');
        console.log(searchBox);
        if (this.searchable) {
            searchBox.classList.add('search-visible');
        }
        else {
            searchBox.classList.remove('search-visible');
        }
    }
    attributeChangedCallback(name, oldval, newval) {
        if ( oldval === newval)
            return;
        switch(name) {
            case 'searchable':
                this._toggleSearchBox();
                break;
        }
    }

}

customElements.define('listbox-item', ListboxItem);
customElements.define('list-box', Listbox);


const itemTemplate = document.createElement('template');
itemTemplate.innerHTML = `
    <style>
        #container{
            display: flex;
            cursor: pointer;
            padding: 0.3rem;
            align-items: center;
            justify-content: flex-start;
            margin-top: 2px;
            
        }
        #container:hover  {
            background-color: rgba(240,240,240,0.6);
            
        }
        .selected {
            background-color: rgba(240,240,240,0.6) !important;
        }

        #icon {
            flex:4%;
            user-select: none;
            align-self: flex-start;
            pointer-events: none;
         
        }
        
        #caption {
            flex: 96%;
          
            user-select:none;
            margin-left: 8px;
            margin-right: 5px;
           
        }
     
    </style>

    <div id="container">
        <span part="icon" id="icon">
             <slot></slot>
        </span>
        <span part="caption" id="caption"></span>
    </div>
   
  
    
`;

class ComboBoxItem extends HTMLElement {

    static get observedAttributes() {
        return ['selected', 'disabled', 'value', 'caption'];
    }

    get selected() {
        return this.getAttribute('selected') === 'true' ? true : false;
    }

    set selected(value) {
        this.setAttribute('selected', value);
    }

    get caption() {
        return this.getAttribute('caption');
    }

    set caption(value) {
        this.setAttribute('caption', value);
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(value) {
        return this.setAttribute('value', value);
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(itemTemplate.content.cloneNode(true));
        this.shadowRoot.querySelector('#caption').textContent = this.getAttribute('caption');

    }

    attributeChangedCallback(name, oldval, newval) {
        if ( oldval === newval)
            return;
        console.log(newval, typeof newval)
        switch(name) {
            case 'selected':
                const container = this.shadowRoot.querySelector('#container');
                if (newval === 'true'){
                    container.classList.add('selected');
                }
                else if (newval === 'false'){
                    container.classList.remove('selected');
                }
                break;

            case 'caption':
               this.shadowRoot.querySelector('#caption').textContent = newval;
                break; 
                    
        }
    }
    
}


const num_template = document.createElement('template');

num_template.innerHTML = `
    <style>
        :host {
            display:block;
            position: relative;
        }
        #items{
            display: none;
            flex-direction: column;
            box-shadow: 0px 2px 5px #efefef;
            position: absolute;
            z-index: 100;
            background-color: white;
            width: 100%;

        }
        #selectedBox {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid rgba(240,240,240,1);
            padding: 0.1rem;
            cursor: pointer;
            position: relative;

        }
        #selectedItems {
            flex:96%;
            user-select: none;
            display:flex;
            position: relative;
            overflow-x: auto;

            
        }
        #selectedBox:hover {
            background-color: rgba(250,250,250,0.5);
        }
        #arrow {
            direction: ltr;
            flex: 4%;
            transform: rotate(90deg);
            font-size: 0.6rem;
            text-align: center;
            color: #aaa;
            transform-origin: center center;
            margin: 0 2px 0 6px;
        }
        .rotate{
            transform: rotate(-90deg) !important;
        }

        .chips {
            margin-left: 2px;
            margin-right: 2px;
            background-color: rgba(250,250,250,0.7);
            display: flex;
            align-items:center;
            justify-content: space-between;
            padding:0px;
            
        }

        .cross {
            display:block;
            text-align: center;
            color: #aaa;
            font-size: 1.1rem;
            margin: 0px;
            padding-top:4px;
        }
        .cross:hover {
            color: gray;
        }
        .placeholder {
            color: #aaa;
            padding:0.3rem;
            font-size: 0.8rem;
        }

    </style>

    <div id="selectedBox" part="selectedBox">
        <div part="selectedItems" id="selectedItems"></div>
        <span id="arrow">&#10095;</span>
    </div>
    
    <div id="items">
        <slot id="items_slot"></slot>
    </div>


`;

class ComboBox extends HTMLElement {
    
    static get observerAttributes() {
        return ['selectedItem', 'multiple', 'isOpen'];
    }

    get isOpen(){
        return this._isOpen;
    }

    get multiple() {
        const val = this.getAttribute('multiple');
        return (val === 'true') || (val === '') ? true : false;
    }
    set multiple(value) {
        const val = Boolean(value);
        this.setAttribute('multiple', value);
    }


    get selectedItems() {
        return this._get_selected_items();
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(num_template.content.cloneNode(true));
        this._itemsBox = this.shadowRoot.querySelector('#items');
        this._selectedBox = this.shadowRoot.querySelector('#selectedBox');
        this._isOpen = false;
        this._clearAll = this._clearAll.bind(this);
        this._slotchange = this._slotchange.bind(this);
        this._multiple = false;
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this._selectItem = this._selectItem.bind(this);
        this._deselectItem = this._deselectItem.bind(this);
        this._onSelectedBoxClick = this._onSelectedBoxClick.bind(this);
        this._itemsBox.addEventListener('click', this._selectItem);


    }

    _get_selected_items() {
        return this._items.filter(item => item.selected == true).map(item => item.value);
    }
    _toggleArrow() {
        const arrow = this.shadowRoot.querySelector('#arrow');
        if(this.isOpen){
            arrow.classList.add('rotate');
        }
        else {
            arrow.classList.remove('rotate');
        }
    }
    connectedCallback () {
        this._selectedBox.addEventListener('click', this._onSelectedBoxClick);
        document.addEventListener('click', (e) => { 
            console.log('clic:', e.target.id)
            if(e.target.tagName.toLowerCase() !== 'combo-box-item'){
                this.close();
            }
            
        });
        this.addEventListener('slotchange', this._slotchange);
        const items_slot = this.shadowRoot.querySelector('#items_slot');
        items_slot.addEventListener('slotchange', this._slotchange);
        this._items = Array.from(this.querySelectorAll('combo-box-item'));
        this._items.forEach( (item, i) => {
            if (!item.id) {
                item.setAttribute('id', 'item-' + i);
            }
        });
        this._setPlaceholder();

        }

        _slotchange() {

            this._items = Array.from(this.querySelectorAll('combo-box-item'));
            this._items.forEach( (item, i) => {
                if (!item.id) {
                    item.setAttribute('id', 'item-' + i);
                }
            });
            console.log('in slot change....');
            console.log(this);

        }


    _setPlaceholder() {
        const placeholder = document.createElement('span');
        placeholder.textContent = this.getAttribute('placeholder') || ' ';
        placeholder.classList = 'placeholder';
        this.shadowRoot.querySelector('#selectedItems').replaceChildren(placeholder);
    }
    _clearPlaceholder() {
        const placeholder = this.shadowRoot.querySelector('.placeholder');
        if (placeholder)
            this.shadowRoot.querySelector('.placeholder').remove();
    }
    _selectItemMultiple(item) {
        const chips = document.createElement('div');
        chips.className = 'chips';
        item.style.pointerEvents = 'none';
        chips.appendChild(item);
        const cross = document.createElement('span');
        cross.innerHTML = '&times;';
        cross.className = 'cross';
        chips.appendChild(cross);
        cross.addEventListener('click', this._deselectItem);
        return chips;
    }

    _deselectItem(e) {
        e.stopPropagation();
        let id = e.target.previousElementSibling.id
        id = id.slice(0, id.length - 1);
        e.target.parentNode.remove();
        this.querySelector('#' + id).selected = false;
        if (this.selectedItems.length == 0) {
            this._setPlaceholder();
        }
    }
    _selectItem(e) {
        console.log('select item...')
        if(e.target.tagName.toLowerCase() === 'combo-box-item'){
            this._clearPlaceholder();
            const selectedItems = this.shadowRoot.querySelector('#selectedItems');
            if(e.target.selected === true){
                console.log('already selected');
                return;
            }
            if(!this.multiple){
                const selectedCount = this.selectedItems.length;
                selectedItems.replaceChildren(e.target.cloneNode(true));
                this._clearAll();

                e.target.selected = true;
                this.close();
            }
            else {
                const selectedItem = e.target.cloneNode(true);
                selectedItem.setAttribute('id', e.target.id + 's');
                const item = this._selectItemMultiple(selectedItem);
                selectedItems.appendChild(item);
                e.target.selected = true;
            }

        }
    }

    _clearAll() {
        console.log('clear....');
        console.log(this._items);
        this._items.forEach( item => {
            item.selected = false;
        });
    }


    _onSelectedBoxClick(e){
        e.stopPropagation();
        e.preventDefault();
        
        if (this.isOpen) {
            this.close();
        }
        else{
            this.open();
        }      
    }

    open() {
        this._itemsBox.style.display = "flex";
        this._toggleArrow();
        this._isOpen = true;
        this._toggleArrow();
    }

    close() {
        this._itemsBox.style.display = "none";
        this._toggleArrow();
        this._isOpen = false;
        this._toggleArrow();
    }

    attributeChangedCallback(name, oldvalue, newval) {
        if (oldvalue === newval) 
            return;
        switch(name) {
            case "selectedItem":
                this._selectItem = newval;
                this.shadowRoot.querySelector('#selectedtext').innerHTML = 
                    this.querySelector('#' + newval);
                break;
            
            case 'multiple':
                this._multiple = Boolean(newval);
                break;
        }
    }
}

customElements.define('combo-box', ComboBox);
customElements.define('combo-box-item', ComboBoxItem);


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


const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            padding: 0;
            margin: 0;
        }
        #container {
            background-image: url('../1.jpg');
            
            background-position: center;
            background-size: cover;
            background-repeat: no-repeat;
            width; 100%;
            height: 100%;
            cursor: pointer;
            border: 1px dashed rgba(210,210,210);
            user-select: none;
            text-align: center;
            position: relative;

        }
        #container:hover {
            background-color: rgba(240,240,240,0.3);
            background-blend-mode: hard-light;
        }
        .disabled {
            pointer-events: none;
        }
        input[type="file"] {
            position: absolute;
            top: -100%;
            width: 0px;
            height: 0px;
        }
        .center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        #loading {
            display: none; 
        }
        #placeholder {
            display: none;
        }
        .no-border {
            border: none  !important;
        }
        .visible {
            display: block !important;
        }
    </style>
    <input id="input" accept=".jpg,.jpeg,.png,.webp,.gif" type="file" >
    <div part="container" id='container'>
        <slot class="center" id="loading" name="loading"></slot>
        <slot class="center" id="placeholder" name="placeholder"></slot>
    </div>

`;

class ImageField extends HTMLElement {

    static get observedAttributes() {
        return ['loading', 'disabled'];

    }

    get initial() {
        return this.getAttribute('initial');
    }

    get loading(){
        const val = this.getAttribute('loading');
        return ( val === 'true') || ( val === '') ? true : false;
    }

    set loading(value) {
        this.setAttribute('loading', Boolean(value));
    }

    get disabled() {
        const val = this.getAttribute('disabled');
        return ( val === 'true' ) || ( val === '' ) ? true : false;
    }

    set disabled(value) {
        this.setAttribute('disabled', Boolean(value));
    }   

    get file() {
        return this._file;
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        const _container = this.shadowRoot.getElementById('container');
        this._handleClick = this._handleClick.bind(this);
        this._readerOnLoad = this._readerOnLoad.bind(this);
        this._onChange = this._onChange.bind(this);
        this._toggleDisabled = this._toggleDisabled.bind(this);
        this._togglePlaceholder = this._togglePlaceholder.bind(this);
        this._toggleLoading = this._toggleLoading.bind(this);
        this.shadowRoot.querySelector('#input').addEventListener('change', this._onChange);
        _container.addEventListener('click', this._handleClick);
        this.shadowRoot.querySelector('#container').style.backgroundImage = this.initial ? 'url(' + this.initial + ')' : 'none';
        this._file = null;
        this._src = this.getAttribute('src');
        this._maxAllowedSize = this.getAttribute('maxsize');

    }
    connectedCallback() {
        this._togglePlaceholder();
    }

    attributeChangedCallback(name, oldval, newval) {
        if (oldval === newval)
            return;
        switch(name) {
            case 'disabled':
                this._toggleDisabled();
                break;
            case 'loading':
                this._toggleLoading();
        }
    }

    _handleClick(e){
        this.shadowRoot.querySelector('#input').click();   
    }

    _onChange(e) {

        const files = e.target.files;
        if (files.length > 0) {
            this._file = files[0];
            this._readImage(files[0]);
            this._togglePlaceholder();
        }

    }
    _readImage(img) {
        const reader = new FileReader();
        reader.onload = this._readerOnLoad;
        reader.readAsDataURL(img);
    }

    _readerOnLoad(e) {
        this.shadowRoot.querySelector('#container').style.backgroundImage = `url(${e.target.result})`;
    }


    _toggleLoading() {
        const loading = this.shadowRoot.querySelector('#loading');

        if (this.loading) {
            loading.classList.add('visible');
        }
        else {
            loading.classList.remove('visible');
        }
    }
    _toggleDisabled() {
        const container = this.shadowRoot.querySelector('#container');
        if (this.disabled)
            container.classList.add('disabled');
        else{
            container.classList.remove('disabled');
        }
            
    }

    _togglePlaceholder() {
        console.log('placeholder');
        const placeholder = this.shadowRoot.querySelector('#placeholder');
        const container = this.shadowRoot.querySelector('#container');
        console.log(placeholder);
        if (this.initial || this.file) {
            placeholder.classList.remove('visible');
            container.classList.add('no-border');
        }
        else {
            placeholder.classList.add('visible');
            container.classList.remove('no-boarder');
        }
    }

}

customElements.define('image-field', ImageField);

const numbox_template = document.createElement('template');
numbox_template.innerHTML = `

<style>
    :host {
        display: block;
    }
    #container {
        display: flex;
        border: 1px solid #efefef;
        user-select: none;
        background:white;
    }
    #inc, #dec {
        flex: 25%
        outline: none;
        border:none;
        padding:0.3rem;
        background-color:white;
        text-align: center;
        cursor: pointer;
        color: #777;
        font-size:1.1rem;


    }

    #num {
        flex: 50%;
        color: #aaa;
        text-align: center;
        padding: 0.4rem;
        font-size: 1rem;
        background: white;
     
        
    }
</style>

<div id='container'>
    <button id='inc'>&plus;</button>
    <span id='num'></span>
    <button id='dec'>&minus;</button>
</div>

`;

class NumberBox extends HTMLElement {
    get value() {
        return this._value;
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(numbox_template.content.cloneNode(true));
        this._increment = this._increment.bind(this);
        this._decrement = this._decrement.bind(this);
        let initial = this.getAttribute('initial');
        initial = parseInt(initial);
        this._value = initial > 0 ? initial : 1;

    }

    connectedCallback() {
        const btn_inc = this.shadowRoot.querySelector('#inc');
        const btn_dec = this.shadowRoot.querySelector('#dec');
        this._numDisplay = this.shadowRoot.querySelector('#num');
        btn_inc.addEventListener('click', this._increment);
        btn_dec.addEventListener('click', this._decrement);
        this._updateDisplay();
    }

    _updateDisplay() {
        this._numDisplay.textContent = this._value;
    }
    _increment() {
        this._value++;
        this._updateDisplay();
    }

    _decrement() {
        if (this._value > 1){
            this._value--;
            this._updateDisplay();
        }
        else {
            console.error('out of range...')
        }
    }

}

customElements.define('number-box', NumberBox);


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
        const parts = this.querySelectorAll('.link, .preview, .name, .realprice, .offprice, .badge');
        parts[0].setAttribute('href',this.link);
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

const textboxTemplate = document.createElement('template');
textboxTemplate.innerHTML = `
    <style>
       :host{
           display:block;
           position: relative;
       }
        #container {
            width: 100%;            
        }
        .inp {
            outline: none;
            border: 1px solid rgba(210,210,210,0.9);
            border-radius: 1px;
            appearance: none;
            color: #777;
            padding: 0.6rem;
            width: 92%;

        }

        .inp + span {
            position: absolute;
            color:lightgray;
            top:50%;
            transform: translate(0,-50%);
            transition: 0.2s;
            pointer-events: none;
            padding:0.2rem
            margin-right:0.2rem;

        }
        .inp:focus {
            border-color: gray !important;
        }

        .inp:focus-within + span, .top {
            top: -2% !important;
            font-size: 0.8rem;
            background-color: white !important;
            color: gray !important;
            
        }

        .err {
            border-color: red !important;
        }

        .error {
            color: red;
            font-size: 0.8rem
        }
        /*:host-context([dir="rtl"]) span {
            right: 6px;
        }
        :host-context([dir="ltr"]) span {
            left: 6px;
        }*/ /* NOT SUPPORTED BY ALL BROWSERS*/
        
    </style>
    <div id='container'>
        <input part="input" id="input" class="inp" type="text">
        <span part="placeholder" id="placeholder"></span>
    </div>
    <span class="error" id="error"></span>
    

`;
class CustomText extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(textboxTemplate.content.cloneNode(true));
        const pholder = shadowRoot.querySelector('#placeholder');
        const dir = this.hasAttribute('dir') ? this.getAttribute('dir') : 'rtl';
        if (dir == 'ltr'){
            pholder.style.left = '6px';
        }
        else if (dir == 'rtl') {
            pholder.style.right = '6px';
        }

       const text = shadowRoot.querySelector('#input');
       this._text = text;

       if (this.password){
            text.type = 'password';    
       }

       if(this.autocomplete) {
           text.setAttribute('autocomplete', 'new-password');
       }
       pholder.textContent = this.getAttribute('placeholder');
       
        text.addEventListener('blur', (e) => {
            if(text.value.length > 0) {
                pholder.classList.add('top');
                
            }
            else{
                pholder.classList.remove('top');
            }
        });

    }

    get password() {
        const val = this.getAttribute('password');
        return (val === '') || (val === 'true');
    }

    get autocomplete() {
        const val = this.getAttribute('autocomplete');
        return (val === '') || (val === 'true');
    }
    get text() {
        return this._text.value;
    }

    get placeholder() {
        this.getAttribute('placeholder');
    }

    connectedCallback() {
      
    }
   error(txt) {
        this.shadowRoot.querySelector('#error').textContent = txt;
        this._text.classList.add('err');
   }

   clean() {
       this.shadowRoot.querySelector('#error').textContent = '';
       this._text.classList.remove('err');
   }

}

customElements.define('custom-text', CustomText);


function select_tab(){
    const target = event.target;
    if (target.classList.contains('tab-item')){
        const tab_id = target.dataset['tab'];
        console.log(tab_id);
        const items = target.parentNode.children;
        for (let i = 0; i < items.length; ++i){
            items[i].classList.remove('tab-item-selected');
        }
        const contents = target.parentNode.parentNode.getElementsByClassName('tab-contents')[0].children;
        for (let i=0; i < contents.length; ++i){
            contents[i].classList.remove('tab-show-content');
        }
        target.classList.add('tab-item-selected');
        document.getElementById(tab_id).classList.add('tab-show-content');

    }

}


//ListMenu
//MenuItem
//MenuGroup

const menuItemTemplateHTML = ``;
const menuGroupTemplateText = ``;
const listMenuTemplateText = ``;


class MenuItem extends HTMLElement {

    static get observedAttributes(){
        return ['caption'];
    }

    get caption() {
        return this._caption;
    }

    set caption(value) {
        this.setAttribute('caption', value);
    }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                :host {
                    cursor: pointer;
                }
                #caption {
                    font-size: 1rem;
                    padding: 0.8rem;
                    cursor: pointer;
                    display: block;
                    transition: 0.5s all;
                    border-bottom: 1px solid #efefef;
                }
                #caption:hover {
                    background-color: rgba(240,240,240,0.5);
                }
            </style>

            <span id="caption"></span>
        `;
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._caption = this.shadowRoot.querySelector('#caption');

    }

    attributeChangedCallback(name, oldval, newval) { 
        if (newval === oldval)
            return;

        switch(name) {
            case 'caption':
                this._caption.textContent = newval;
                break;
            default:
                return;
        }
    }

}

class MenuItemGroup extends HTMLElement {

    static get observedAttributes() {
        return ['caption', 'show'];
    }

    get show() {
        return this.hasAttribute('show');
    }

    set show(value) {
        const pr = Boolean(value);
        if (value) {
            this.setAttribute('show');
        }
        else {
            this.removeAttribute('show');
        }
    }
    get caption() {
        return (this.hasAttribute('caption') ? this.getAttribute('caption') : undefined);
    }

    set caption(value) {
        if (value) {
            this.setAttribute('caption', value);
        }
        else{
            this.removeAttribute('caption');
        }
        
    }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                :host {
                    cursor: pointer;
                    display:block;
                }
               
                #container {
                    display: flex;
                    flex-direction: column;
                  
                }
              
                #items {
                    display: none;
                    flex-direction:column
                }
                #caption {
                    padding: 0.8rem;
                    font-size: 1rem;
                    user-select: none;
                    pointer-events: none;
                    display: block;
                    flex: 90%;
                }
               
              
                #header {
                    display: flex;
                    align-items: center;
                    transition: 0.5s all;
                    border-bottom: 1px solid #efefef;
                }
                #header:hover {
                    background-color: rgba(240,240,240,0.5) !important;
                    
                }
                #arrow {
                    font-size: 0.6rem;
                   
                    padding: 0.4rem;
                }
            </style>

            <div id="header">
                <span id="caption"></span>
                <span id="arrow">&#10095;</span>
            </div>
            

            <div id="container">
                <section id="items">
                    <slot></slot>
                </section>
            </div>
        
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._caption = this.shadowRoot.querySelector('#caption');

    }

    _toggleShow() {
        const disp = this.shadowRoot.querySelector('#items');
        disp.style.display = disp.style.display == 'none' ? 'flex': 'none';
    }

    attributeChangedCallback(name, oldval, newval) {
        if ( newval === oldval) 
            return;
        switch(name) {
            case 'caption' :
                this._caption.textContent = newval;
                break;
            case 'show':
                this.querySelector('#items')
            default:
                return;
        }
    }


}

class ListMenu extends HTMLElement {
    static get observedAttributes() {
        return ['caption']
    }

    get caption() {
        return this.getAttribute('caption');
    }

    set caption(value){
        return this.setAttribute('caption', value);
    }
    constructor() {
        super();

        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                #container {
                    display: flex;
                    flex-direction: column;
                    
                }
                #main {
                    display: flex;
                    flex-direction: column;
                    transform-origin: center center;
                }
                #caption {
                    flex: 80%;
                    color: gray;
                    font-size: 1rem;
                    display: block;
                    
                    margin: 2px;
                    cursor: pointer;
                    padding: 0.5rem;
                }
                #header:hover {
                    background-color: rgba(240,240,240,0.5);

                }
                #header{
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid #efefef;
                    user-select: none;
                    display: none;
                }
              #arrow{
                  font-size: 0.7rem;
                  color: gray;
                  pointer-events: none;
                  padding: 0.4rem
              }
            </style>
            
            <div id="container">
                <div id="header">
                    <span id="caption"></span>
                    <span id="arrow">&#10095;</span>
                </div>
                <section id="main">
                    <slot></slot>
                </section>
            </div>
        `;

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this._history = new Array();
        const cont = document.createElement('div');
        cont.innerHTML = this.innerHTML;
        this._main = this.shadowRoot.querySelector('#main');
        this._caption = this.shadowRoot.querySelector('#caption');
        this._prevMenu = this._prevMenu.bind(this);
        this._updateView = this._updateView.bind(this);
        this.addEventListener('click', this._handleClick);
        this._caption.addEventListener('click', this._prevMenu);
        this._default_header = undefined;
        
        

    }

    connecteCallback() {
        
    }
    attributeChangedCallback(name, oldval, newval) {
        if (name == 'caption') {
            if (this._default_header == undefined){
                this._default_header = newval;
            }
            this._caption.textContent = newval;
            console.log('list menu caption changed');
        }
    }
    _allGroups() {
        return Array.from(this.querySelector('menu-group'));
    }
    _updateView(menu) {
       
        this.shadowRoot.querySelector('#main').animate(
            [
                {transform: 'translateX(100px)'},
                {transform: 'translateX(0)'}
            ],
            {
                duration: 300,
                easing: 'ease-in-out'
            }
        )
   
        const obj = document.createElement('menu-group');
        obj.setAttribute('caption', this.caption);
        obj.innerHTML = this.innerHTML;
        this._history.push(obj);
        this.innerHTML = menu.innerHTML;
        this.setAttribute('caption', 'بازگشت');
        if (this._history.length >= 1) {
            this.shadowRoot.querySelector("#header").style.display = "flex";
        }

        
    }

    _handleClick(e) {
        console.log('handle click----------');
        console.log(e.target.tagName);
        if(e.target.tagName.toLowerCase() == 'menu-group'){
            
            this._updateView(e.target);
        }
    }
    
    _prevMenu(){
        const length = this._history.length;
        if(length > 0) {

            this.shadowRoot.querySelector('#main').animate(
                [
                    {transform: 'translateX(-100px)'},
                    {transform: 'translateX(0)'}
                ],
                {
                    duration: 300,
                    easing: 'ease-in-out'
                }
            )
            const prev = this._history.pop()
            console.log(prev);
            this.innerHTML = prev.innerHTML;
            if (length == 1){
                this.shadowRoot.querySelector('#header').style.display = "none";
            }
            //this.setAttribute('caption', prev.caption);
         
        }
    }
}

customElements.define('menu-item', MenuItem);
customElements.define('menu-group', MenuItemGroup);
customElements.define('list-menu', ListMenu);


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


function openDrawer() {
    const d = document.getElementById('drawer');
    // fetch("/test/",{
    //     header :{
    //         'content-type':'application/x-www-form-urlencoded'
    //     }
    // }).then((res) => {
    //     res.text().then((r)=>{
    //         d.setContent(r);
    //     })
    // })
    const s = document.getElementById('mobile_menu');
    d.setcc(s.content.cloneNode(true));
    d.open();

}

function zaa() { 
    const d = document.getElementById('drawer');

    fetch("/product/add/",{
        header :{
            'content-type':'application/x-www-form-urlencoded'
        }
    }).then((res) => {
        res.text().then((r)=>{
            d.setContent(r);
        })
    })
    d.open();
    
}

function asd() {
    const d = document.getElementById('drawer');
    fetch("/test",{
        header :{
            'content-type':'application/x-www-form-urlencoded'
        }
    }).then((res) => {
        res.text().then((r)=>{
            d.setContent(r);
        })
    })
    d.open();
}

// let product_attrs = new Map()
// function add_attr(){
    
//     //   if (window.product_attrs == null){
//     //      window.product_attrs = new Map();
//     //   }
//       var t = document.getElementById("attr-txt").value;
//       if (t.indexOf(":") < 0){
//           return
//       }
//       k = t.toString().split(":");
//       if (product_attrs.has(k[0])){
//         product_attrs.set(k[0].trim(),k[1].trim());
//           return;
//       }
//       product_attrs.set(k[0].trim(),k[1].trim());
//       var div = document.createElement("DIV");
//       div.className = "attr";
//       var sp1 = document.createElement("SPAN");
//       sp1.innerText = t;
//       var sp2 = document.createElement("SPAN");
//       sp2.innerHTML = "&times;";
//       sp2.className = "close";
//       sp2.addEventListener('click', delete_attr);
//       div.appendChild(sp1);
//       div.appendChild(sp2);
//       document.getElementById("attr-list").appendChild(div);
//       console.log(product_attrs)
    
    
//     }
//     function delete_attr(){
    
//       console.log("aads");
//       console.log(product_attrs)
//       var t = event.target.parentNode.innerText;
//       console.log(t);
//       product_attrs.delete(t.split(":")[0]);
//       console.log(product_attrs)
//       event.target.parentNode.remove();
//     }