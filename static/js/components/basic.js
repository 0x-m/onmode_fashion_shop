




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


// function select_tab(){
//     const target = event.target;
//     if (target.classList.contains('tab-item')){
//         const tab_id = target.dataset['tab'];
//         console.log(tab_id);
//         const items = target.parentNode.children;
//         for (let i = 0; i < items.length; ++i){
//             items[i].classList.remove('tab-item-selected');
//         }
//         const contents = target.parentNode.parentNode.getElementsByClassName('tab-contents')[0].children;
//         for (let i=0; i < contents.length; ++i){
//             contents[i].classList.remove('tab-show-content');
//         }
//         target.classList.add('tab-item-selected');
//         document.getElementById(tab_id).classList.add('tab-show-content');

//     }

// }



