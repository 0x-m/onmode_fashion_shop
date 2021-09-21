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