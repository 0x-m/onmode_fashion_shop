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

    static get observedAttributes() {
        return  ['value'];
    }

    get value() {
        return parseInt(this._value);
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    get maxValue() {
        return parseInt(this.getAttribute('maxValue') ?? 100);
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(numbox_template.content.cloneNode(true));
        this._increment = this._increment.bind(this);
        this._decrement = this._decrement.bind(this);
        this._value = this.value ?? 1;

        this.incrementEvent = new CustomEvent('onincrement', {
            bubbles: true,
            cancelable: true,
            composed: true
        });

        this.decrementEvent = new CustomEvent('ondecrement', {
            bubbles: true,
            cancelable: true,
            composed: true
        });

    }

    connectedCallback() {
        const btn_inc = this.shadowRoot.querySelector('#inc');
        const btn_dec = this.shadowRoot.querySelector('#dec');
        this._numDisplay = this.shadowRoot.querySelector('#num');
        btn_inc.addEventListener('click', this._increment);
        btn_dec.addEventListener('click', this._decrement);
    }

    attributeChangedCallback(name, oldval, newval) {
        if (newval === oldval) {
            return;
        }
        switch(name){
            case 'value':
                const v = parseInt(newval);
                if (v <= this.maxValue){
                    this.shadowRoot.querySelector('#num').textContent = newval;
                    this._value = newval;
                }
            break;
        }
    }

    _increment() {
        this.setAttribute('value', ++this.value);
        this.dispatchEvent(this.incrementEvent);
    }

    _decrement() {
        if (this._value > 1){
            this.setAttribute('value', --this.value);
            this.dispatchEvent(this.decrementEvent);
        }
        else {
            console.error('out of range...')
        }
    }

}

customElements.define('number-box', NumberBox);