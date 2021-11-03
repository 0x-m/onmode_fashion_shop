
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
        color:black;
        font-size:0.8rem;
        
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

        
    }
    .selected {
        background-color: rgba(240,240,240,0.7);
    }
    .disabled {
        pointer-events: none;
        color: #efefef;
    }
    </style>

    <div part="container"  id="container">
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
            this.setAttribute('selected');
        }
        else {
            this._container.classList.remove('selected');
            this.removeAttribute('selected');
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
           
        }
        #container {
            background-color:white;
            display: flex;
            flex-direction: column;
            position: relative;
            border: 1px solid #efefef;
            padding: 0.2rem;
            
        }
        #items {
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            max-height: 250px;
            scroll-snap-type: y mandatory;

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

    <div part="container" id='container'>
        <input part="searchbox" type="text" placeholder="فیلتر..." id="searchBox">
        <div part="items" id="items">
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
