const textboxTemplate = document.createElement('template');
textboxTemplate.innerHTML = `
    <style>
        :host {
            position: relative;
            display:block;
            width:100%;
        }
        #container {
            position: relative;
            width:90%;

        }
        input[type="text"] {
            outline: none;
            border: 1px solid rgba(210,210,210,0.9);
            border-radius: 2px;
            appearance: none;
            color: #777;
            position: relative;
            padding: 0.6rem;
            width: 95%;

        }

        input[type="text"] + span {
            position: absolute;
            color:lightgray;
            top:50%;
            transform: translate(0,-50%);
            transition: 0.2s;
            pointer-events: none;
            padding:0.2rem
            margin-right:0.2rem;

        }
        input[type="text"]:focus {
            border-color: gray !important;
        }

        input[type="text"]:focus-within + span, .top {
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
        <input part="input" id="input" type="text">
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