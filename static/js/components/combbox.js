
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