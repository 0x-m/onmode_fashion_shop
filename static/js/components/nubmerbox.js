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